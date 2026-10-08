import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UserResponseDto } from './dto/user-response.dto.js';
import { User, UserDocument, UserType } from './schemas/user.schema.js';
import { Role } from '../../common/enums/role.enum.js';
import { normalizeCity, SERVICE_CITIES } from '../../shared/constants/service-cities.js';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface.js';
import { istTimestamp } from '../../shared/helpers/ist-time.helper.js';

const SALT_ROUNDS = 10;

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly logger = new Logger(UsersService.name);

  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

  /**
   * Keeps the collection's indexes in sync with the schema on boot. Needed
   * because the (email, userType) compound uniqueness replaced an earlier
   * single-field unique index on `email` — Mongoose won't drop the old one
   * automatically, so without this, duplicate-email registrations for a
   * different userType would still be wrongly rejected on databases created
   * before this change.
   */
  async onModuleInit(): Promise<void> {
    try {
      await this.userModel.syncIndexes();
    } catch (error) {
      this.logger.warn(`Failed to sync User indexes: ${(error as Error).message}`);
    }
  }

  /** Maps a Mongoose user document to its public API shape. Public so AuthService can reuse it. */
  toResponse(user: UserDocument): UserResponseDto {
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      userType: user.userType ?? null,
      phone: user.phone ?? null,
      city: user.city ?? null,
      state: user.state ?? null,
      isBlocked: user.isBlocked ?? false,
      createdAt: istTimestamp(user.createdAt ?? new Date()),
      updatedAt: istTimestamp(user.updatedAt ?? new Date()),
    };
  }

  /**
   * Only a superuser may modify (edit/delete/block) another superuser's
   * account. A plain admin acting on a superuser target is rejected —
   * superusers themselves are unrestricted (see RolesGuard's superuser
   * bypass for route-level access; this is the additional per-target check).
   */
  private assertCanModifyTarget(target: UserDocument, actor: AuthenticatedUser): void {
    if (target.role === Role.SUPERUSER && actor.role !== Role.SUPERUSER) {
      throw new ForbiddenException('Only a superuser can modify another superuser account');
    }
  }

  private assertValidId(id: string): void {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`"${id}" is not a valid user ID`);
    }
  }

  /** Hashes a plaintext password. Shared by UsersService and AuthService. */
  static async hashPassword(plain: string): Promise<string> {
    return bcrypt.hash(plain, SALT_ROUNDS);
  }

  private describeAccountType(userType: UserType | null | undefined): string {
    return userType ? `${userType} ` : '';
  }

  /**
   * Creates a user record. Used by admin-managed creation, self-registration
   * and the seeder.
   *
   * Uniqueness is scoped to (email, userType) — the same email can own a
   * separate buyer account, seller account, and admin/type-less account.
   *
   * `actor` gates which roles may be handed out. Omit it only for trusted
   * internal callers (the seeder; AuthService.register, which hard-codes
   * Role.USER) — an HTTP-facing path must always pass one, or the check below
   * cannot run.
   */
  async create(dto: CreateUserDto, actor?: AuthenticatedUser): Promise<UserResponseDto> {
    // Privilege escalation guard. Without this an admin could mint a
    // superuser account and use it to block or delete the real superuser —
    // `update()` has always blocked *promoting* someone to superuser, but
    // creation was an open back door to exactly the same outcome. Handing out
    // elevated roles is a superuser's job.
    if (actor && dto.role && dto.role !== Role.USER && actor.role !== Role.SUPERUSER) {
      throw new ForbiddenException(
        `Only a superuser can create ${dto.role} accounts. Admins can create user accounts only.`,
      );
    }

    if (dto.role === Role.ADMIN) {
      await this.assertCityIsFree(dto.city, null);
    }

    const userType = dto.userType ?? null;
    const existing = await this.userModel.findOne({ email: dto.email.toLowerCase(), userType });
    if (existing) {
      throw new ConflictException(
        `A ${this.describeAccountType(userType)}account with email "${dto.email}" already exists`,
      );
    }

    const passwordHash = await UsersService.hashPassword(dto.password);
    const user = await this.userModel.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
      role: dto.role,
      userType,
      phone: dto.phone ?? null,
      city: dto.city ?? null,
      state: dto.state ?? null,
    });

    return this.toResponse(user);
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.userModel.find().sort({ createdAt: -1 });
    return users.map((u) => this.toResponse(u));
  }

  async findOne(id: string): Promise<UserResponseDto> {
    this.assertValidId(id);
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    return this.toResponse(user);
  }

  /**
   * Internal lookup by (email, userType) for authentication — includes the
   * passwordHash. `userType` disambiguates which account to authenticate
   * against when the same email owns multiple accounts (buyer/seller/admin).
   * Pass `null` (or omit) to match the admin / type-less account.
   */
  async findAccountForAuth(
    email: string,
    userType: UserType | null = null,
  ): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ email: email.toLowerCase(), userType })
      .select('+passwordHash');
  }

  /** Internal lookup by ID for JWT strategy — returns the raw document. */
  async findDocumentById(id: string): Promise<UserDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.userModel.findById(id);
  }

  /** Internal lookup by ID that also includes the passwordHash — used by AuthService.changePassword. */
  async findDocumentByIdForAuth(id: string): Promise<UserDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.userModel.findById(id).select('+passwordHash');
  }

  /**
   * Enforces one admin per city. Two admins on the same city would both see
   * that city's queue and `findAdminForCity` would pick between them
   * arbitrarily, which is precisely the "who is meant to handle this?"
   * ambiguity the per-city model exists to remove. `excludeId` lets an
   * existing admin be re-saved without colliding with itself.
   */
  private async assertCityIsFree(city: string | null | undefined, excludeId: Types.ObjectId | null): Promise<void> {
    const serviceCity = normalizeCity(city);
    if (!serviceCity) {
      throw new BadRequestException(
        `An admin must be assigned to one of the cities we operate in: ${SERVICE_CITIES.join(', ')}`,
      );
    }
    const holder = await this.userModel.findOne({
      role: Role.ADMIN,
      userType: null,
      city: serviceCity,
      ...(excludeId && { _id: { $ne: excludeId } }),
    });
    if (holder) {
      throw new ConflictException(
        `${serviceCity} already has an admin (${holder.email}). Each city has exactly one admin desk.`,
      );
    }
  }

  /**
   * The admin desk that runs `city` — the one account that verifies, and
   * handles every visit/negotiation/purchase for, properties in that city.
   *
   * truEstate launched in four cities and each has exactly one admin (seeded
   * from `cityAdmins` in config); there is no all-cities admin account any
   * more. A property in an unserviced city therefore resolves to `null` and
   * is only visible to the superuser — which is why sellers can only pick
   * from the fixed city list in the first place (see CreatePropertyDto).
   */
  async findAdminForCity(city?: string | null): Promise<UserDocument | null> {
    const serviceCity = normalizeCity(city);
    if (!serviceCity) return null;
    return this.userModel.findOne({ role: Role.ADMIN, userType: null, city: serviceCity });
  }

  async update(id: string, dto: UpdateUserDto, actor: AuthenticatedUser): Promise<UserResponseDto> {
    this.assertValidId(id);
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    this.assertCanModifyTarget(user, actor);
    // Also block *promoting* someone to superuser unless the actor already is one.
    if (dto.role === Role.SUPERUSER && actor.role !== Role.SUPERUSER) {
      throw new ForbiddenException('Only a superuser can grant the superuser role');
    }

    const nextEmail = dto.email ? dto.email.toLowerCase() : user.email;
    const nextUserType = dto.userType !== undefined ? dto.userType : user.userType;
    const identityChanged = nextEmail !== user.email || nextUserType !== user.userType;

    if (identityChanged) {
      const conflict = await this.userModel.findOne({
        email: nextEmail,
        userType: nextUserType,
        _id: { $ne: user._id },
      });
      if (conflict) {
        throw new ConflictException(
          `A ${this.describeAccountType(nextUserType)}account with email "${nextEmail}" already exists`,
        );
      }
    }

    const nextRole = dto.role ?? user.role;
    const nextCity = dto.city !== undefined ? dto.city : user.city;
    if (nextRole === Role.ADMIN && (dto.role !== undefined || dto.city !== undefined)) {
      await this.assertCityIsFree(nextCity, user._id as Types.ObjectId);
    }

    if (dto.email !== undefined) user.email = dto.email;
    if (dto.name !== undefined) user.name = dto.name;
    if (dto.role !== undefined) user.role = dto.role;
    if (dto.userType !== undefined) user.userType = dto.userType;
    if (dto.phone !== undefined) user.phone = dto.phone;
    if (dto.city !== undefined) user.city = dto.city;
    if (dto.state !== undefined) user.state = dto.state;
    if (dto.isBlocked !== undefined) user.isBlocked = dto.isBlocked;

    await user.save();
    return this.toResponse(user);
  }

  async remove(id: string, actor: AuthenticatedUser): Promise<void> {
    this.assertValidId(id);
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    this.assertCanModifyTarget(user, actor);
    await user.deleteOne();
  }

  /**
   * Sets a new password. Used by AuthService for both forgot-password (which
   * emails a generated password) and change-password.
   *
   * The `$unset` clears leftovers from the retired reset-token flow, so an
   * account that still carries a token from before the switch cannot have it
   * used against a password that has since changed.
   */
  async resetPassword(userId: string, newPasswordHash: string): Promise<void> {
    await this.userModel.updateOne(
      { _id: userId },
      {
        $set: { passwordHash: newPasswordHash },
        $unset: { passwordResetTokenHash: '', passwordResetExpires: '' },
      },
    );
  }
}

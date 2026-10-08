import { Injectable, Logger, UnauthorizedException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { Role } from '../../common/enums/role.enum.js';
import { UsersService } from '../users/users.service.js';
import { MailService } from '../mail/mail.service.js';
import { UserDocument } from '../users/schemas/user.schema.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { AuthResponseDto } from './dto/auth-response.dto.js';
import { ForgotPasswordDto } from './dto/forgot-password.dto.js';
import { ForgotPasswordResponseDto } from './dto/forgot-password-response.dto.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { JwtPayload, AuthenticatedUser } from './interfaces/authenticated-user.interface.js';

/**
 * A stored password is a bcrypt hash — the original is not recoverable, by
 * anyone, ever. "Email me my password" therefore means: generate a fresh
 * one, save it, and email that. This is the generated password's length.
 */
const TEMP_PASSWORD_LENGTH = 12;

// No 0/O/1/l/I — these arrive in an email and get typed by hand, and a
// password nobody can transcribe correctly is a support ticket.
const TEMP_PASSWORD_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';

/** Cryptographically random temporary password (not Math.random). */
function generateTemporaryPassword(): string {
  const bytes = randomBytes(TEMP_PASSWORD_LENGTH);
  let out = '';
  for (let i = 0; i < TEMP_PASSWORD_LENGTH; i++) {
    out += TEMP_PASSWORD_ALPHABET[bytes[i] % TEMP_PASSWORD_ALPHABET.length];
  }
  return out;
}

/** Parses simple duration strings ("1d", "12h", "30m", "45s") into seconds. */
function parseExpiryToSeconds(expiresIn: string): number {
  const match = /^(\d+)(s|m|h|d)$/.exec(expiresIn.trim());
  if (!match) return Number(expiresIn) || 86400;
  const value = Number(match[1]);
  const unit = match[2];
  const multipliers: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
  return value * multipliers[unit];
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  private issueToken(user: UserDocument): AuthResponseDto {
    const payload: JwtPayload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    };
    const expiresIn = this.configService.get<string>('jwt.expiresIn')!;

    return {
      accessToken: this.jwtService.sign(payload),
      tokenType: 'Bearer',
      expiresIn: parseExpiryToSeconds(expiresIn),
      user: this.usersService.toResponse(user),
    };
  }

  /**
   * Public self-registration. Always creates a Role.USER account and logs
   * them in. The same email may separately register as a buyer and a
   * seller — accounts are disambiguated by (email, userType).
   */
  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    await this.usersService.create({
      name: dto.name,
      email: dto.email,
      password: dto.password,
      role: Role.USER,
      userType: dto.userType,
      phone: dto.phone,
    });

    // Re-fetch the exact account just created (scoped by userType too, in
    // case this email already owns a different-typed account) to sign a
    // token from it.
    const user = await this.usersService.findAccountForAuth(dto.email, dto.userType ?? null);
    return this.issueToken(user!);
  }

  /**
   * `dto.userType` selects which account to authenticate against when an
   * email owns more than one (buyer vs. seller vs. admin). Omit it for
   * admin accounts. A mismatched userType is treated the same as a wrong
   * password — no account-existence is leaked either way.
   */
  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.usersService.findAccountForAuth(dto.email, dto.userType ?? null);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.isBlocked) {
      throw new ForbiddenException('This account has been blocked. Please contact an administrator.');
    }

    return this.issueToken(user);
  }

  /**
   * Emails a brand-new password straight to the (email, userType) account,
   * per explicit user request ("send the password to the email itself"
   * rather than a reset link).
   *
   * The account's existing password cannot be sent: it is stored only as a
   * bcrypt hash and is not recoverable. So this *replaces* it with a
   * generated one and emails that — meaning a forgot-password request
   * immediately invalidates the old password, whether or not the person who
   * made the request is the account owner. That is the trade-off of this
   * flow versus a reset link, which leaves the old password working until
   * the real owner clicks through.
   *
   * Always resolves and never reveals whether the account exists (the
   * response is identical either way) to avoid account enumeration. The
   * generated password is never returned in the API response — only emailed.
   */
  async forgotPassword(dto: ForgotPasswordDto): Promise<ForgotPasswordResponseDto> {
    const user = await this.usersService.findAccountForAuth(dto.email, dto.userType ?? null);
    if (!user) {
      // Same shape as the "found" path's early return — callers can't
      // distinguish "no account" from "email delivery is async".
      return {};
    }

    const temporaryPassword = generateTemporaryPassword();
    const passwordHash = await UsersService.hashPassword(temporaryPassword);
    await this.usersService.resetPassword(user._id.toString(), passwordHash);

    await this.mailService.sendNewPasswordEmail(user.email, user.name, temporaryPassword, user.userType ?? null);

    this.logger.log(`New password emailed for ${user.email} (${user.userType ?? 'admin/superuser'}).`);

    return {};
  }

  /**
   * Self-service password change for a logged-in user — unlike
   * forgot/reset, this requires proving the *current* password rather than
   * an emailed token, so no reset-token bookkeeping is involved.
   */
  async changePassword(actor: AuthenticatedUser, dto: ChangePasswordDto): Promise<void> {
    const user = await this.usersService.findDocumentByIdForAuth(actor.id);
    if (!user) {
      throw new UnauthorizedException('Account not found');
    }

    const currentMatches = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!currentMatches) {
      throw new BadRequestException('Current password is incorrect');
    }

    const newPasswordHash = await UsersService.hashPassword(dto.newPassword);
    await this.usersService.resetPassword(user._id.toString(), newPasswordHash);
  }
}

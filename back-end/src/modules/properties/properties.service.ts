import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter, Types } from 'mongoose';
import { CreatePropertyDto } from './dto/create-property.dto.js';
import { UpdatePropertyDto } from './dto/update-property.dto.js';
import { PropertyResponseDto } from './dto/property-response.dto.js';
import { ReviewQueueFilterDto } from './dto/review-queue-filter.dto.js';
import { Property, PropertyDocument } from './schemas/property.schema.js';
import { ListingFilterDto } from '../listings/dto/listing-filter.dto.js';
import { Role } from '../../common/enums/role.enum.js';
import { UserType } from '../users/schemas/user.schema.js';
import { SubscriptionsService } from '../subscriptions/subscriptions.service.js';
import { FeaturedTier } from '../../shared/enums/billing.enum.js';
import { FEATURED_PACKS } from '../../shared/constants/pricing.js';
import { referenceId } from '../../shared/helpers/reference-id.helper.js';
import { PropertyVerificationStatus, PropertyStatus, ListingType } from '../../shared/enums/property.enum.js';
import { backfillObjectIdStrings } from '../../shared/helpers/objectid-backfill.helper.js';
import {
  ServiceCity,
  SERVICE_CITIES,
  CITY_STATE,
  FALLBACK_CITY,
  citySpellings,
  normalizeCity,
} from '../../shared/constants/service-cities.js';
import { UsersService } from '../users/users.service.js';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface.js';
import { istTimestamp } from '../../shared/helpers/ist-time.helper.js';

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UploadedFileInfo {
  url: string;
  originalName: string;
}

const MAX_PAGE_SIZE = 50;

function isElevated(role: Role): boolean {
  return role === Role.ADMIN || role === Role.SUPERUSER;
}

@Injectable()
export class PropertiesService implements OnModuleInit {
  private readonly logger = new Logger(PropertiesService.name);

  constructor(
    @InjectModel(Property.name) private readonly propertyModel: Model<PropertyDocument>,
    private readonly usersService: UsersService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  /**
   * Backfills `verificationStatus` (and friends) on properties persisted
   * before this field existed. Mongoose schema `default`s only apply to
   * *new* documents — a query like `{ verificationStatus: 'verified' }`
   * never matches a stored document where the field is simply absent, so
   * without this, every pre-existing listing would silently vanish from
   * public search on first boot after this field was introduced.
   */
  async onModuleInit(): Promise<void> {
    try {
      await this.propertyModel.updateMany(
        { verificationStatus: { $exists: false } },
        {
          $set: {
            verificationStatus: PropertyVerificationStatus.VERIFIED,
            sellerId: null,
            documents: [],
            rejectionReason: null,
          },
        },
      );
    } catch (error) {
      this.logger.warn(`Failed to backfill legacy Property documents: ${(error as Error).message}`);
    }
    await backfillObjectIdStrings(this.propertyModel, ['adminId', 'sellerId'], this.logger);
    await this.syncCityAdmins();
  }

  /**
   * Points every listing at the admin who runs its city, and canonicalises
   * legacy city spellings ("Bengaluru" -> "Bangalore") along with the state
   * that follows from them.
   *
   * Runs on boot because `adminId` is what the admin queues filter on: a
   * listing created before the per-city desks existed (or created while its
   * city's admin account hadn't been seeded yet) would otherwise sit in
   * nobody's queue. A listing in a city we don't operate in (Mumbai,
   * Gurugram, ...) is moved to the `FALLBACK_CITY` desk for the same reason:
   * leaving it on an unserviced city leaves it with no admin at all, which
   * is strictly worse than filing it at head office.
   */
  private async syncCityAdmins(): Promise<void> {
    try {
      for (const city of SERVICE_CITIES) {
        const admin = await this.usersService.findAdminForCity(city);
        if (!admin) continue;
        await this.propertyModel.updateMany(
          { city: { $in: citySpellings(city) }, $or: [{ adminId: { $ne: admin._id } }, { city: { $ne: city } }] },
          { $set: { adminId: admin._id, city, state: CITY_STATE[city] } },
        );
      }

      // Anything still outside the four launch cities — an unserviced city no
      // alias resolves, or a missing city — goes to the fallback desk. This
      // runs after the loop above so a recognised legacy spelling
      // ("Bengaluru") reaches its own desk first and is never swept up here.
      const fallbackAdmin = await this.usersService.findAdminForCity(FALLBACK_CITY);
      if (fallbackAdmin) {
        const adopted = await this.propertyModel.updateMany(
          { city: { $nin: SERVICE_CITIES } },
          {
            $set: {
              city: FALLBACK_CITY,
              state: CITY_STATE[FALLBACK_CITY],
              adminId: fallbackAdmin._id,
            },
          },
        );
        if (adopted.modifiedCount) {
          this.logger.log(
            `Moved ${adopted.modifiedCount} listing(s) in unserviced cities to the ${FALLBACK_CITY} desk (${fallbackAdmin.email}).`,
          );
        }
      }
    } catch (error) {
      this.logger.warn(`Failed to sync per-city property admins: ${(error as Error).message}`);
    }
  }

  /**
   * `includeDocuments` gates the private verification-documents array —
   * true only when the caller is the admin/superuser or the owning seller
   * (see the `documents` field doc on PropertyResponseDto). `images` are
   * always included; they're the buyer-facing photos.
   */
  private toResponse(p: PropertyDocument, includeDocuments = false): PropertyResponseDto {
    // `sellerId`/`adminId` may come back populated (from the review-queue
    // query) as a full User subdocument rather than a bare ObjectId.
    const seller = p.sellerId as unknown as {
      _id?: Types.ObjectId;
      name?: string;
      email?: string;
      phone?: string | null;
      createdAt?: Date;
    } | null;
    const sellerIsPopulated = !!seller && typeof seller === 'object' && 'name' in seller;

    return {
      id: p._id.toString(),
      title: p.title,
      description: p.description,
      type: p.type,
      listingType: p.listingType,
      price: p.price,
      areaSqft: p.areaSqft,
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      address: p.address,
      city: p.city,
      state: p.state,
      status: p.status,
      images: p.images,
      adminId: p.adminId ? p.adminId.toString() : null,
      sellerId: sellerIsPopulated ? seller!._id!.toString() : p.sellerId ? p.sellerId.toString() : null,
      verificationStatus: p.verificationStatus,
      rejectionReason: p.rejectionReason ?? null,
      // Featured state is derived, never trusted from storage: an expired
      // promotion reports isFeatured=false while keeping its history.
      isFeatured: !!p.featuredUntil && p.featuredUntil.getTime() > Date.now(),
      featuredTier: p.featuredTier ?? null,
      featuredUntil: p.featuredUntil ? istTimestamp(p.featuredUntil) : null,
      ...(includeDocuments && {
        documents: (p.documents ?? []).map((d) => ({
          url: d.url,
          originalName: d.originalName,
          uploadedAt: istTimestamp(d.uploadedAt ?? new Date()),
        })),
      }),
      // Populated on the admin review queue only. The admin's "Sellers Under
      // Me" list is built by grouping that queue by seller, so it needs enough
      // to actually contact them and to say how long they've been listing.
      ...(sellerIsPopulated && {
        sellerName: seller!.name,
        sellerEmail: seller!.email,
        sellerPhone: seller!.phone ?? null,
        sellerSince: seller!.createdAt ? istTimestamp(seller!.createdAt) : null,
      }),
      createdAt: istTimestamp(p.createdAt ?? new Date()),
      updatedAt: istTimestamp(p.updatedAt ?? new Date()),
    };
  }

  /** Whether `actor` may see `property`'s private verification documents. */
  private canSeeDocuments(property: PropertyDocument, actor?: AuthenticatedUser): boolean {
    if (!actor) return false;
    if (isElevated(actor.role)) return true;
    return !!property.sellerId && property.sellerId.toString() === actor.id;
  }

  private assertValidId(id: string, label = 'property'): void {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`"${id}" is not a valid ${label} ID`);
    }
  }

  /** Loads a property or throws 404. Internal helper shared by mutating methods. */
  private async loadOrThrow(id: string): Promise<PropertyDocument> {
    this.assertValidId(id);
    const property = await this.propertyModel.findById(id);
    if (!property) {
      throw new NotFoundException(`Property with ID "${id}" not found`);
    }
    return property;
  }

  /**
   * Throws unless `actor` is the superuser, the admin who runs the
   * property's city, or the seller who owns it. An admin from another city
   * has no more power over this listing than a stranger does.
   */
  private assertCanManage(property: PropertyDocument, actor: AuthenticatedUser): void {
    if (actor.role === Role.SUPERUSER) return;
    if (actor.role === Role.ADMIN) {
      this.assertRunsCity(property.city, actor, 'manage this listing');
      return;
    }
    if (property.sellerId && property.sellerId.toString() === actor.id) return;
    throw new ForbiddenException('You do not have permission to manage this property');
  }

  /**
   * Creates a property. **Seller accounts only** — an admin or superuser
   * cannot list a property, on explicit user instruction: properties belong
   * to sellers, and an admin's power over the catalogue is limited to
   * verifying, rejecting and deleting. That also keeps every listing
   * answerable in negotiation, since only the owning seller can move a price
   * (see NegotiationsService.assertCanRespond) — an admin-created listing
   * would have nobody able to accept an offer on it.
   *
   * The submission starts PENDING and stays hidden from public search until
   * an admin verifies it.
   */
  async create(dto: CreatePropertyDto, actor: AuthenticatedUser): Promise<PropertyResponseDto> {
    if (actor.userType !== UserType.SELLER) {
      throw new ForbiddenException(
        isElevated(actor.role)
          ? 'Admins and superusers cannot list properties — only a seller can. Admins verify, reject and delete listings.'
          : `Only seller accounts can list a property. You are signed in as a ${actor.userType ?? 'non-seller'} account (${actor.email}).`,
      );
    }

    await this.assertListingQuota(actor.id);

    const property = await this.propertyModel.create({
      ...dto,
      status: dto.status ?? undefined,
      images: dto.images ?? [],
      // Derived from the chosen city, never sent by the client — see
      // CreatePropertyDto.
      state: CITY_STATE[dto.city],
      // The listing is filed with the admin who runs that city; they are the
      // only admin who will ever see it in their verification queue.
      adminId: await this.resolveCityAdminId(dto.city),
      sellerId: actor.id,
      verificationStatus: PropertyVerificationStatus.PENDING,
    });

    return this.toResponse(property, true);
  }

  /**
   * A listing slot only counts against the quota while it is *live* — a
   * rejected submission or a property that has already sold frees its slot
   * back up. Billing a seller for a listing they can no longer sell would be
   * indefensible, and it is also what makes the free tier genuinely usable.
   */
  /**
   * How many listings count against this seller's plan quota: **every
   * property on the account**, including ones already sold or rented.
   *
   * An earlier version let a closed listing release its slot, on the
   * reasoning that you cannot sell a property twice. In practice that made
   * the limit unpredictable — a seller holding two properties, one of them
   * sold, could still add a third, which reads exactly like the quota is
   * broken. A plan now caps the total size of a seller's portfolio, full
   * stop. Deleting a listing is the way to free a slot without upgrading.
   *
   * Public so BillingService can report the same figure the check enforces —
   * a banner that says "1 of 2 used" while the server rejects the next
   * submission is worse than no banner at all.
   */
  async countListingsForQuota(sellerId: string): Promise<number> {
    if (!Types.ObjectId.isValid(sellerId)) return 0;
    return this.propertyModel.countDocuments({ sellerId });
  }

  /**
   * Enforces the seller's plan quota before a new listing is accepted.
   *
   * Answers 402 Payment Required rather than 403: the request is perfectly
   * legitimate, the account simply needs a bigger plan — and the frontend
   * keys its "upgrade your plan" prompt off that exact status.
   */
  private async assertListingQuota(sellerId: string): Promise<void> {
    const plan = await this.subscriptionsService.activePlan(sellerId);
    const used = await this.countListingsForQuota(sellerId);
    if (this.subscriptionsService.hasListingHeadroom(plan, used)) return;

    throw new HttpException(
      {
        statusCode: HttpStatus.PAYMENT_REQUIRED,
        message:
          `Your ${plan.definition.name} plan allows ${plan.definition.listingQuota} ` +
          `propert${plan.definition.listingQuota === 1 ? 'y' : 'ies'} and you already have ${used}. ` +
          `Sold listings still count towards your limit — upgrade your plan to list more, ` +
          `or delete a listing you no longer need.`,
        error: 'Listing quota reached',
        planTier: plan.tier,
        listingQuota: plan.definition.listingQuota,
        listingsUsed: used,
      },
      HttpStatus.PAYMENT_REQUIRED,
    );
  }

  /**
   * Applies a paid promotion to a listing. Called only by BillingService,
   * after a payment signature has been verified.
   *
   * A promotion bought while another is still running *extends* it rather
   * than truncating it, so a seller who buys two packs back to back gets
   * both weeks they paid for.
   */
  async applyFeature(propertyId: string, tier: FeaturedTier, sellerId: string): Promise<PropertyResponseDto> {
    const property = await this.loadOrThrow(propertyId);
    if (referenceId(property.sellerId) !== sellerId) {
      throw new ForbiddenException('You can only promote your own listings');
    }
    if (property.verificationStatus !== PropertyVerificationStatus.VERIFIED) {
      throw new BadRequestException(
        'Only a verified listing can be promoted — this one is still awaiting admin verification.',
      );
    }
    const pack = FEATURED_PACKS[tier];
    const now = new Date();
    const from = property.featuredUntil && property.featuredUntil > now ? property.featuredUntil : now;
    const until = new Date(from);
    until.setDate(until.getDate() + pack.days);

    property.featuredUntil = until;
    // Keep the stronger badge when an extension is bought at a lower tier.
    if (!property.featuredTier || pack.rank >= (FEATURED_PACKS[property.featuredTier]?.rank ?? 0)) {
      property.featuredTier = tier;
      property.featuredRank = pack.rank;
    }
    await property.save();
    this.logger.log(`Property ${propertyId} promoted (${tier}) until ${until.toISOString()}`);
    return this.toResponse(property);
  }

  /**
   * Everything CommissionsService needs to bill a closed deal, in one read.
   * Kept here so the commissions module never has to import this one.
   */
  async dealFacts(propertyId: string): Promise<{
    sellerId: string | null;
    city: string | null;
    listingType: ListingType;
  } | null> {
    if (!Types.ObjectId.isValid(propertyId)) return null;
    const property = await this.propertyModel
      .findById(propertyId)
      .select('sellerId city listingType');
    if (!property) return null;
    return {
      sellerId: referenceId(property.sellerId),
      city: property.city ?? null,
      listingType: property.listingType,
    };
  }

  /** The seller's own listings, with promotion state — drives the Billing page. */
  async promotableForSeller(sellerId: string): Promise<PropertyResponseDto[]> {
    this.assertValidId(sellerId, 'user');
    const properties = await this.propertyModel
      .find({ sellerId, status: { $nin: CLOSED_STATUSES } })
      .sort({ createdAt: -1 });
    return properties.map((p) => this.toResponse(p));
  }

  async findAll(): Promise<PropertyResponseDto[]> {
    const properties = await this.propertyModel
      .find({ verificationStatus: PropertyVerificationStatus.VERIFIED })
      .sort({ createdAt: -1 });
    return properties.map((p) => this.toResponse(p));
  }

  /** `actor` is optional (the route is public) — only used to decide whether private `documents` are included. */
  async findOne(id: string, actor?: AuthenticatedUser): Promise<PropertyResponseDto> {
    const property = await this.loadOrThrow(id);
    return this.toResponse(property, this.canSeeDocuments(property, actor));
  }

  /** Every listing owned (as admin) or submitted (as seller) by this user, any verification state. */
  async findByOwner(ownerId: string): Promise<PropertyResponseDto[]> {
    this.assertValidId(ownerId, 'user');
    const properties = await this.propertyModel
      .find({ $or: [{ adminId: ownerId }, { sellerId: ownerId }] })
      .sort({ createdAt: -1 });
    return properties.map((p) => this.toResponse(p, true));
  }

  /** The `_id` of the admin who runs `city`, or null if we don't operate there. */
  private async resolveCityAdminId(city: string): Promise<Types.ObjectId | null> {
    const admin = await this.usersService.findAdminForCity(city);
    return admin ? (admin._id as Types.ObjectId) : null;
  }

  /**
   * The city an admin is responsible for. Only ADMIN accounts are
   * city-bound: a superuser oversees the whole platform.
   */
  private adminCity(actor: AuthenticatedUser): ServiceCity | null {
    if (actor.role !== Role.ADMIN) return null;
    return normalizeCity(actor.city);
  }

  /**
   * Restricts an admin's Negotiations/Purchases/Visits queue to the
   * properties in their own city. Returns `null` (no restriction) for a
   * superuser, who sees every city.
   *
   * An admin whose account has no recognised city gets an empty list rather
   * than the whole platform — a misconfigured admin account should see
   * nothing, not everything.
   */
  async propertyIdsForAdmin(actor: AuthenticatedUser): Promise<Types.ObjectId[] | null> {
    if (actor.role === Role.SUPERUSER) return null;
    const city = this.adminCity(actor);
    const docs = await this.propertyModel.find(city ? { city } : { _id: null }, '_id');
    return docs.map((d) => d._id as Types.ObjectId);
  }

  /**
   * Throws unless `actor` may act on `propertyId` in an admin capacity —
   * i.e. they are the superuser, or the admin who runs that property's city.
   *
   * Shared by Visits and Purchases so that a buyer's site-visit request or
   * an in-progress deal is driven by the same city desk that verified the
   * listing, rather than by whichever admin happens to open it first.
   */
  async assertAdminHandlesProperty(propertyId: string | null, actor: AuthenticatedUser): Promise<void> {
    if (actor.role === Role.SUPERUSER) return;
    if (actor.role !== Role.ADMIN) {
      throw new ForbiddenException('Only an admin or superuser may perform this action');
    }
    if (!propertyId) {
      // No property to attribute a city to, so no city admin owns it either.
      throw new ForbiddenException('This record is not linked to a property, so only a superuser can act on it');
    }
    const property = await this.loadOrThrow(propertyId);
    this.assertRunsCity(property.city, actor, 'act on this request');
  }

  /** Property IDs submitted by a given seller — used to scope a seller's negotiation/purchase/visit queues. */
  async propertyIdsForSeller(sellerId: string): Promise<Types.ObjectId[]> {
    const docs = await this.propertyModel.find({ sellerId }, '_id');
    return docs.map((d) => d._id as Types.ObjectId);
  }

  /**
   * Who's responsible for a property: the seller who submitted it, and the
   * admin who runs its city (`adminId`). Used by Negotiations/Purchases/Visits
   * to authorize actions without duplicating property lookups.
   */
  /**
   * Takes a listing off the market because its deal completed. `sale` becomes
   * SOLD and `rent` becomes RENTED, so the two are distinguishable in the
   * seller's own queues even though buyers stop seeing either.
   *
   * Called by PurchasesService the moment a purchase reaches its final step.
   * Before this existed, PropertyStatus.SOLD/RENTED were declared on the
   * schema but nothing ever assigned them: a bought property stayed
   * `available` forever, kept appearing in buyer search, and a second buyer
   * could offer on it and have that offer accepted — two purchases, one flat.
   */
  async markDealClosed(propertyId: string): Promise<void> {
    const property = await this.loadOrThrow(propertyId);
    property.status =
      property.listingType === ListingType.RENT ? PropertyStatus.RENTED : PropertyStatus.SOLD;
    await property.save();
    this.logger.log(`Property ${propertyId} is now ${property.status} and hidden from buyer search.`);
  }

  /** Puts a listing back on the market — the deal that closed it fell through. */
  async markDealReopened(propertyId: string): Promise<void> {
    const property = await this.loadOrThrow(propertyId);
    if (!isClosedStatus(property.status)) return;
    property.status = PropertyStatus.AVAILABLE;
    await property.save();
    this.logger.log(`Property ${propertyId} is available again.`);
  }

  /** Whether this listing has already been sold or rented out. */
  async isDealClosed(propertyId: string): Promise<boolean> {
    const property = await this.loadOrThrow(propertyId);
    return isClosedStatus(property.status);
  }

  async getOwnershipInfo(propertyId: string): Promise<{ adminId: string | null; sellerId: string | null }> {
    const property = await this.loadOrThrow(propertyId);
    return {
      adminId: property.adminId ? property.adminId.toString() : null,
      sellerId: property.sellerId ? property.sellerId.toString() : null,
    };
  }

  /**
   * Admin/superuser oversight queue — every listing regardless of
   * verification state, with the submitting seller's name/email populated.
   *
   * Scoped to the admin's own city: a Hyderabad listing appears in the
   * Hyderabad admin's queue and nowhere else. The superuser sees all four
   * cities.
   */
  async findForReview(filters: ReviewQueueFilterDto, actor: AuthenticatedUser): Promise<PaginatedResult<PropertyResponseDto>> {
    const query: QueryFilter<PropertyDocument> = {};
    if (filters.verificationStatus) query.verificationStatus = filters.verificationStatus;
    if (actor.role === Role.ADMIN) {
      // An admin with no recognised city sees nothing rather than everything.
      query.city = this.adminCity(actor) ?? '\u0000none';
    }

    const page = filters.page ?? 1;
    const limit = Math.min(filters.limit ?? 20, MAX_PAGE_SIZE);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.propertyModel
        .find(query)
        .populate('sellerId', 'name email phone createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      this.propertyModel.countDocuments(query),
    ]);

    return {
      items: items.map((p) => this.toResponse(p, true)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 0,
    };
  }

  async update(id: string, dto: UpdatePropertyDto, actor: AuthenticatedUser): Promise<PropertyResponseDto> {
    const property = await this.loadOrThrow(id);
    this.assertCanManage(property, actor);

    // Assign only the fields actually present on the DTO. A blanket
    // `Object.assign(property, dto)` would also copy every *undeclared*
    // field as `undefined` (TS class fields are own properties by default
    // under `useDefineForClassFields`), which Mongoose treats as "unset"
    // and wipes required fields on save.
    if (dto.title !== undefined) property.title = dto.title;
    if (dto.description !== undefined) property.description = dto.description;
    if (dto.type !== undefined) property.type = dto.type;
    if (dto.listingType !== undefined) property.listingType = dto.listingType;
    if (dto.price !== undefined) property.price = dto.price;
    if (dto.areaSqft !== undefined) property.areaSqft = dto.areaSqft;
    if (dto.bedrooms !== undefined) property.bedrooms = dto.bedrooms;
    if (dto.bathrooms !== undefined) property.bathrooms = dto.bathrooms;
    if (dto.address !== undefined) property.address = dto.address;
    if (dto.city !== undefined) {
      // Moving cities re-files the listing: `state` and the responsible admin
      // both follow the city, so the new city's desk picks it up and the old
      // one stops seeing it.
      property.city = dto.city;
      property.state = CITY_STATE[dto.city];
      property.adminId = await this.resolveCityAdminId(dto.city);
    }
    if (dto.status !== undefined) property.status = dto.status;
    if (dto.images !== undefined) property.images = dto.images;
    // `adminId` is no longer caller-assignable: it is always the admin who
    // runs the property's city, derived above.

    // A seller editing their own listing sends it back for re-review — by the
    // admin for its (possibly new) city.
    if (!isElevated(actor.role)) {
      property.verificationStatus = PropertyVerificationStatus.PENDING;
      property.rejectionReason = null;
    }

    await property.save();
    return this.toResponse(property, true);
  }

  async remove(id: string, actor: AuthenticatedUser): Promise<void> {
    const property = await this.loadOrThrow(id);
    this.assertCanManage(property, actor);
    await property.deleteOne();
  }

  /**
   * Verification is the city admin's job: only the admin who runs the
   * property's city (or the superuser) may verify or reject it. This is the
   * check that makes "a Hyderabad property is verified by the Hyderabad
   * admin" true rather than merely conventional.
   */
  private assertCanVerify(property: PropertyDocument, actor: AuthenticatedUser): void {
    if (actor.role === Role.SUPERUSER) return;
    if (actor.role !== Role.ADMIN) {
      throw new ForbiddenException('Only an admin or superuser may verify or reject a property listing');
    }
    this.assertRunsCity(property.city, actor, 'verify or reject this listing');
  }

  /**
   * Shared city guard: throws unless `actor` is the admin who runs `city`.
   * Callers must have already established that `actor` is an ADMIN.
   */
  private assertRunsCity(city: string, actor: AuthenticatedUser, action: string): void {
    const own = this.adminCity(actor);
    if (own && normalizeCity(city) === own) return;
    throw new ForbiddenException(
      `${city} is handled by the ${city} admin. You are the ${actor.city ?? 'unassigned'} admin, so you cannot ${action}.`,
    );
  }

  /** Marks a listing verified. Only the city's own admin (or the superuser) may act — see assertCanVerify. */
  async verify(id: string, actor: AuthenticatedUser): Promise<PropertyResponseDto> {
    const property = await this.loadOrThrow(id);
    this.assertCanVerify(property, actor);
    property.verificationStatus = PropertyVerificationStatus.VERIFIED;
    property.rejectionReason = null;
    // `adminId` is not touched here: it was already set to this city's admin
    // when the listing was created (and re-derived if it ever moves city), so
    // the verifying admin is by construction the one already on the record.
    await property.save();
    return this.toResponse(property, true);
  }

  /** Marks a listing rejected, optionally with a reason shown to the seller. Same city-scoped authorization as verify(). */
  async reject(id: string, reason: string | undefined, actor: AuthenticatedUser): Promise<PropertyResponseDto> {
    const property = await this.loadOrThrow(id);
    this.assertCanVerify(property, actor);
    property.verificationStatus = PropertyVerificationStatus.REJECTED;
    property.rejectionReason = reason ?? null;
    await property.save();
    return this.toResponse(property, true);
  }

  /** Appends uploaded verification documents. Seller-owner or admin/superuser only. */
  async addDocuments(
    id: string,
    actor: AuthenticatedUser,
    files: UploadedFileInfo[],
  ): Promise<PropertyResponseDto> {
    const property = await this.loadOrThrow(id);
    this.assertCanManage(property, actor);

    property.documents.push(
      ...files.map((f) => ({ url: f.url, originalName: f.originalName, uploadedAt: new Date() })),
    );
    await property.save();
    return this.toResponse(property, true);
  }

  /**
   * Appends uploaded property photos. Seller-owner or admin/superuser only —
   * same authorization as addDocuments, but these are public (buyer-facing),
   * unlike verification documents.
   */
  async addImages(id: string, actor: AuthenticatedUser, urls: string[]): Promise<PropertyResponseDto> {
    const property = await this.loadOrThrow(id);
    this.assertCanManage(property, actor);

    property.images.push(...urls);
    await property.save();
    return this.toResponse(property, this.canSeeDocuments(property, actor));
  }

  /**
   * DB-level filtering, sorting, and pagination used by both
   * GET /properties (with query params) and GET /listings/search. Always
   * scoped to verified listings — pending/rejected submissions never appear
   * in public search results (see findForReview for the admin queue).
   */
  async search(filters: ListingFilterDto, includeClosed = false): Promise<PaginatedResult<PropertyResponseDto>> {
    if (
      filters.minPrice !== undefined &&
      filters.maxPrice !== undefined &&
      filters.minPrice > filters.maxPrice
    ) {
      throw new BadRequestException('minPrice cannot be greater than maxPrice');
    }

    const query: QueryFilter<PropertyDocument> = {
      verificationStatus: PropertyVerificationStatus.VERIFIED,
    };

    // A sold or rented listing is gone: it stays out of every buyer-facing
    // result unless the caller asks for that status by name (an admin
    // reviewing what closed) or opts in wholesale (the seeder, which has to
    // see closed listings or it would recreate them as duplicates).
    if (!includeClosed && !filters.status) {
      query.status = { $nin: CLOSED_STATUSES };
    }

    if (filters.city) query.city = new RegExp(`^${escapeRegExp(filters.city)}$`, 'i');
    if (filters.state) query.state = new RegExp(`^${escapeRegExp(filters.state)}$`, 'i');
    if (filters.type) query.type = filters.type;
    if (filters.listingType) query.listingType = filters.listingType;
    if (filters.status) query.status = filters.status;
    if (filters.minBedrooms !== undefined) query.bedrooms = { $gte: filters.minBedrooms };
    if (filters.minAreaSqft !== undefined) query.areaSqft = { $gte: filters.minAreaSqft };
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      query.price = {
        ...(filters.minPrice !== undefined && { $gte: filters.minPrice }),
        ...(filters.maxPrice !== undefined && { $lte: filters.maxPrice }),
      };
    }

    const page = filters.page ?? 1;
    const limit = Math.min(filters.limit ?? 10, MAX_PAGE_SIZE);
    const skip = (page - 1) * limit;

    // Promoted listings come first — that placement is exactly what a seller
    // paid for. It is computed in the pipeline against "now" rather than read
    // from a stored flag, so a promotion that ran out yesterday drops back to
    // the normal ordering on the very next search with no cleanup job.
    const now = new Date();
    const [raw, total] = await Promise.all([
      this.propertyModel.aggregate<Record<string, unknown>>([
        { $match: query },
        { $addFields: { isPromoted: { $cond: [{ $gt: ['$featuredUntil', now] }, 1, 0] } } },
        { $sort: { isPromoted: -1, featuredRank: -1, createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
      ]),
      this.propertyModel.countDocuments(query),
    ]);
    // Aggregate returns plain objects; hydrate them so toResponse works on
    // real documents exactly as it does everywhere else.
    const items = raw.map((doc) => this.propertyModel.hydrate(doc));

    return {
      items: items.map((p) => this.toResponse(p)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 0,
    };
  }
}

/** Sold and rented are the two "off the market" states. */
const CLOSED_STATUSES: PropertyStatus[] = [PropertyStatus.SOLD, PropertyStatus.RENTED];

function isClosedStatus(status: PropertyStatus): boolean {
  return CLOSED_STATUSES.includes(status);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

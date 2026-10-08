"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var PropertiesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertiesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const property_schema_js_1 = require("./schemas/property.schema.js");
const role_enum_js_1 = require("../../common/enums/role.enum.js");
const user_schema_js_1 = require("../users/schemas/user.schema.js");
const subscriptions_service_js_1 = require("../subscriptions/subscriptions.service.js");
const pricing_js_1 = require("../../shared/constants/pricing.js");
const reference_id_helper_js_1 = require("../../shared/helpers/reference-id.helper.js");
const property_enum_js_1 = require("../../shared/enums/property.enum.js");
const objectid_backfill_helper_js_1 = require("../../shared/helpers/objectid-backfill.helper.js");
const service_cities_js_1 = require("../../shared/constants/service-cities.js");
const users_service_js_1 = require("../users/users.service.js");
const ist_time_helper_js_1 = require("../../shared/helpers/ist-time.helper.js");
const MAX_PAGE_SIZE = 50;
function isElevated(role) {
    return role === role_enum_js_1.Role.ADMIN || role === role_enum_js_1.Role.SUPERUSER;
}
let PropertiesService = PropertiesService_1 = class PropertiesService {
    propertyModel;
    usersService;
    subscriptionsService;
    logger = new common_1.Logger(PropertiesService_1.name);
    constructor(propertyModel, usersService, subscriptionsService) {
        this.propertyModel = propertyModel;
        this.usersService = usersService;
        this.subscriptionsService = subscriptionsService;
    }
    async onModuleInit() {
        try {
            await this.propertyModel.updateMany({ verificationStatus: { $exists: false } }, {
                $set: {
                    verificationStatus: property_enum_js_1.PropertyVerificationStatus.VERIFIED,
                    sellerId: null,
                    documents: [],
                    rejectionReason: null,
                },
            });
        }
        catch (error) {
            this.logger.warn(`Failed to backfill legacy Property documents: ${error.message}`);
        }
        await (0, objectid_backfill_helper_js_1.backfillObjectIdStrings)(this.propertyModel, ['adminId', 'sellerId'], this.logger);
        await this.syncCityAdmins();
    }
    async syncCityAdmins() {
        try {
            for (const city of service_cities_js_1.SERVICE_CITIES) {
                const admin = await this.usersService.findAdminForCity(city);
                if (!admin)
                    continue;
                await this.propertyModel.updateMany({ city: { $in: (0, service_cities_js_1.citySpellings)(city) }, $or: [{ adminId: { $ne: admin._id } }, { city: { $ne: city } }] }, { $set: { adminId: admin._id, city, state: service_cities_js_1.CITY_STATE[city] } });
            }
            const fallbackAdmin = await this.usersService.findAdminForCity(service_cities_js_1.FALLBACK_CITY);
            if (fallbackAdmin) {
                const adopted = await this.propertyModel.updateMany({ city: { $nin: service_cities_js_1.SERVICE_CITIES } }, {
                    $set: {
                        city: service_cities_js_1.FALLBACK_CITY,
                        state: service_cities_js_1.CITY_STATE[service_cities_js_1.FALLBACK_CITY],
                        adminId: fallbackAdmin._id,
                    },
                });
                if (adopted.modifiedCount) {
                    this.logger.log(`Moved ${adopted.modifiedCount} listing(s) in unserviced cities to the ${service_cities_js_1.FALLBACK_CITY} desk (${fallbackAdmin.email}).`);
                }
            }
        }
        catch (error) {
            this.logger.warn(`Failed to sync per-city property admins: ${error.message}`);
        }
    }
    toResponse(p, includeDocuments = false) {
        const seller = p.sellerId;
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
            sellerId: sellerIsPopulated ? seller._id.toString() : p.sellerId ? p.sellerId.toString() : null,
            verificationStatus: p.verificationStatus,
            rejectionReason: p.rejectionReason ?? null,
            isFeatured: !!p.featuredUntil && p.featuredUntil.getTime() > Date.now(),
            featuredTier: p.featuredTier ?? null,
            featuredUntil: p.featuredUntil ? (0, ist_time_helper_js_1.istTimestamp)(p.featuredUntil) : null,
            ...(includeDocuments && {
                documents: (p.documents ?? []).map((d) => ({
                    url: d.url,
                    originalName: d.originalName,
                    uploadedAt: (0, ist_time_helper_js_1.istTimestamp)(d.uploadedAt ?? new Date()),
                })),
            }),
            ...(sellerIsPopulated && {
                sellerName: seller.name,
                sellerEmail: seller.email,
                sellerPhone: seller.phone ?? null,
                sellerSince: seller.createdAt ? (0, ist_time_helper_js_1.istTimestamp)(seller.createdAt) : null,
            }),
            createdAt: (0, ist_time_helper_js_1.istTimestamp)(p.createdAt ?? new Date()),
            updatedAt: (0, ist_time_helper_js_1.istTimestamp)(p.updatedAt ?? new Date()),
        };
    }
    canSeeDocuments(property, actor) {
        if (!actor)
            return false;
        if (isElevated(actor.role))
            return true;
        return !!property.sellerId && property.sellerId.toString() === actor.id;
    }
    assertValidId(id, label = 'property') {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException(`"${id}" is not a valid ${label} ID`);
        }
    }
    async loadOrThrow(id) {
        this.assertValidId(id);
        const property = await this.propertyModel.findById(id);
        if (!property) {
            throw new common_1.NotFoundException(`Property with ID "${id}" not found`);
        }
        return property;
    }
    assertCanManage(property, actor) {
        if (actor.role === role_enum_js_1.Role.SUPERUSER)
            return;
        if (actor.role === role_enum_js_1.Role.ADMIN) {
            this.assertRunsCity(property.city, actor, 'manage this listing');
            return;
        }
        if (property.sellerId && property.sellerId.toString() === actor.id)
            return;
        throw new common_1.ForbiddenException('You do not have permission to manage this property');
    }
    async create(dto, actor) {
        if (actor.userType !== user_schema_js_1.UserType.SELLER) {
            throw new common_1.ForbiddenException(isElevated(actor.role)
                ? 'Admins and superusers cannot list properties — only a seller can. Admins verify, reject and delete listings.'
                : `Only seller accounts can list a property. You are signed in as a ${actor.userType ?? 'non-seller'} account (${actor.email}).`);
        }
        await this.assertListingQuota(actor.id);
        const property = await this.propertyModel.create({
            ...dto,
            status: dto.status ?? undefined,
            images: dto.images ?? [],
            state: service_cities_js_1.CITY_STATE[dto.city],
            adminId: await this.resolveCityAdminId(dto.city),
            sellerId: actor.id,
            verificationStatus: property_enum_js_1.PropertyVerificationStatus.PENDING,
        });
        return this.toResponse(property, true);
    }
    async countListingsForQuota(sellerId) {
        if (!mongoose_2.Types.ObjectId.isValid(sellerId))
            return 0;
        return this.propertyModel.countDocuments({ sellerId });
    }
    async assertListingQuota(sellerId) {
        const plan = await this.subscriptionsService.activePlan(sellerId);
        const used = await this.countListingsForQuota(sellerId);
        if (this.subscriptionsService.hasListingHeadroom(plan, used))
            return;
        throw new common_1.HttpException({
            statusCode: common_1.HttpStatus.PAYMENT_REQUIRED,
            message: `Your ${plan.definition.name} plan allows ${plan.definition.listingQuota} ` +
                `propert${plan.definition.listingQuota === 1 ? 'y' : 'ies'} and you already have ${used}. ` +
                `Sold listings still count towards your limit — upgrade your plan to list more, ` +
                `or delete a listing you no longer need.`,
            error: 'Listing quota reached',
            planTier: plan.tier,
            listingQuota: plan.definition.listingQuota,
            listingsUsed: used,
        }, common_1.HttpStatus.PAYMENT_REQUIRED);
    }
    async applyFeature(propertyId, tier, sellerId) {
        const property = await this.loadOrThrow(propertyId);
        if ((0, reference_id_helper_js_1.referenceId)(property.sellerId) !== sellerId) {
            throw new common_1.ForbiddenException('You can only promote your own listings');
        }
        if (property.verificationStatus !== property_enum_js_1.PropertyVerificationStatus.VERIFIED) {
            throw new common_1.BadRequestException('Only a verified listing can be promoted — this one is still awaiting admin verification.');
        }
        const pack = pricing_js_1.FEATURED_PACKS[tier];
        const now = new Date();
        const from = property.featuredUntil && property.featuredUntil > now ? property.featuredUntil : now;
        const until = new Date(from);
        until.setDate(until.getDate() + pack.days);
        property.featuredUntil = until;
        if (!property.featuredTier || pack.rank >= (pricing_js_1.FEATURED_PACKS[property.featuredTier]?.rank ?? 0)) {
            property.featuredTier = tier;
            property.featuredRank = pack.rank;
        }
        await property.save();
        this.logger.log(`Property ${propertyId} promoted (${tier}) until ${until.toISOString()}`);
        return this.toResponse(property);
    }
    async dealFacts(propertyId) {
        if (!mongoose_2.Types.ObjectId.isValid(propertyId))
            return null;
        const property = await this.propertyModel
            .findById(propertyId)
            .select('sellerId city listingType');
        if (!property)
            return null;
        return {
            sellerId: (0, reference_id_helper_js_1.referenceId)(property.sellerId),
            city: property.city ?? null,
            listingType: property.listingType,
        };
    }
    async promotableForSeller(sellerId) {
        this.assertValidId(sellerId, 'user');
        const properties = await this.propertyModel
            .find({ sellerId, status: { $nin: CLOSED_STATUSES } })
            .sort({ createdAt: -1 });
        return properties.map((p) => this.toResponse(p));
    }
    async findAll() {
        const properties = await this.propertyModel
            .find({ verificationStatus: property_enum_js_1.PropertyVerificationStatus.VERIFIED })
            .sort({ createdAt: -1 });
        return properties.map((p) => this.toResponse(p));
    }
    async findOne(id, actor) {
        const property = await this.loadOrThrow(id);
        return this.toResponse(property, this.canSeeDocuments(property, actor));
    }
    async findByOwner(ownerId) {
        this.assertValidId(ownerId, 'user');
        const properties = await this.propertyModel
            .find({ $or: [{ adminId: ownerId }, { sellerId: ownerId }] })
            .sort({ createdAt: -1 });
        return properties.map((p) => this.toResponse(p, true));
    }
    async resolveCityAdminId(city) {
        const admin = await this.usersService.findAdminForCity(city);
        return admin ? admin._id : null;
    }
    adminCity(actor) {
        if (actor.role !== role_enum_js_1.Role.ADMIN)
            return null;
        return (0, service_cities_js_1.normalizeCity)(actor.city);
    }
    async propertyIdsForAdmin(actor) {
        if (actor.role === role_enum_js_1.Role.SUPERUSER)
            return null;
        const city = this.adminCity(actor);
        const docs = await this.propertyModel.find(city ? { city } : { _id: null }, '_id');
        return docs.map((d) => d._id);
    }
    async assertAdminHandlesProperty(propertyId, actor) {
        if (actor.role === role_enum_js_1.Role.SUPERUSER)
            return;
        if (actor.role !== role_enum_js_1.Role.ADMIN) {
            throw new common_1.ForbiddenException('Only an admin or superuser may perform this action');
        }
        if (!propertyId) {
            throw new common_1.ForbiddenException('This record is not linked to a property, so only a superuser can act on it');
        }
        const property = await this.loadOrThrow(propertyId);
        this.assertRunsCity(property.city, actor, 'act on this request');
    }
    async propertyIdsForSeller(sellerId) {
        const docs = await this.propertyModel.find({ sellerId }, '_id');
        return docs.map((d) => d._id);
    }
    async markDealClosed(propertyId) {
        const property = await this.loadOrThrow(propertyId);
        property.status =
            property.listingType === property_enum_js_1.ListingType.RENT ? property_enum_js_1.PropertyStatus.RENTED : property_enum_js_1.PropertyStatus.SOLD;
        await property.save();
        this.logger.log(`Property ${propertyId} is now ${property.status} and hidden from buyer search.`);
    }
    async markDealReopened(propertyId) {
        const property = await this.loadOrThrow(propertyId);
        if (!isClosedStatus(property.status))
            return;
        property.status = property_enum_js_1.PropertyStatus.AVAILABLE;
        await property.save();
        this.logger.log(`Property ${propertyId} is available again.`);
    }
    async isDealClosed(propertyId) {
        const property = await this.loadOrThrow(propertyId);
        return isClosedStatus(property.status);
    }
    async getOwnershipInfo(propertyId) {
        const property = await this.loadOrThrow(propertyId);
        return {
            adminId: property.adminId ? property.adminId.toString() : null,
            sellerId: property.sellerId ? property.sellerId.toString() : null,
        };
    }
    async findForReview(filters, actor) {
        const query = {};
        if (filters.verificationStatus)
            query.verificationStatus = filters.verificationStatus;
        if (actor.role === role_enum_js_1.Role.ADMIN) {
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
    async update(id, dto, actor) {
        const property = await this.loadOrThrow(id);
        this.assertCanManage(property, actor);
        if (dto.title !== undefined)
            property.title = dto.title;
        if (dto.description !== undefined)
            property.description = dto.description;
        if (dto.type !== undefined)
            property.type = dto.type;
        if (dto.listingType !== undefined)
            property.listingType = dto.listingType;
        if (dto.price !== undefined)
            property.price = dto.price;
        if (dto.areaSqft !== undefined)
            property.areaSqft = dto.areaSqft;
        if (dto.bedrooms !== undefined)
            property.bedrooms = dto.bedrooms;
        if (dto.bathrooms !== undefined)
            property.bathrooms = dto.bathrooms;
        if (dto.address !== undefined)
            property.address = dto.address;
        if (dto.city !== undefined) {
            property.city = dto.city;
            property.state = service_cities_js_1.CITY_STATE[dto.city];
            property.adminId = await this.resolveCityAdminId(dto.city);
        }
        if (dto.status !== undefined)
            property.status = dto.status;
        if (dto.images !== undefined)
            property.images = dto.images;
        if (!isElevated(actor.role)) {
            property.verificationStatus = property_enum_js_1.PropertyVerificationStatus.PENDING;
            property.rejectionReason = null;
        }
        await property.save();
        return this.toResponse(property, true);
    }
    async remove(id, actor) {
        const property = await this.loadOrThrow(id);
        this.assertCanManage(property, actor);
        await property.deleteOne();
    }
    assertCanVerify(property, actor) {
        if (actor.role === role_enum_js_1.Role.SUPERUSER)
            return;
        if (actor.role !== role_enum_js_1.Role.ADMIN) {
            throw new common_1.ForbiddenException('Only an admin or superuser may verify or reject a property listing');
        }
        this.assertRunsCity(property.city, actor, 'verify or reject this listing');
    }
    assertRunsCity(city, actor, action) {
        const own = this.adminCity(actor);
        if (own && (0, service_cities_js_1.normalizeCity)(city) === own)
            return;
        throw new common_1.ForbiddenException(`${city} is handled by the ${city} admin. You are the ${actor.city ?? 'unassigned'} admin, so you cannot ${action}.`);
    }
    async verify(id, actor) {
        const property = await this.loadOrThrow(id);
        this.assertCanVerify(property, actor);
        property.verificationStatus = property_enum_js_1.PropertyVerificationStatus.VERIFIED;
        property.rejectionReason = null;
        await property.save();
        return this.toResponse(property, true);
    }
    async reject(id, reason, actor) {
        const property = await this.loadOrThrow(id);
        this.assertCanVerify(property, actor);
        property.verificationStatus = property_enum_js_1.PropertyVerificationStatus.REJECTED;
        property.rejectionReason = reason ?? null;
        await property.save();
        return this.toResponse(property, true);
    }
    async addDocuments(id, actor, files) {
        const property = await this.loadOrThrow(id);
        this.assertCanManage(property, actor);
        property.documents.push(...files.map((f) => ({ url: f.url, originalName: f.originalName, uploadedAt: new Date() })));
        await property.save();
        return this.toResponse(property, true);
    }
    async addImages(id, actor, urls) {
        const property = await this.loadOrThrow(id);
        this.assertCanManage(property, actor);
        property.images.push(...urls);
        await property.save();
        return this.toResponse(property, this.canSeeDocuments(property, actor));
    }
    async search(filters, includeClosed = false) {
        if (filters.minPrice !== undefined &&
            filters.maxPrice !== undefined &&
            filters.minPrice > filters.maxPrice) {
            throw new common_1.BadRequestException('minPrice cannot be greater than maxPrice');
        }
        const query = {
            verificationStatus: property_enum_js_1.PropertyVerificationStatus.VERIFIED,
        };
        if (!includeClosed && !filters.status) {
            query.status = { $nin: CLOSED_STATUSES };
        }
        if (filters.city)
            query.city = new RegExp(`^${escapeRegExp(filters.city)}$`, 'i');
        if (filters.state)
            query.state = new RegExp(`^${escapeRegExp(filters.state)}$`, 'i');
        if (filters.type)
            query.type = filters.type;
        if (filters.listingType)
            query.listingType = filters.listingType;
        if (filters.status)
            query.status = filters.status;
        if (filters.minBedrooms !== undefined)
            query.bedrooms = { $gte: filters.minBedrooms };
        if (filters.minAreaSqft !== undefined)
            query.areaSqft = { $gte: filters.minAreaSqft };
        if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
            query.price = {
                ...(filters.minPrice !== undefined && { $gte: filters.minPrice }),
                ...(filters.maxPrice !== undefined && { $lte: filters.maxPrice }),
            };
        }
        const page = filters.page ?? 1;
        const limit = Math.min(filters.limit ?? 10, MAX_PAGE_SIZE);
        const skip = (page - 1) * limit;
        const now = new Date();
        const [raw, total] = await Promise.all([
            this.propertyModel.aggregate([
                { $match: query },
                { $addFields: { isPromoted: { $cond: [{ $gt: ['$featuredUntil', now] }, 1, 0] } } },
                { $sort: { isPromoted: -1, featuredRank: -1, createdAt: -1 } },
                { $skip: skip },
                { $limit: limit },
            ]),
            this.propertyModel.countDocuments(query),
        ]);
        const items = raw.map((doc) => this.propertyModel.hydrate(doc));
        return {
            items: items.map((p) => this.toResponse(p)),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 0,
        };
    }
};
exports.PropertiesService = PropertiesService;
exports.PropertiesService = PropertiesService = PropertiesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(property_schema_js_1.Property.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        users_service_js_1.UsersService,
        subscriptions_service_js_1.SubscriptionsService])
], PropertiesService);
const CLOSED_STATUSES = [property_enum_js_1.PropertyStatus.SOLD, property_enum_js_1.PropertyStatus.RENTED];
function isClosedStatus(status) {
    return CLOSED_STATUSES.includes(status);
}
function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
//# sourceMappingURL=properties.service.js.map
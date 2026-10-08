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
var NegotiationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NegotiationsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const negotiation_schema_js_1 = require("./schemas/negotiation.schema.js");
const negotiation_enum_js_1 = require("../../shared/enums/negotiation.enum.js");
const role_enum_js_1 = require("../../common/enums/role.enum.js");
const user_schema_js_1 = require("../users/schemas/user.schema.js");
const properties_service_js_1 = require("../properties/properties.service.js");
const purchases_service_js_1 = require("../purchases/purchases.service.js");
const objectid_backfill_helper_js_1 = require("../../shared/helpers/objectid-backfill.helper.js");
const reference_id_helper_js_1 = require("../../shared/helpers/reference-id.helper.js");
const ist_time_helper_js_1 = require("../../shared/helpers/ist-time.helper.js");
function isPopulated(ref) {
    return !!ref && typeof ref === 'object' && '_id' in ref;
}
let NegotiationsService = NegotiationsService_1 = class NegotiationsService {
    negotiationModel;
    propertiesService;
    purchasesService;
    logger = new common_1.Logger(NegotiationsService_1.name);
    constructor(negotiationModel, propertiesService, purchasesService) {
        this.negotiationModel = negotiationModel;
        this.propertiesService = propertiesService;
        this.purchasesService = purchasesService;
    }
    async onModuleInit() {
        await (0, objectid_backfill_helper_js_1.backfillObjectIdStrings)(this.negotiationModel, ['propertyId', 'buyerId'], this.logger);
    }
    toResponse(n, actor) {
        const property = n.propertyId;
        const buyer = n.buyerId;
        const propertyPopulated = isPopulated(property);
        const buyerPopulated = isPopulated(buyer);
        let canRespond;
        let propertyHasSeller;
        if (actor && propertyPopulated) {
            const sellerId = (0, reference_id_helper_js_1.referenceId)(property.sellerId);
            canRespond = !!sellerId && actor.userType === user_schema_js_1.UserType.SELLER && actor.id === sellerId;
            propertyHasSeller = !!sellerId;
        }
        return {
            id: n._id.toString(),
            propertyId: (0, reference_id_helper_js_1.referenceId)(property),
            buyerId: (0, reference_id_helper_js_1.referenceId)(buyer),
            offerAmount: n.offerAmount,
            counterAmount: n.counterAmount ?? null,
            message: n.message ?? null,
            paymentMode: n.paymentMode ?? null,
            status: n.status,
            rejectionReason: n.rejectionReason ?? null,
            ...(canRespond !== undefined && { canRespond }),
            ...(propertyHasSeller !== undefined && { propertyHasSeller }),
            ...(propertyPopulated && {
                propertyTitle: property.title,
                propertyCity: property.city,
                propertyState: property.state,
                propertyImage: property.images?.[0] ?? null,
            }),
            ...(buyerPopulated && {
                buyerName: buyer.name,
                buyerEmail: buyer.email,
            }),
            createdAt: (0, ist_time_helper_js_1.istTimestamp)(n.createdAt ?? new Date()),
            updatedAt: (0, ist_time_helper_js_1.istTimestamp)(n.updatedAt ?? new Date()),
        };
    }
    assertValidId(id, label = 'negotiation') {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException(`"${id}" is not a valid ${label} ID`);
        }
    }
    async loadOrThrow(id) {
        this.assertValidId(id);
        const negotiation = await this.negotiationModel.findById(id);
        if (!negotiation) {
            throw new common_1.NotFoundException(`Negotiation with ID "${id}" not found`);
        }
        return negotiation;
    }
    assertOwnsOrElevated(negotiation, actor) {
        if (actor.role === role_enum_js_1.Role.ADMIN || actor.role === role_enum_js_1.Role.SUPERUSER)
            return;
        if ((0, reference_id_helper_js_1.referenceId)(negotiation.buyerId) === actor.id)
            return;
        throw new common_1.ForbiddenException('You do not have permission to access this negotiation');
    }
    async assertCanView(negotiation, actor) {
        if (actor.role === role_enum_js_1.Role.ADMIN || actor.role === role_enum_js_1.Role.SUPERUSER)
            return;
        if ((0, reference_id_helper_js_1.referenceId)(negotiation.buyerId) === actor.id)
            return;
        if (actor.userType === user_schema_js_1.UserType.SELLER) {
            const propertyId = (0, reference_id_helper_js_1.referenceId)(negotiation.propertyId);
            if (propertyId) {
                const { sellerId } = await this.propertiesService.getOwnershipInfo(propertyId);
                if (sellerId && sellerId === actor.id)
                    return;
            }
        }
        throw new common_1.ForbiddenException('You do not have permission to access this negotiation');
    }
    async assertStillOnTheMarket(negotiation) {
        const propertyId = (0, reference_id_helper_js_1.referenceId)(negotiation.propertyId);
        if (!propertyId) {
            throw new common_1.NotFoundException('The property for this negotiation no longer exists');
        }
        if (await this.propertiesService.isDealClosed(propertyId)) {
            throw new common_1.BadRequestException('This property has already been sold or rented out, so this offer can no longer be accepted.');
        }
    }
    async assertCanRespond(negotiation, actor) {
        const propertyId = (0, reference_id_helper_js_1.referenceId)(negotiation.propertyId);
        if (!propertyId) {
            throw new common_1.NotFoundException('The property for this negotiation no longer exists');
        }
        const { sellerId } = await this.propertiesService.getOwnershipInfo(propertyId);
        if (sellerId && actor.userType === user_schema_js_1.UserType.SELLER && actor.id === sellerId)
            return;
        throw new common_1.ForbiddenException('Only the seller who listed this property can respond to an offer on it. ' +
            'Admins do not negotiate price — they take over once the seller accepts.');
    }
    async create(dto, actor) {
        if (actor.userType !== user_schema_js_1.UserType.BUYER) {
            throw new common_1.ForbiddenException('Only buyer accounts can submit offers');
        }
        const property = await this.propertiesService.findOne(dto.propertyId);
        if (await this.propertiesService.isDealClosed(dto.propertyId)) {
            throw new common_1.BadRequestException(`"${property.title}" is no longer on the market — it has already been ${property.status}.`);
        }
        const negotiation = await this.negotiationModel.create({
            propertyId: dto.propertyId,
            buyerId: actor.id,
            offerAmount: dto.offerAmount,
            message: dto.message ?? null,
            paymentMode: dto.paymentMode ?? null,
            status: negotiation_enum_js_1.NegotiationStatus.PENDING,
        });
        return this.toResponse(negotiation);
    }
    async findByOwner(buyerId) {
        this.assertValidId(buyerId, 'user');
        const negotiations = await this.negotiationModel
            .find({ buyerId })
            .populate('propertyId', 'title city state images')
            .sort({ createdAt: -1 });
        return negotiations.map((n) => this.toResponse(n));
    }
    async findForReview(filters, actor) {
        const query = {};
        if (filters.status)
            query.status = filters.status;
        const propertyIds = await this.propertiesService.propertyIdsForAdmin(actor);
        if (propertyIds)
            query.propertyId = { $in: propertyIds };
        const page = filters.page ?? 1;
        const limit = Math.min(filters.limit ?? 20, 50);
        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            this.negotiationModel
                .find(query)
                .populate('propertyId', 'title city state images sellerId adminId')
                .populate('buyerId', 'name email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            this.negotiationModel.countDocuments(query),
        ]);
        return {
            items: items.map((n) => this.toResponse(n, actor)),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 0,
        };
    }
    async findForSeller(actor, filters) {
        if (actor.userType !== user_schema_js_1.UserType.SELLER) {
            throw new common_1.ForbiddenException('Only seller accounts have a negotiation queue');
        }
        const propertyIds = await this.propertiesService.propertyIdsForSeller(actor.id);
        const query = { propertyId: { $in: propertyIds } };
        if (filters.status)
            query.status = filters.status;
        const page = filters.page ?? 1;
        const limit = Math.min(filters.limit ?? 20, 50);
        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            this.negotiationModel
                .find(query)
                .populate('propertyId', 'title city state images')
                .populate('buyerId', 'name email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            this.negotiationModel.countDocuments(query),
        ]);
        return {
            items: items.map((n) => this.toResponse(n)),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 0,
        };
    }
    async findOne(id, actor) {
        const negotiation = await this.loadOrThrow(id);
        await this.assertCanView(negotiation, actor);
        await negotiation.populate([
            { path: 'propertyId', select: 'title city state images' },
            { path: 'buyerId', select: 'name email' },
        ]);
        return this.toResponse(negotiation);
    }
    async counter(id, dto, actor) {
        const negotiation = await this.loadOrThrow(id);
        await this.assertCanRespond(negotiation, actor);
        if (![negotiation_enum_js_1.NegotiationStatus.PENDING, negotiation_enum_js_1.NegotiationStatus.COUNTERED].includes(negotiation.status)) {
            throw new common_1.BadRequestException(`Cannot counter a negotiation that is ${negotiation.status}`);
        }
        negotiation.counterAmount = dto.counterAmount;
        negotiation.status = negotiation_enum_js_1.NegotiationStatus.COUNTERED;
        await negotiation.save();
        return this.toResponse(negotiation);
    }
    async acceptOffer(id, actor) {
        const negotiation = await this.loadOrThrow(id);
        await this.assertCanRespond(negotiation, actor);
        await this.assertStillOnTheMarket(negotiation);
        if (negotiation.status !== negotiation_enum_js_1.NegotiationStatus.PENDING) {
            throw new common_1.BadRequestException(`Cannot accept a negotiation that is ${negotiation.status}. Counter or reject instead, or wait for the buyer to accept the counter.`);
        }
        negotiation.status = negotiation_enum_js_1.NegotiationStatus.ACCEPTED;
        await negotiation.save();
        await this.purchasesService.createFromNegotiation(negotiation, negotiation.offerAmount);
        return this.toResponse(negotiation);
    }
    async reject(id, dto, actor) {
        const negotiation = await this.loadOrThrow(id);
        await this.assertCanRespond(negotiation, actor);
        if (![negotiation_enum_js_1.NegotiationStatus.PENDING, negotiation_enum_js_1.NegotiationStatus.COUNTERED].includes(negotiation.status)) {
            throw new common_1.BadRequestException(`Cannot reject a negotiation that is already ${negotiation.status}`);
        }
        negotiation.status = negotiation_enum_js_1.NegotiationStatus.REJECTED;
        negotiation.rejectionReason = dto.reason ?? null;
        await negotiation.save();
        return this.toResponse(negotiation);
    }
    async acceptCounterByBuyer(id, actor) {
        const negotiation = await this.loadOrThrow(id);
        this.assertOwnsOrElevated(negotiation, actor);
        await this.assertStillOnTheMarket(negotiation);
        if (negotiation.status !== negotiation_enum_js_1.NegotiationStatus.COUNTERED || negotiation.counterAmount == null) {
            throw new common_1.BadRequestException('There is no counter-offer to accept on this negotiation');
        }
        negotiation.status = negotiation_enum_js_1.NegotiationStatus.ACCEPTED;
        await negotiation.save();
        await this.purchasesService.createFromNegotiation(negotiation, negotiation.counterAmount);
        return this.toResponse(negotiation);
    }
    async withdraw(id, actor) {
        const negotiation = await this.loadOrThrow(id);
        this.assertOwnsOrElevated(negotiation, actor);
        if (![negotiation_enum_js_1.NegotiationStatus.PENDING, negotiation_enum_js_1.NegotiationStatus.COUNTERED].includes(negotiation.status)) {
            throw new common_1.BadRequestException(`Cannot withdraw a negotiation that is already ${negotiation.status}`);
        }
        negotiation.status = negotiation_enum_js_1.NegotiationStatus.WITHDRAWN;
        await negotiation.save();
        return this.toResponse(negotiation);
    }
};
exports.NegotiationsService = NegotiationsService;
exports.NegotiationsService = NegotiationsService = NegotiationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(negotiation_schema_js_1.Negotiation.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        properties_service_js_1.PropertiesService,
        purchases_service_js_1.PurchasesService])
], NegotiationsService);
//# sourceMappingURL=negotiations.service.js.map
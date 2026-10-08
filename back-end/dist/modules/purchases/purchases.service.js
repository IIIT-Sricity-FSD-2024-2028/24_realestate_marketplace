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
var PurchasesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchasesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const purchase_schema_js_1 = require("./schemas/purchase.schema.js");
const purchase_enum_js_1 = require("../../shared/enums/purchase.enum.js");
const role_enum_js_1 = require("../../common/enums/role.enum.js");
const properties_service_js_1 = require("../properties/properties.service.js");
const commissions_service_js_1 = require("../commissions/commissions.service.js");
const user_schema_js_1 = require("../users/schemas/user.schema.js");
const objectid_backfill_helper_js_1 = require("../../shared/helpers/objectid-backfill.helper.js");
const reference_id_helper_js_1 = require("../../shared/helpers/reference-id.helper.js");
const ist_time_helper_js_1 = require("../../shared/helpers/ist-time.helper.js");
function isElevated(role) {
    return role === role_enum_js_1.Role.ADMIN || role === role_enum_js_1.Role.SUPERUSER;
}
function isPopulated(ref) {
    return !!ref && typeof ref === 'object' && '_id' in ref;
}
let PurchasesService = PurchasesService_1 = class PurchasesService {
    purchaseModel;
    propertiesService;
    commissionsService;
    logger = new common_1.Logger(PurchasesService_1.name);
    constructor(purchaseModel, propertiesService, commissionsService) {
        this.purchaseModel = purchaseModel;
        this.propertiesService = propertiesService;
        this.commissionsService = commissionsService;
    }
    async onModuleInit() {
        await (0, objectid_backfill_helper_js_1.backfillObjectIdStrings)(this.purchaseModel, ['propertyId', 'buyerId', 'negotiationId'], this.logger);
    }
    toResponse(p) {
        const property = p.propertyId;
        const buyer = p.buyerId;
        const propertyPopulated = isPopulated(property);
        const buyerPopulated = isPopulated(buyer);
        return {
            id: p._id.toString(),
            propertyId: (0, reference_id_helper_js_1.referenceId)(property),
            buyerId: (0, reference_id_helper_js_1.referenceId)(buyer),
            negotiationId: (0, reference_id_helper_js_1.referenceId)(p.negotiationId),
            agreedPrice: p.agreedPrice,
            dealStep: p.dealStep,
            dealStepLabel: purchase_enum_js_1.DEAL_STEPS[p.dealStep - 1] ?? purchase_enum_js_1.DEAL_STEPS[0],
            dealStatus: p.dealStatus,
            ...(propertyPopulated && {
                propertyTitle: property.title,
                propertyCity: property.city,
                propertyState: property.state,
                propertyImage: property.images?.[0] ?? null,
                propertyListingType: property.listingType,
            }),
            ...(buyerPopulated && {
                buyerName: buyer.name,
                buyerEmail: buyer.email,
            }),
            createdAt: (0, ist_time_helper_js_1.istTimestamp)(p.createdAt ?? new Date()),
            updatedAt: (0, ist_time_helper_js_1.istTimestamp)(p.updatedAt ?? new Date()),
        };
    }
    async decorate(p) {
        const [enriched] = await this.withCommissions([p]);
        return enriched;
    }
    async withCommissions(purchases) {
        const responses = purchases.map((p) => this.toResponse(p));
        if (!responses.length)
            return responses;
        const summaries = await this.commissionsService.summaryForPurchases(responses.map((r) => r.id));
        for (const response of responses) {
            const summary = summaries.get(response.id);
            response.commissionDue = summary?.due ?? 0;
            response.commissionPaid = summary?.paid ?? 0;
            response.commissions = summary?.lines ?? [];
            response.awaitingCommission =
                response.dealStatus === purchase_enum_js_1.DealStatus.IN_PROGRESS &&
                    response.dealStep >= purchase_enum_js_1.DEAL_STEPS.length &&
                    response.commissionDue > 0;
        }
        return responses;
    }
    assertValidId(id, label = 'purchase') {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException(`"${id}" is not a valid ${label} ID`);
        }
    }
    async loadOrThrow(id) {
        this.assertValidId(id);
        const purchase = await this.purchaseModel.findById(id);
        if (!purchase) {
            throw new common_1.NotFoundException(`Purchase with ID "${id}" not found`);
        }
        return purchase;
    }
    assertCanView(purchase, actor) {
        if (isElevated(actor.role))
            return;
        if ((0, reference_id_helper_js_1.referenceId)(purchase.buyerId) === actor.id)
            return;
        throw new common_1.ForbiddenException('You do not have permission to view this purchase');
    }
    async createFromNegotiation(negotiation, agreedPrice) {
        return this.purchaseModel.create({
            propertyId: negotiation.propertyId,
            buyerId: negotiation.buyerId,
            negotiationId: negotiation._id,
            agreedPrice,
            dealStep: 1,
            dealStatus: purchase_enum_js_1.DealStatus.IN_PROGRESS,
        });
    }
    async findByOwner(buyerId) {
        this.assertValidId(buyerId, 'user');
        const purchases = await this.purchaseModel
            .find({ buyerId })
            .populate('propertyId', 'title city state images listingType')
            .sort({ createdAt: -1 });
        return this.withCommissions(purchases);
    }
    async findForReview(filters, actor) {
        const query = {};
        if (filters.dealStatus)
            query.dealStatus = filters.dealStatus;
        const propertyIds = await this.propertiesService.propertyIdsForAdmin(actor);
        if (propertyIds)
            query.propertyId = { $in: propertyIds };
        const page = filters.page ?? 1;
        const limit = Math.min(filters.limit ?? 20, 50);
        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            this.purchaseModel
                .find(query)
                .populate('propertyId', 'title city state images listingType')
                .populate('buyerId', 'name email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            this.purchaseModel.countDocuments(query),
        ]);
        return {
            items: await this.withCommissions(items),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 0,
        };
    }
    async findForSeller(actor, filters) {
        if (actor.userType !== user_schema_js_1.UserType.SELLER) {
            throw new common_1.ForbiddenException('Only seller accounts have a purchase tracking queue');
        }
        const propertyIds = await this.propertiesService.propertyIdsForSeller(actor.id);
        const query = { propertyId: { $in: propertyIds } };
        if (filters.dealStatus)
            query.dealStatus = filters.dealStatus;
        const page = filters.page ?? 1;
        const limit = Math.min(filters.limit ?? 20, 50);
        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            this.purchaseModel
                .find(query)
                .populate('propertyId', 'title city state images listingType')
                .populate('buyerId', 'name email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            this.purchaseModel.countDocuments(query),
        ]);
        return {
            items: await this.withCommissions(items),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 0,
        };
    }
    async findOne(id, actor) {
        const purchase = await this.loadOrThrow(id);
        this.assertCanView(purchase, actor);
        await purchase.populate([
            { path: 'propertyId', select: 'title city state images listingType' },
            { path: 'buyerId', select: 'name email' },
        ]);
        return this.decorate(purchase);
    }
    async advance(id, actor) {
        const purchase = await this.loadOrThrow(id);
        await this.propertiesService.assertAdminHandlesProperty((0, reference_id_helper_js_1.referenceId)(purchase.propertyId), actor);
        if (purchase.dealStatus !== purchase_enum_js_1.DealStatus.IN_PROGRESS) {
            throw new common_1.BadRequestException(`Cannot advance a purchase that is already ${purchase.dealStatus}`);
        }
        const propertyId = (0, reference_id_helper_js_1.referenceId)(purchase.propertyId);
        const registrationStep = purchase_enum_js_1.DEAL_STEPS.length;
        if (purchase.dealStep >= registrationStep) {
            await this.assertCommissionSettled(purchase);
            purchase.dealStatus = purchase_enum_js_1.DealStatus.COMPLETED;
            await purchase.save();
            return this.decorate(purchase);
        }
        purchase.dealStep += 1;
        await purchase.save();
        if (purchase.dealStep === registrationStep && propertyId) {
            await this.propertiesService.markDealClosed(propertyId);
            await this.accrueCommission(purchase, propertyId);
        }
        return this.decorate(purchase);
    }
    async assertCommissionSettled(purchase) {
        const outstanding = await this.commissionsService.outstandingForPurchase(purchase._id.toString());
        if (!outstanding.length)
            return;
        const total = outstanding.reduce((sum, c) => sum + c.amount, 0);
        const sides = outstanding.map((c) => c.side).join(' and ');
        throw new common_1.HttpException({
            statusCode: common_1.HttpStatus.PAYMENT_REQUIRED,
            message: `Registration cannot be completed until the platform commission is settled. ` +
                `₹${total.toLocaleString('en-IN')} is still outstanding on the ${sides} ` +
                `side${outstanding.length > 1 ? 's' : ''} of this deal.`,
            error: 'Commission outstanding',
            commissionDue: total,
            commissionLines: outstanding.map((c) => ({
                id: c._id.toString(),
                side: c.side,
                amount: c.amount,
            })),
        }, common_1.HttpStatus.PAYMENT_REQUIRED);
    }
    async accrueCommission(purchase, propertyId) {
        try {
            const facts = await this.propertiesService.dealFacts(propertyId);
            const buyerId = (0, reference_id_helper_js_1.referenceId)(purchase.buyerId);
            if (!facts || !buyerId)
                return;
            await this.commissionsService.accrueForPurchase({
                purchaseId: purchase._id.toString(),
                propertyId,
                buyerId,
                sellerId: facts.sellerId,
                city: facts.city,
                listingType: facts.listingType,
                agreedPrice: purchase.agreedPrice,
            });
        }
        catch (error) {
            this.logger.error(`Failed to accrue commission for purchase ${purchase._id.toString()}: ${error.message}`);
        }
    }
    async cancel(id, actor) {
        const purchase = await this.loadOrThrow(id);
        await this.propertiesService.assertAdminHandlesProperty((0, reference_id_helper_js_1.referenceId)(purchase.propertyId), actor);
        const heldProperty = purchase.dealStatus === purchase_enum_js_1.DealStatus.COMPLETED || purchase.dealStep >= purchase_enum_js_1.DEAL_STEPS.length;
        purchase.dealStatus = purchase_enum_js_1.DealStatus.CANCELLED;
        await purchase.save();
        const propertyId = (0, reference_id_helper_js_1.referenceId)(purchase.propertyId);
        if (heldProperty && propertyId) {
            const stillClosed = await this.purchaseModel.countDocuments({
                _id: { $ne: purchase._id },
                propertyId: purchase.propertyId,
                $or: [
                    { dealStatus: purchase_enum_js_1.DealStatus.COMPLETED },
                    { dealStatus: purchase_enum_js_1.DealStatus.IN_PROGRESS, dealStep: { $gte: purchase_enum_js_1.DEAL_STEPS.length } },
                ],
            });
            if (!stillClosed)
                await this.propertiesService.markDealReopened(propertyId);
        }
        return this.decorate(purchase);
    }
};
exports.PurchasesService = PurchasesService;
exports.PurchasesService = PurchasesService = PurchasesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(purchase_schema_js_1.Purchase.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        properties_service_js_1.PropertiesService,
        commissions_service_js_1.CommissionsService])
], PurchasesService);
//# sourceMappingURL=purchases.service.js.map
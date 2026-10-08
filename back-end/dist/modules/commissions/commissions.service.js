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
var CommissionsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommissionsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const commission_schema_js_1 = require("./schemas/commission.schema.js");
const billing_enum_js_1 = require("../../shared/enums/billing.enum.js");
const pricing_js_1 = require("../../shared/constants/pricing.js");
const property_enum_js_1 = require("../../shared/enums/property.enum.js");
const subscriptions_service_js_1 = require("../subscriptions/subscriptions.service.js");
const reference_id_helper_js_1 = require("../../shared/helpers/reference-id.helper.js");
const ist_time_helper_js_1 = require("../../shared/helpers/ist-time.helper.js");
function isPopulated(ref) {
    return !!ref && typeof ref === 'object' && '_id' in ref;
}
let CommissionsService = CommissionsService_1 = class CommissionsService {
    commissionModel;
    subscriptionsService;
    logger = new common_1.Logger(CommissionsService_1.name);
    constructor(commissionModel, subscriptionsService) {
        this.commissionModel = commissionModel;
        this.subscriptionsService = subscriptionsService;
    }
    toResponse(c) {
        const property = c.propertyId;
        const party = c.partyId;
        return {
            id: c._id.toString(),
            purchaseId: (0, reference_id_helper_js_1.referenceId)(c.purchaseId),
            propertyId: (0, reference_id_helper_js_1.referenceId)(property),
            partyId: (0, reference_id_helper_js_1.referenceId)(party),
            side: c.side,
            dealValue: c.dealValue,
            rateBps: c.rateBps,
            ratePercent: Number((c.rateBps / 100).toFixed(2)),
            baseAmount: c.baseAmount,
            taxAmount: c.taxAmount,
            amount: c.amount,
            status: c.status,
            city: c.city ?? null,
            settledAt: c.settledAt ? (0, ist_time_helper_js_1.istTimestamp)(c.settledAt) : null,
            waiverReason: c.waiverReason ?? null,
            ...(isPopulated(property) && { propertyTitle: property.title }),
            ...(isPopulated(party) && {
                partyName: party.name,
                partyEmail: party.email,
            }),
            createdAt: (0, ist_time_helper_js_1.istTimestamp)(c.createdAt ?? new Date()),
        };
    }
    async accrueForPurchase(facts) {
        const isRent = facts.listingType === property_enum_js_1.ListingType.RENT;
        const rates = isRent ? pricing_js_1.COMMISSION_BPS.rent : pricing_js_1.COMMISSION_BPS.sale;
        const dealValue = isRent ? facts.agreedPrice * 12 : facts.agreedPrice;
        const plan = facts.sellerId ? await this.subscriptionsService.activePlan(facts.sellerId) : null;
        const sellerBps = Math.max(0, rates.seller - (plan?.definition.commissionDiscountBps ?? 0));
        const lines = [
            { side: billing_enum_js_1.CommissionSide.BUYER, partyId: facts.buyerId, rateBps: rates.buyer },
        ];
        if (facts.sellerId) {
            lines.push({ side: billing_enum_js_1.CommissionSide.SELLER, partyId: facts.sellerId, rateBps: sellerBps });
        }
        const created = [];
        for (const line of lines) {
            const baseAmount = (0, pricing_js_1.bpsOf)(dealValue, line.rateBps);
            if (baseAmount <= 0)
                continue;
            const taxAmount = (0, pricing_js_1.gstOn)(baseAmount);
            try {
                const doc = await this.commissionModel.create({
                    purchaseId: new mongoose_2.Types.ObjectId(facts.purchaseId),
                    propertyId: new mongoose_2.Types.ObjectId(facts.propertyId),
                    partyId: new mongoose_2.Types.ObjectId(line.partyId),
                    side: line.side,
                    dealValue,
                    rateBps: line.rateBps,
                    baseAmount,
                    taxAmount,
                    amount: baseAmount + taxAmount,
                    status: billing_enum_js_1.CommissionStatus.ACCRUED,
                    city: facts.city,
                });
                created.push(doc);
            }
            catch (error) {
                if (error.code === 11000)
                    continue;
                throw error;
            }
        }
        if (created.length) {
            const total = created.reduce((sum, c) => sum + c.amount, 0);
            this.logger.log(`Accrued ₹${total} commission on purchase ${facts.purchaseId} (${created.length} line(s))`);
        }
        return created;
    }
    async loadOrThrow(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException(`"${id}" is not a valid commission ID`);
        }
        const commission = await this.commissionModel.findById(id);
        if (!commission)
            throw new common_1.NotFoundException(`Commission with ID "${id}" not found`);
        return commission;
    }
    async loadPayable(id, partyId) {
        const commission = await this.loadOrThrow(id);
        if ((0, reference_id_helper_js_1.referenceId)(commission.partyId) !== partyId) {
            throw new common_1.ForbiddenException('This commission invoice belongs to a different account');
        }
        if (commission.status === billing_enum_js_1.CommissionStatus.PAID) {
            throw new common_1.BadRequestException('This commission has already been settled');
        }
        if (commission.status === billing_enum_js_1.CommissionStatus.WAIVED) {
            throw new common_1.BadRequestException('This commission was waived — nothing is owed');
        }
        return commission;
    }
    async settle(commissionId, paymentId) {
        const commission = await this.loadOrThrow(commissionId);
        commission.status = billing_enum_js_1.CommissionStatus.PAID;
        commission.paymentId = new mongoose_2.Types.ObjectId(paymentId);
        commission.settledAt = new Date();
        await commission.save();
        this.logger.log(`Commission ${commissionId} settled — ₹${commission.amount}`);
        return commission;
    }
    async waive(commissionId, reason) {
        const commission = await this.loadOrThrow(commissionId);
        if (commission.status === billing_enum_js_1.CommissionStatus.PAID) {
            throw new common_1.BadRequestException('A settled commission cannot be waived');
        }
        commission.status = billing_enum_js_1.CommissionStatus.WAIVED;
        commission.waiverReason = reason || 'Waived by platform';
        await commission.save();
        return this.toResponse(commission);
    }
    async reinstate(commissionId) {
        const commission = await this.loadOrThrow(commissionId);
        if (commission.status === billing_enum_js_1.CommissionStatus.PAID) {
            throw new common_1.BadRequestException('This commission has already been settled — there is nothing to reinstate');
        }
        if (commission.status === billing_enum_js_1.CommissionStatus.ACCRUED) {
            throw new common_1.BadRequestException('This commission is already outstanding');
        }
        commission.status = billing_enum_js_1.CommissionStatus.ACCRUED;
        commission.waiverReason = null;
        await commission.save();
        this.logger.log(`Commission ${commissionId} reinstated — ₹${commission.amount} payable again`);
        return this.toResponse(commission);
    }
    async outstandingForPurchase(purchaseId) {
        if (!mongoose_2.Types.ObjectId.isValid(purchaseId))
            return [];
        return this.commissionModel.find({
            purchaseId: new mongoose_2.Types.ObjectId(purchaseId),
            status: billing_enum_js_1.CommissionStatus.ACCRUED,
        });
    }
    async summaryForPurchases(purchaseIds) {
        const ids = purchaseIds.filter((id) => mongoose_2.Types.ObjectId.isValid(id)).map((id) => new mongoose_2.Types.ObjectId(id));
        const result = new Map();
        if (!ids.length)
            return result;
        const rows = await this.commissionModel.find({ purchaseId: { $in: ids } });
        for (const row of rows) {
            const key = (0, reference_id_helper_js_1.referenceId)(row.purchaseId) ?? '';
            const entry = result.get(key) ?? { due: 0, paid: 0, lines: [] };
            if (row.status === billing_enum_js_1.CommissionStatus.ACCRUED)
                entry.due += row.amount;
            if (row.status === billing_enum_js_1.CommissionStatus.PAID)
                entry.paid += row.amount;
            entry.lines.push(this.toResponse(row));
            result.set(key, entry);
        }
        return result;
    }
    async findByParty(partyId) {
        if (!mongoose_2.Types.ObjectId.isValid(partyId))
            return [];
        const rows = await this.commissionModel
            .find({ partyId })
            .populate('propertyId', 'title')
            .sort({ createdAt: -1 });
        return rows.map((c) => this.toResponse(c));
    }
    async findAll(limit = 100) {
        const rows = await this.commissionModel
            .find()
            .populate('propertyId', 'title')
            .populate('partyId', 'name email')
            .sort({ createdAt: -1 })
            .limit(limit);
        return rows.map((c) => this.toResponse(c));
    }
    async totals() {
        const rows = await this.commissionModel.aggregate([
            { $group: { _id: '$status', amount: { $sum: '$amount' }, count: { $sum: 1 } } },
        ]);
        return Object.fromEntries(rows.map((r) => [r._id, { amount: r.amount, count: r.count }]));
    }
    async totalsByCity() {
        const rows = await this.commissionModel.aggregate([
            { $match: { status: { $ne: billing_enum_js_1.CommissionStatus.WAIVED } } },
            { $group: { _id: '$city', amount: { $sum: '$amount' }, deals: { $addToSet: '$purchaseId' } } },
            { $project: { amount: 1, deals: { $size: '$deals' } } },
            { $sort: { amount: -1 } },
        ]);
        return rows.map((r) => ({ city: r._id ?? 'Unknown', amount: r.amount, deals: r.deals }));
    }
};
exports.CommissionsService = CommissionsService;
exports.CommissionsService = CommissionsService = CommissionsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(commission_schema_js_1.Commission.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        subscriptions_service_js_1.SubscriptionsService])
], CommissionsService);
//# sourceMappingURL=commissions.service.js.map
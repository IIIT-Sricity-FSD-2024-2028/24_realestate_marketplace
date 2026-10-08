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
var SubscriptionsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const subscription_schema_js_1 = require("./schemas/subscription.schema.js");
const billing_enum_js_1 = require("../../shared/enums/billing.enum.js");
const pricing_js_1 = require("../../shared/constants/pricing.js");
const ist_time_helper_js_1 = require("../../shared/helpers/ist-time.helper.js");
const DAY_MS = 24 * 60 * 60 * 1000;
let SubscriptionsService = SubscriptionsService_1 = class SubscriptionsService {
    subscriptionModel;
    logger = new common_1.Logger(SubscriptionsService_1.name);
    constructor(subscriptionModel) {
        this.subscriptionModel = subscriptionModel;
    }
    async activePlan(sellerId) {
        const free = {
            tier: billing_enum_js_1.PlanTier.FREE,
            definition: pricing_js_1.PLAN_CATALOG[billing_enum_js_1.PlanTier.FREE],
            subscription: null,
        };
        if (!mongoose_2.Types.ObjectId.isValid(sellerId))
            return free;
        const subscription = await this.subscriptionModel
            .findOne({
            sellerId,
            status: billing_enum_js_1.SubscriptionStatus.ACTIVE,
            expiresAt: { $gt: new Date() },
        })
            .sort({ expiresAt: -1 });
        if (!subscription)
            return free;
        return {
            tier: subscription.tier,
            definition: pricing_js_1.PLAN_CATALOG[subscription.tier],
            subscription,
        };
    }
    async activate(sellerId, tier, cycle, amountPaid, paymentId) {
        if (tier === billing_enum_js_1.PlanTier.FREE) {
            throw new common_1.BadRequestException('The Starter plan is free — there is nothing to activate.');
        }
        const { months } = pricing_js_1.BILLING_CYCLES[cycle];
        const current = await this.activePlan(sellerId);
        if (current.subscription && current.tier === tier) {
            const extended = new Date(current.subscription.expiresAt);
            extended.setMonth(extended.getMonth() + months);
            current.subscription.expiresAt = extended;
            current.subscription.cycle = cycle;
            current.subscription.amountPaid += amountPaid;
            current.subscription.paymentId = new mongoose_2.Types.ObjectId(paymentId);
            await current.subscription.save();
            this.logger.log(`Extended ${tier} plan for seller ${sellerId} to ${extended.toISOString()}`);
            return current.subscription;
        }
        if (current.subscription) {
            current.subscription.status = billing_enum_js_1.SubscriptionStatus.CANCELLED;
            await current.subscription.save();
        }
        const startsAt = new Date();
        const expiresAt = new Date(startsAt);
        expiresAt.setMonth(expiresAt.getMonth() + months);
        const created = await this.subscriptionModel.create({
            sellerId: new mongoose_2.Types.ObjectId(sellerId),
            tier,
            cycle,
            amountPaid,
            status: billing_enum_js_1.SubscriptionStatus.ACTIVE,
            startsAt,
            expiresAt,
            paymentId: new mongoose_2.Types.ObjectId(paymentId),
        });
        this.logger.log(`Activated ${tier} plan for seller ${sellerId} until ${expiresAt.toISOString()}`);
        return created;
    }
    async cancel(sellerId) {
        const current = await this.activePlan(sellerId);
        if (!current.subscription) {
            throw new common_1.BadRequestException('You are on the free Starter plan — there is nothing to cancel.');
        }
        current.subscription.status = billing_enum_js_1.SubscriptionStatus.CANCELLED;
        await current.subscription.save();
        return this.activePlan(sellerId);
    }
    hasListingHeadroom(plan, listingsUsed) {
        const quota = plan.definition.listingQuota;
        return quota === null || listingsUsed < quota;
    }
    toResponse(plan, listingsUsed) {
        const { definition, subscription } = plan;
        const quota = definition.listingQuota;
        const daysRemaining = subscription
            ? Math.max(0, Math.ceil((subscription.expiresAt.getTime() - Date.now()) / DAY_MS))
            : 0;
        return {
            id: subscription?._id.toString() ?? null,
            tier: plan.tier,
            planName: definition.name,
            cycle: subscription?.cycle ?? null,
            status: subscription?.status ?? billing_enum_js_1.SubscriptionStatus.ACTIVE,
            listingQuota: quota,
            listingsUsed,
            listingsRemaining: quota === null ? null : Math.max(0, quota - listingsUsed),
            commissionDiscountBps: definition.commissionDiscountBps,
            highlights: definition.highlights,
            startsAt: subscription ? (0, ist_time_helper_js_1.istTimestamp)(subscription.startsAt) : null,
            expiresAt: subscription ? (0, ist_time_helper_js_1.istTimestamp)(subscription.expiresAt) : null,
            daysRemaining,
            ...(subscription && daysRemaining <= 7 && { renewalDue: true }),
        };
    }
    async activeCountsByTier() {
        const rows = await this.subscriptionModel.aggregate([
            { $match: { status: billing_enum_js_1.SubscriptionStatus.ACTIVE, expiresAt: { $gt: new Date() } } },
            { $group: { _id: '$tier', count: { $sum: 1 } } },
        ]);
        return Object.fromEntries(rows.map((r) => [r._id, r.count]));
    }
    async monthlyRecurringRevenue() {
        const counts = await this.activeCountsByTier();
        return Object.entries(counts).reduce((total, [tier, count]) => {
            const definition = pricing_js_1.PLAN_CATALOG[tier];
            return total + (definition ? definition.pricePerMonth * count : 0);
        }, 0);
    }
};
exports.SubscriptionsService = SubscriptionsService;
exports.SubscriptionsService = SubscriptionsService = SubscriptionsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(subscription_schema_js_1.Subscription.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], SubscriptionsService);
//# sourceMappingURL=subscriptions.service.js.map
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
var BillingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingService = void 0;
const common_1 = require("@nestjs/common");
const payments_service_js_1 = require("../payments/payments.service.js");
const subscriptions_service_js_1 = require("../subscriptions/subscriptions.service.js");
const commissions_service_js_1 = require("../commissions/commissions.service.js");
const properties_service_js_1 = require("../properties/properties.service.js");
const pricing_js_1 = require("../../shared/constants/pricing.js");
const billing_enum_js_1 = require("../../shared/enums/billing.enum.js");
const user_schema_js_1 = require("../users/schemas/user.schema.js");
let BillingService = BillingService_1 = class BillingService {
    paymentsService;
    subscriptionsService;
    commissionsService;
    propertiesService;
    logger = new common_1.Logger(BillingService_1.name);
    constructor(paymentsService, subscriptionsService, commissionsService, propertiesService) {
        this.paymentsService = paymentsService;
        this.subscriptionsService = subscriptionsService;
        this.commissionsService = commissionsService;
        this.propertiesService = propertiesService;
    }
    catalog() {
        return {
            plans: pricing_js_1.PLAN_TIERS.map((tier) => {
                const plan = pricing_js_1.PLAN_CATALOG[tier];
                return {
                    ...plan,
                    pricing: Object.fromEntries(Object.keys(pricing_js_1.BILLING_CYCLES).map((cycle) => {
                        const base = (0, pricing_js_1.planPrice)(tier, cycle);
                        return [cycle, { base, tax: (0, pricing_js_1.gstOn)(base), total: base + (0, pricing_js_1.gstOn)(base) }];
                    })),
                };
            }),
            cycles: Object.entries(pricing_js_1.BILLING_CYCLES).map(([key, value]) => ({ key, ...value })),
            featuredPacks: pricing_js_1.FEATURED_TIERS.map((tier) => {
                const pack = pricing_js_1.FEATURED_PACKS[tier];
                return { ...pack, tax: (0, pricing_js_1.gstOn)(pack.price), total: pack.price + (0, pricing_js_1.gstOn)(pack.price) };
            }),
            commission: pricing_js_1.COMMISSION_BPS,
            gstPercent: pricing_js_1.GST_PERCENT,
            gateway: this.paymentsService.gatewayName,
            isLive: this.paymentsService.isLive,
        };
    }
    assertSeller(user) {
        if (user.userType !== user_schema_js_1.UserType.SELLER) {
            throw new common_1.ForbiddenException('Only seller accounts can buy listing plans and promotions');
        }
    }
    async quote(dto, user) {
        switch (dto.purpose) {
            case billing_enum_js_1.PaymentPurpose.SUBSCRIPTION: {
                this.assertSeller(user);
                if (!dto.tier || !dto.cycle) {
                    throw new common_1.BadRequestException('A plan tier and billing cycle are required');
                }
                if (dto.tier === billing_enum_js_1.PlanTier.FREE) {
                    throw new common_1.BadRequestException('The Starter plan is free — there is nothing to pay for.');
                }
                const base = (0, pricing_js_1.planPrice)(dto.tier, dto.cycle);
                const plan = pricing_js_1.PLAN_CATALOG[dto.tier];
                return {
                    baseAmount: base,
                    taxAmount: (0, pricing_js_1.gstOn)(base),
                    description: `${plan.name} plan — ${pricing_js_1.BILLING_CYCLES[dto.cycle].label.toLowerCase()}`,
                    metadata: { tier: dto.tier, cycle: dto.cycle, months: pricing_js_1.BILLING_CYCLES[dto.cycle].months },
                };
            }
            case billing_enum_js_1.PaymentPurpose.FEATURED_LISTING: {
                this.assertSeller(user);
                if (!dto.propertyId || !dto.pack) {
                    throw new common_1.BadRequestException('A property and a promotion pack are required');
                }
                const owned = await this.propertiesService.promotableForSeller(user.id);
                const property = owned.find((p) => p.id === dto.propertyId);
                if (!property) {
                    throw new common_1.ForbiddenException('You can only promote your own active listings');
                }
                const pack = pricing_js_1.FEATURED_PACKS[dto.pack];
                return {
                    baseAmount: pack.price,
                    taxAmount: (0, pricing_js_1.gstOn)(pack.price),
                    description: `${pack.name} promotion (${pack.days} days) — ${property.title}`,
                    metadata: {
                        propertyId: dto.propertyId,
                        pack: dto.pack,
                        days: pack.days,
                        propertyTitle: property.title,
                    },
                };
            }
            case billing_enum_js_1.PaymentPurpose.COMMISSION: {
                if (!dto.commissionId) {
                    throw new common_1.BadRequestException('A commission invoice ID is required');
                }
                const commission = await this.commissionsService.loadPayable(dto.commissionId, user.id);
                return {
                    baseAmount: commission.baseAmount,
                    taxAmount: commission.taxAmount,
                    description: `Platform commission (${(commission.rateBps / 100).toFixed(2)}% ${commission.side}-side)`,
                    metadata: {
                        commissionId: dto.commissionId,
                        side: commission.side,
                        purchaseId: commission.purchaseId.toString(),
                    },
                };
            }
            default:
                throw new common_1.BadRequestException('Unsupported payment purpose');
        }
    }
    async checkout(dto, user) {
        const quote = await this.quote(dto, user);
        const { checkout } = await this.paymentsService.openOrder({
            userId: user.id,
            purpose: dto.purpose,
            baseAmount: quote.baseAmount,
            taxAmount: quote.taxAmount,
            description: quote.description,
            metadata: quote.metadata,
        });
        return checkout;
    }
    async verify(dto, user) {
        const payment = await this.paymentsService.verifyAndCapture(dto, user.id);
        const unlocked = await this.fulfil(payment, user);
        return { payment: this.paymentsService.toResponse(payment), unlocked };
    }
    async fulfil(payment, user) {
        const meta = payment.metadata ?? {};
        switch (payment.purpose) {
            case billing_enum_js_1.PaymentPurpose.SUBSCRIPTION: {
                const subscription = await this.subscriptionsService.activate(user.id, meta.tier, meta.cycle, payment.amount, payment._id.toString());
                const plan = pricing_js_1.PLAN_CATALOG[subscription.tier];
                const quota = plan.listingQuota === null ? 'unlimited' : `${plan.listingQuota}`;
                return `${plan.name} plan active — ${quota} listings, valid until ${subscription.expiresAt.toDateString()}`;
            }
            case billing_enum_js_1.PaymentPurpose.FEATURED_LISTING: {
                const property = await this.propertiesService.applyFeature(meta.propertyId, meta.pack, user.id);
                return `"${property.title}" is now featured at the top of buyer search`;
            }
            case billing_enum_js_1.PaymentPurpose.COMMISSION: {
                const commission = await this.commissionsService.settle(meta.commissionId, payment._id.toString());
                return `Commission invoice settled — ₹${commission.amount.toLocaleString('en-IN')}`;
            }
            default:
                this.logger.error(`No fulfilment handler for purpose "${String(payment.purpose)}"`);
                throw new common_1.BadRequestException('This payment could not be applied. Contact support.');
        }
    }
    async summary(user) {
        const [commissions, payments] = await Promise.all([
            this.commissionsService.findByParty(user.id),
            this.paymentsService.findByUser(user.id),
        ]);
        const amountDue = commissions
            .filter((c) => c.status === billing_enum_js_1.CommissionStatus.ACCRUED)
            .reduce((sum, c) => sum + c.amount, 0);
        const lifetimeSpend = payments
            .filter((p) => p.status === billing_enum_js_1.PaymentStatus.PAID)
            .reduce((sum, p) => sum + p.amount, 0);
        const summary = { commissions, amountDue, lifetimeSpend, payments };
        if (user.userType === user_schema_js_1.UserType.SELLER) {
            const [plan, used, listings] = await Promise.all([
                this.subscriptionsService.activePlan(user.id),
                this.propertiesService.countListingsForQuota(user.id),
                this.propertiesService.promotableForSeller(user.id),
            ]);
            summary.plan = this.subscriptionsService.toResponse(plan, used);
            summary.listings = listings;
        }
        return summary;
    }
    async cancelSubscription(user) {
        this.assertSeller(user);
        const plan = await this.subscriptionsService.cancel(user.id);
        const listings = await this.propertiesService.promotableForSeller(user.id);
        return this.subscriptionsService.toResponse(plan, listings.length);
    }
    async revenueReport() {
        const [byStream, monthly, commissionTotals, byCity, subscriptions, mrr, funnel, recentPayments] = await Promise.all([
            this.paymentsService.totalsByPurpose(),
            this.paymentsService.monthlyTotals(6),
            this.commissionsService.totals(),
            this.commissionsService.totalsByCity(),
            this.subscriptionsService.activeCountsByTier(),
            this.subscriptionsService.monthlyRecurringRevenue(),
            this.paymentsService.statusCounts(),
            this.paymentsService.findAll(12),
        ]);
        const totalCollected = Object.values(byStream).reduce((sum, s) => sum + s.amount, 0);
        return {
            totalCollected,
            receivable: commissionTotals[billing_enum_js_1.CommissionStatus.ACCRUED]?.amount ?? 0,
            mrr,
            waived: commissionTotals[billing_enum_js_1.CommissionStatus.WAIVED]?.amount ?? 0,
            byStream,
            monthly,
            byCity,
            subscriptions,
            checkoutFunnel: {
                created: funnel[billing_enum_js_1.PaymentStatus.CREATED] ?? 0,
                paid: funnel[billing_enum_js_1.PaymentStatus.PAID] ?? 0,
                failed: funnel[billing_enum_js_1.PaymentStatus.FAILED] ?? 0,
            },
            recentPayments,
        };
    }
};
exports.BillingService = BillingService;
exports.BillingService = BillingService = BillingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [payments_service_js_1.PaymentsService,
        subscriptions_service_js_1.SubscriptionsService,
        commissions_service_js_1.CommissionsService,
        properties_service_js_1.PropertiesService])
], BillingService);
//# sourceMappingURL=billing.service.js.map
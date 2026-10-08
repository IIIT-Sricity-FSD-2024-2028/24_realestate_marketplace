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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const billing_service_js_1 = require("./billing.service.js");
const checkout_dto_js_1 = require("./dto/checkout.dto.js");
const billing_response_dto_js_1 = require("./dto/billing-response.dto.js");
const payments_service_js_1 = require("../payments/payments.service.js");
const payment_response_dto_js_1 = require("../payments/dto/payment-response.dto.js");
const create_payment_dto_js_1 = require("../payments/dto/create-payment.dto.js");
const subscription_response_dto_js_1 = require("../subscriptions/dto/subscription-response.dto.js");
const role_enum_js_1 = require("../../common/enums/role.enum.js");
const api_role_decorator_js_1 = require("../../common/decorators/api-role.decorator.js");
const current_user_decorator_js_1 = require("../../common/decorators/current-user.decorator.js");
const api_response_decorator_js_1 = require("../../common/decorators/api-response.decorator.js");
let BillingController = class BillingController {
    billingService;
    paymentsService;
    constructor(billingService, paymentsService) {
        this.billingService = billingService;
        this.paymentsService = paymentsService;
    }
    catalog() {
        return { message: 'Catalog retrieved successfully', data: this.billingService.catalog() };
    }
    async summary(user) {
        const data = await this.billingService.summary(user);
        return { message: 'Billing summary retrieved successfully', data };
    }
    async checkout(dto, user) {
        const data = await this.billingService.checkout(dto, user);
        return { message: 'Payment order created', data };
    }
    async verifyPayment(dto, user) {
        const { payment, unlocked } = await this.billingService.verify(dto, user);
        return { message: unlocked, data: payment };
    }
    async cancelled(dto, user) {
        const data = await this.paymentsService.markFailed(dto.orderId, user.id, dto.reason);
        return { message: 'Payment cancelled', data };
    }
    simulate(orderId) {
        return {
            message: 'Demo payment authorised',
            data: this.paymentsService.simulateCheckout(orderId),
        };
    }
    async cancelSubscription(user) {
        const data = await this.billingService.cancelSubscription(user);
        return { message: 'Plan cancelled — you are back on the free Starter plan', data };
    }
    async revenue() {
        const data = await this.billingService.revenueReport();
        return { message: 'Revenue report retrieved successfully', data };
    }
};
exports.BillingController = BillingController;
__decorate([
    (0, common_1.Get)('catalog'),
    (0, api_role_decorator_js_1.ApiRole)(role_enum_js_1.Role.USER, role_enum_js_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'The published rate card',
        description: 'Plans, promotion packs, commission rates and GST — plus which gateway driver is active. ' +
            'Dashboards render prices from this so the displayed price and the charged price cannot drift.',
    }),
    (0, api_response_decorator_js_1.ApiSuccessResponse)(billing_response_dto_js_1.CatalogResponseDto),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BillingController.prototype, "catalog", null);
__decorate([
    (0, common_1.Get)('summary'),
    (0, api_role_decorator_js_1.ApiRole)(role_enum_js_1.Role.USER),
    (0, swagger_1.ApiOperation)({
        summary: "The authenticated account's billing page, in one call",
        description: 'Sellers get their plan, quota usage and promotable listings; both buyers and sellers get ' +
            'their commission invoices, outstanding balance and payment history.',
    }),
    (0, api_response_decorator_js_1.ApiSuccessResponse)(billing_response_dto_js_1.BillingSummaryDto),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "summary", null);
__decorate([
    (0, common_1.Post)('checkout'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, api_role_decorator_js_1.ApiRole)(role_enum_js_1.Role.USER),
    (0, swagger_1.ApiOperation)({
        summary: 'Open a payment order',
        description: 'Prices the purchase server-side from the rate card and opens an order with the active ' +
            'gateway. Nothing is granted at this point — the order still has to be paid and verified.',
    }),
    (0, api_response_decorator_js_1.ApiSuccessResponse)(payment_response_dto_js_1.CheckoutOrderDto, 201),
    (0, api_response_decorator_js_1.ApiValidationError)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_js_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [checkout_dto_js_1.CheckoutDto, Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "checkout", null);
__decorate([
    (0, common_1.Post)('verify'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, api_role_decorator_js_1.ApiRole)(role_enum_js_1.Role.USER),
    (0, swagger_1.ApiOperation)({
        summary: 'Verify a completed payment and unlock what was bought',
        description: 'Checks the HMAC signature against the order, marks the payment paid, then activates the ' +
            'plan / promotes the listing / settles the invoice. An unverifiable signature grants nothing.',
    }),
    (0, api_response_decorator_js_1.ApiSuccessResponse)(payment_response_dto_js_1.PaymentResponseDto),
    (0, api_response_decorator_js_1.ApiValidationError)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_js_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_payment_dto_js_1.VerifyPaymentDto, Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "verifyPayment", null);
__decorate([
    (0, common_1.Post)('cancelled'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, api_role_decorator_js_1.ApiRole)(role_enum_js_1.Role.USER),
    (0, swagger_1.ApiOperation)({
        summary: 'Record an abandoned or declined checkout',
        description: 'Keeps the funnel honest — an unpaid order is marked failed rather than left open.',
    }),
    (0, api_response_decorator_js_1.ApiSuccessResponse)(payment_response_dto_js_1.PaymentResponseDto),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_js_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_payment_dto_js_1.FailPaymentDto, Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "cancelled", null);
__decorate([
    (0, common_1.Post)('demo-checkout/:orderId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, api_role_decorator_js_1.ApiRole)(role_enum_js_1.Role.USER),
    (0, swagger_1.ApiOperation)({
        summary: 'Offline gateway only — simulate paying an order',
        description: 'Returns a genuine HMAC signature for the order, which the client then submits to ' +
            '/billing/verify exactly as it would a real one. Disabled when Razorpay keys are set.',
    }),
    (0, swagger_1.ApiParam)({ name: 'orderId', description: 'Gateway order id from /billing/checkout' }),
    __param(0, (0, common_1.Param)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BillingController.prototype, "simulate", null);
__decorate([
    (0, common_1.Patch)('subscription/cancel'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, api_role_decorator_js_1.ApiRole)(role_enum_js_1.Role.USER),
    (0, swagger_1.ApiOperation)({
        summary: 'Cancel the active listing plan',
        description: 'The seller drops to the free Starter tier and its listing quota immediately.',
    }),
    (0, api_response_decorator_js_1.ApiSuccessResponse)(subscription_response_dto_js_1.SubscriptionResponseDto),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "cancelSubscription", null);
__decorate([
    (0, common_1.Get)('revenue'),
    (0, api_role_decorator_js_1.ApiRole)(role_enum_js_1.Role.SUPERUSER),
    (0, swagger_1.ApiOperation)({
        summary: 'Platform revenue report',
        description: 'Superuser only. Collected revenue by stream and by month, commission receivable, MRR from ' +
            'live plans, revenue per city, and the checkout conversion funnel.',
    }),
    (0, api_response_decorator_js_1.ApiSuccessResponse)(billing_response_dto_js_1.RevenueReportDto),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "revenue", null);
exports.BillingController = BillingController = __decorate([
    (0, swagger_1.ApiTags)('Billing'),
    (0, common_1.Controller)('billing'),
    __metadata("design:paramtypes", [billing_service_js_1.BillingService,
        payments_service_js_1.PaymentsService])
], BillingController);
//# sourceMappingURL=billing.controller.js.map
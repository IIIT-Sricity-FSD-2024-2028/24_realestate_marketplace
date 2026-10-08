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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RevenueReportDto = exports.BillingSummaryDto = exports.CatalogResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const payment_response_dto_js_1 = require("../../payments/dto/payment-response.dto.js");
const commission_response_dto_js_1 = require("../../commissions/dto/commission-response.dto.js");
const subscription_response_dto_js_1 = require("../../subscriptions/dto/subscription-response.dto.js");
const property_response_dto_js_1 = require("../../properties/dto/property-response.dto.js");
class CatalogResponseDto {
    plans;
    cycles;
    featuredPacks;
    commission;
    gstPercent;
    gateway;
    isLive;
}
exports.CatalogResponseDto = CatalogResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [Object], description: 'Seller listing plans, cheapest first' }),
    __metadata("design:type", Array)
], CatalogResponseDto.prototype, "plans", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [Object], description: 'Billing cycles and their commitment discounts' }),
    __metadata("design:type", Array)
], CatalogResponseDto.prototype, "cycles", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [Object], description: 'Paid promotion packs for a single listing' }),
    __metadata("design:type", Array)
], CatalogResponseDto.prototype, "featuredPacks", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Commission rates in basis points, by listing type' }),
    __metadata("design:type", Object)
], CatalogResponseDto.prototype, "commission", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 18, description: 'GST percentage applied to platform fees' }),
    __metadata("design:type", Number)
], CatalogResponseDto.prototype, "gstPercent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'mock', description: 'Active gateway driver' }),
    __metadata("design:type", String)
], CatalogResponseDto.prototype, "gateway", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: false, description: 'False on the mock driver and on Razorpay test keys' }),
    __metadata("design:type", Boolean)
], CatalogResponseDto.prototype, "isLive", void 0);
class BillingSummaryDto {
    plan;
    listings;
    commissions;
    amountDue;
    lifetimeSpend;
    payments;
}
exports.BillingSummaryDto = BillingSummaryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: subscription_response_dto_js_1.SubscriptionResponseDto, description: 'Sellers only' }),
    __metadata("design:type", subscription_response_dto_js_1.SubscriptionResponseDto)
], BillingSummaryDto.prototype, "plan", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [property_response_dto_js_1.PropertyResponseDto], description: 'Sellers only — listings that can be promoted' }),
    __metadata("design:type", Array)
], BillingSummaryDto.prototype, "listings", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [commission_response_dto_js_1.CommissionResponseDto], description: 'Commission invoices owed by this account' }),
    __metadata("design:type", Array)
], BillingSummaryDto.prototype, "commissions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total still owed across unpaid commission invoices (₹)', example: 150450 }),
    __metadata("design:type", Number)
], BillingSummaryDto.prototype, "amountDue", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total this account has paid the platform to date (₹)', example: 8961 }),
    __metadata("design:type", Number)
], BillingSummaryDto.prototype, "lifetimeSpend", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [payment_response_dto_js_1.PaymentResponseDto], description: 'Payment history, newest first' }),
    __metadata("design:type", Array)
], BillingSummaryDto.prototype, "payments", void 0);
class RevenueReportDto {
    totalCollected;
    receivable;
    mrr;
    waived;
    byStream;
    monthly;
    byCity;
    subscriptions;
    checkoutFunnel;
    recentPayments;
}
exports.RevenueReportDto = RevenueReportDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Cash actually collected, all streams (₹)', example: 312450 }),
    __metadata("design:type", Number)
], RevenueReportDto.prototype, "totalCollected", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Commission earned but not yet settled (₹)', example: 150450 }),
    __metadata("design:type", Number)
], RevenueReportDto.prototype, "receivable", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Normalised monthly recurring revenue from live plans (₹)', example: 12489 }),
    __metadata("design:type", Number)
], RevenueReportDto.prototype, "mrr", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Commission written off (₹)', example: 0 }),
    __metadata("design:type", Number)
], RevenueReportDto.prototype, "waived", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Collected revenue split by stream' }),
    __metadata("design:type", Object)
], RevenueReportDto.prototype, "byStream", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [Object], description: 'Collected revenue per month, oldest first' }),
    __metadata("design:type", Array)
], RevenueReportDto.prototype, "monthly", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [Object], description: 'Commission earned per city' }),
    __metadata("design:type", Array)
], RevenueReportDto.prototype, "byCity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Live paid subscriptions per tier' }),
    __metadata("design:type", Object)
], RevenueReportDto.prototype, "subscriptions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Checkout funnel: orders opened vs paid vs failed' }),
    __metadata("design:type", Object)
], RevenueReportDto.prototype, "checkoutFunnel", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [payment_response_dto_js_1.PaymentResponseDto], description: 'Most recent transactions' }),
    __metadata("design:type", Array)
], RevenueReportDto.prototype, "recentPayments", void 0);
//# sourceMappingURL=billing-response.dto.js.map
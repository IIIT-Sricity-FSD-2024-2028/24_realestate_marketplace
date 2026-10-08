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
exports.CheckoutOrderDto = exports.PaymentResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const billing_enum_js_1 = require("../../../shared/enums/billing.enum.js");
class PaymentResponseDto {
    id;
    userId;
    purpose;
    description;
    baseAmount;
    taxAmount;
    amount;
    currency;
    status;
    receipt;
    gateway;
    gatewayOrderId;
    gatewayPaymentId;
    metadata;
    failureReason;
    paidAt;
    payerName;
    payerEmail;
    createdAt;
    updatedAt;
}
exports.PaymentResponseDto = PaymentResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '65f1b2c3d4e5f6a7b8c9d0e1' }),
    __metadata("design:type", String)
], PaymentResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '65f1b2c3d4e5f6a7b8c9d0e1', nullable: true }),
    __metadata("design:type", Object)
], PaymentResponseDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: billing_enum_js_1.PaymentPurpose, example: billing_enum_js_1.PaymentPurpose.SUBSCRIPTION }),
    __metadata("design:type", String)
], PaymentResponseDto.prototype, "purpose", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Gold plan — 3 months' }),
    __metadata("design:type", String)
], PaymentResponseDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Amount before GST (₹)', example: 6747 }),
    __metadata("design:type", Number)
], PaymentResponseDto.prototype, "baseAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'GST charged (₹)', example: 1214 }),
    __metadata("design:type", Number)
], PaymentResponseDto.prototype, "taxAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total charged (₹)', example: 7961 }),
    __metadata("design:type", Number)
], PaymentResponseDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'INR' }),
    __metadata("design:type", String)
], PaymentResponseDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: billing_enum_js_1.PaymentStatus, example: billing_enum_js_1.PaymentStatus.PAID }),
    __metadata("design:type", String)
], PaymentResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'TRU-SUB-8F2A19' }),
    __metadata("design:type", String)
], PaymentResponseDto.prototype, "receipt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'mock' }),
    __metadata("design:type", String)
], PaymentResponseDto.prototype, "gateway", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'order_NcL9k2Xp' }),
    __metadata("design:type", String)
], PaymentResponseDto.prototype, "gatewayOrderId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'pay_NcLA3mQ1', nullable: true }),
    __metadata("design:type", Object)
], PaymentResponseDto.prototype, "gatewayPaymentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: Object, example: { tier: 'gold', cycle: 'quarterly' } }),
    __metadata("design:type", Object)
], PaymentResponseDto.prototype, "metadata", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: null, nullable: true }),
    __metadata("design:type", Object)
], PaymentResponseDto.prototype, "failureReason", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-08-28T09:19:55.704+05:30', nullable: true }),
    __metadata("design:type", Object)
], PaymentResponseDto.prototype, "paidAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Populated on the superuser revenue ledger' }),
    __metadata("design:type", String)
], PaymentResponseDto.prototype, "payerName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], PaymentResponseDto.prototype, "payerEmail", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-08-28T09:19:55.704+05:30' }),
    __metadata("design:type", String)
], PaymentResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-08-28T09:19:55.704+05:30' }),
    __metadata("design:type", String)
], PaymentResponseDto.prototype, "updatedAt", void 0);
class CheckoutOrderDto {
    orderId;
    paymentId;
    amount;
    baseAmount;
    taxAmount;
    currency;
    keyId;
    gateway;
    isLive;
    description;
    receipt;
}
exports.CheckoutOrderDto = CheckoutOrderDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'order_NcL9k2Xp' }),
    __metadata("design:type", String)
], CheckoutOrderDto.prototype, "orderId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '65f1b2c3d4e5f6a7b8c9d0e1' }),
    __metadata("design:type", String)
], CheckoutOrderDto.prototype, "paymentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total payable (₹)', example: 7961 }),
    __metadata("design:type", Number)
], CheckoutOrderDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 6747 }),
    __metadata("design:type", Number)
], CheckoutOrderDto.prototype, "baseAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1214 }),
    __metadata("design:type", Number)
], CheckoutOrderDto.prototype, "taxAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'INR' }),
    __metadata("design:type", String)
], CheckoutOrderDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Publishable gateway key for the checkout widget' }),
    __metadata("design:type", String)
], CheckoutOrderDto.prototype, "keyId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'mock', description: '`mock` renders the built-in demo checkout; `razorpay` loads their widget' }),
    __metadata("design:type", String)
], CheckoutOrderDto.prototype, "gateway", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'False for the mock driver and Razorpay test keys — the UI shows a TEST MODE banner' }),
    __metadata("design:type", Boolean)
], CheckoutOrderDto.prototype, "isLive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Gold plan — 3 months' }),
    __metadata("design:type", String)
], CheckoutOrderDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'TRU-SUB-8F2A19' }),
    __metadata("design:type", String)
], CheckoutOrderDto.prototype, "receipt", void 0);
//# sourceMappingURL=payment-response.dto.js.map
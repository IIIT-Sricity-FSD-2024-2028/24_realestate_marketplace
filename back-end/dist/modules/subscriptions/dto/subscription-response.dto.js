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
exports.SubscriptionResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const billing_enum_js_1 = require("../../../shared/enums/billing.enum.js");
class SubscriptionResponseDto {
    id;
    tier;
    planName;
    cycle;
    status;
    listingQuota;
    listingsUsed;
    listingsRemaining;
    commissionDiscountBps;
    highlights;
    startsAt;
    expiresAt;
    daysRemaining;
    renewalDue;
}
exports.SubscriptionResponseDto = SubscriptionResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '65f1b2c3d4e5f6a7b8c9d0e1', nullable: true }),
    __metadata("design:type", Object)
], SubscriptionResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: billing_enum_js_1.PlanTier, example: billing_enum_js_1.PlanTier.GOLD }),
    __metadata("design:type", String)
], SubscriptionResponseDto.prototype, "tier", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Gold' }),
    __metadata("design:type", String)
], SubscriptionResponseDto.prototype, "planName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'quarterly', nullable: true }),
    __metadata("design:type", Object)
], SubscriptionResponseDto.prototype, "cycle", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: billing_enum_js_1.SubscriptionStatus, example: billing_enum_js_1.SubscriptionStatus.ACTIVE }),
    __metadata("design:type", String)
], SubscriptionResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Properties this plan allows in total. `null` means unlimited.',
        example: null,
        nullable: true,
    }),
    __metadata("design:type", Object)
], SubscriptionResponseDto.prototype, "listingQuota", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Properties on the account, counted against the quota. Includes sold and rented ' +
            'listings — a closed deal does not free a slot.',
        example: 4,
    }),
    __metadata("design:type", Number)
], SubscriptionResponseDto.prototype, "listingsUsed", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'How many more properties this plan allows. `null` = unlimited.', nullable: true }),
    __metadata("design:type", Object)
], SubscriptionResponseDto.prototype, "listingsRemaining", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Discount on seller commission, in basis points', example: 50 }),
    __metadata("design:type", Number)
], SubscriptionResponseDto.prototype, "commissionDiscountBps", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [String] }),
    __metadata("design:type", Array)
], SubscriptionResponseDto.prototype, "highlights", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-08-28T09:19:55.704+05:30', nullable: true }),
    __metadata("design:type", Object)
], SubscriptionResponseDto.prototype, "startsAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-11-28T09:19:55.704+05:30', nullable: true }),
    __metadata("design:type", Object)
], SubscriptionResponseDto.prototype, "expiresAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Days left in the current term. 0 on the free tier.', example: 61 }),
    __metadata("design:type", Number)
], SubscriptionResponseDto.prototype, "daysRemaining", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Set when the plan expires within a week' }),
    __metadata("design:type", Boolean)
], SubscriptionResponseDto.prototype, "renewalDue", void 0);
//# sourceMappingURL=subscription-response.dto.js.map
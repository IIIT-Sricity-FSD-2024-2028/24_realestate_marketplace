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
exports.CheckoutDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const billing_enum_js_1 = require("../../../shared/enums/billing.enum.js");
const pricing_js_1 = require("../../../shared/constants/pricing.js");
const CYCLES = Object.keys(pricing_js_1.BILLING_CYCLES);
class CheckoutDto {
    purpose;
    tier;
    cycle;
    propertyId;
    pack;
    commissionId;
}
exports.CheckoutDto = CheckoutDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: billing_enum_js_1.PaymentPurpose, description: 'Which revenue stream this purchase belongs to' }),
    (0, class_validator_1.IsEnum)(billing_enum_js_1.PaymentPurpose, { message: 'purpose must be one of: subscription, featured_listing, commission' }),
    __metadata("design:type", String)
], CheckoutDto.prototype, "purpose", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: billing_enum_js_1.PlanTier, description: 'Required for `subscription`' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(billing_enum_js_1.PlanTier, { message: 'tier must be one of: free, silver, gold' }),
    __metadata("design:type", String)
], CheckoutDto.prototype, "tier", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: CYCLES, description: 'Required for `subscription`', example: 'quarterly' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(CYCLES, { message: `cycle must be one of: ${CYCLES.join(', ')}` }),
    __metadata("design:type", String)
], CheckoutDto.prototype, "cycle", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Required for `featured_listing` — the listing to promote' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsMongoId)({ message: 'propertyId must be a valid property ID' }),
    __metadata("design:type", String)
], CheckoutDto.prototype, "propertyId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: billing_enum_js_1.FeaturedTier, description: 'Required for `featured_listing`' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(billing_enum_js_1.FeaturedTier, { message: 'pack must be one of: spotlight, premium' }),
    __metadata("design:type", String)
], CheckoutDto.prototype, "pack", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Required for `commission` — the invoice being settled' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsMongoId)({ message: 'commissionId must be a valid commission ID' }),
    __metadata("design:type", String)
], CheckoutDto.prototype, "commissionId", void 0);
//# sourceMappingURL=checkout.dto.js.map
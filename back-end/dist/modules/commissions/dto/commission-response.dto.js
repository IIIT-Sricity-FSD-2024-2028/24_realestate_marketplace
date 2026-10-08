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
exports.CommissionResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const billing_enum_js_1 = require("../../../shared/enums/billing.enum.js");
class CommissionResponseDto {
    id;
    purchaseId;
    propertyId;
    partyId;
    side;
    dealValue;
    rateBps;
    ratePercent;
    baseAmount;
    taxAmount;
    amount;
    status;
    city;
    settledAt;
    waiverReason;
    propertyTitle;
    partyName;
    partyEmail;
    createdAt;
}
exports.CommissionResponseDto = CommissionResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '65f1b2c3d4e5f6a7b8c9d0e1' }),
    __metadata("design:type", String)
], CommissionResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '65f1b2c3d4e5f6a7b8c9d0e1', nullable: true }),
    __metadata("design:type", Object)
], CommissionResponseDto.prototype, "purchaseId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '65f1b2c3d4e5f6a7b8c9d0e1', nullable: true }),
    __metadata("design:type", Object)
], CommissionResponseDto.prototype, "propertyId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '65f1b2c3d4e5f6a7b8c9d0e1', nullable: true }),
    __metadata("design:type", Object)
], CommissionResponseDto.prototype, "partyId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: billing_enum_js_1.CommissionSide, example: billing_enum_js_1.CommissionSide.SELLER }),
    __metadata("design:type", String)
], CommissionResponseDto.prototype, "side", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Price the commission was computed on (₹)', example: 8500000 }),
    __metadata("design:type", Number)
], CommissionResponseDto.prototype, "dealValue", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Rate applied, in basis points (100 = 1%)', example: 150 }),
    __metadata("design:type", Number)
], CommissionResponseDto.prototype, "rateBps", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Rate as a percentage, for display', example: 1.5 }),
    __metadata("design:type", Number)
], CommissionResponseDto.prototype, "ratePercent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 127500 }),
    __metadata("design:type", Number)
], CommissionResponseDto.prototype, "baseAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 22950 }),
    __metadata("design:type", Number)
], CommissionResponseDto.prototype, "taxAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 150450 }),
    __metadata("design:type", Number)
], CommissionResponseDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: billing_enum_js_1.CommissionStatus, example: billing_enum_js_1.CommissionStatus.ACCRUED }),
    __metadata("design:type", String)
], CommissionResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Hyderabad', nullable: true }),
    __metadata("design:type", Object)
], CommissionResponseDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: null, nullable: true }),
    __metadata("design:type", Object)
], CommissionResponseDto.prototype, "settledAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: null, nullable: true }),
    __metadata("design:type", Object)
], CommissionResponseDto.prototype, "waiverReason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Populated on list endpoints' }),
    __metadata("design:type", String)
], CommissionResponseDto.prototype, "propertyTitle", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], CommissionResponseDto.prototype, "partyName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], CommissionResponseDto.prototype, "partyEmail", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-08-28T09:19:55.704+05:30' }),
    __metadata("design:type", String)
], CommissionResponseDto.prototype, "createdAt", void 0);
//# sourceMappingURL=commission-response.dto.js.map
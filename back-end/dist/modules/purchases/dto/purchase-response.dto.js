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
exports.PurchaseResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const property_enum_js_1 = require("../../../shared/enums/property.enum.js");
const purchase_enum_js_1 = require("../../../shared/enums/purchase.enum.js");
const commission_response_dto_js_1 = require("../../commissions/dto/commission-response.dto.js");
class PurchaseResponseDto {
    id;
    propertyId;
    buyerId;
    negotiationId;
    agreedPrice;
    dealStep;
    dealStepLabel;
    dealStatus;
    propertyTitle;
    propertyCity;
    propertyState;
    propertyImage;
    propertyListingType;
    buyerName;
    buyerEmail;
    commissionDue;
    commissionPaid;
    awaitingCommission;
    commissions;
    createdAt;
    updatedAt;
}
exports.PurchaseResponseDto = PurchaseResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '65f1b2c3d4e5f6a7b8c9d0e1' }),
    __metadata("design:type", String)
], PurchaseResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '65f1b2c3d4e5f6a7b8c9d0e1', nullable: true }),
    __metadata("design:type", Object)
], PurchaseResponseDto.prototype, "propertyId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '65f1b2c3d4e5f6a7b8c9d0e1', nullable: true }),
    __metadata("design:type", Object)
], PurchaseResponseDto.prototype, "buyerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '65f1b2c3d4e5f6a7b8c9d0e1', nullable: true }),
    __metadata("design:type", Object)
], PurchaseResponseDto.prototype, "negotiationId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 8800000 }),
    __metadata("design:type", Number)
], PurchaseResponseDto.prototype, "agreedPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, minimum: 1, maximum: 5 }),
    __metadata("design:type", Number)
], PurchaseResponseDto.prototype, "dealStep", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: purchase_enum_js_1.DEAL_STEPS[0], enum: purchase_enum_js_1.DEAL_STEPS, description: 'Human-readable label for dealStep' }),
    __metadata("design:type", String)
], PurchaseResponseDto.prototype, "dealStepLabel", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: purchase_enum_js_1.DealStatus, example: purchase_enum_js_1.DealStatus.IN_PROGRESS }),
    __metadata("design:type", String)
], PurchaseResponseDto.prototype, "dealStatus", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Populated on list/detail endpoints' }),
    __metadata("design:type", String)
], PurchaseResponseDto.prototype, "propertyTitle", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], PurchaseResponseDto.prototype, "propertyCity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], PurchaseResponseDto.prototype, "propertyState", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], PurchaseResponseDto.prototype, "propertyImage", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: property_enum_js_1.ListingType,
        description: 'Whether the completed deal was a sale or a letting — the seller dashboard splits its Sold and Rent Given pages on this.',
    }),
    __metadata("design:type", String)
], PurchaseResponseDto.prototype, "propertyListingType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Populated only on the admin review-queue endpoint' }),
    __metadata("design:type", String)
], PurchaseResponseDto.prototype, "buyerName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], PurchaseResponseDto.prototype, "buyerEmail", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Platform commission still outstanding on this deal (₹). Raised when the purchase reaches ' +
            'Registration; the deal cannot be completed until it is 0.',
        example: 82600,
    }),
    __metadata("design:type", Number)
], PurchaseResponseDto.prototype, "commissionDue", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Commission already settled on this deal (₹)', example: 144550 }),
    __metadata("design:type", Number)
], PurchaseResponseDto.prototype, "commissionPaid", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'True when the deal is parked at Registration with commission outstanding — the dashboards ' +
            'render their "pay to finish" prompt from this.',
        example: true,
    }),
    __metadata("design:type", Boolean)
], PurchaseResponseDto.prototype, "awaitingCommission", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        type: [commission_response_dto_js_1.CommissionResponseDto],
        description: 'The individual commission lines raised on this deal, buyer-side and seller-side.',
    }),
    __metadata("design:type", Array)
], PurchaseResponseDto.prototype, "commissions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2025-01-01T05:30:00.000+05:30' }),
    __metadata("design:type", String)
], PurchaseResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2025-01-15T05:30:00.000+05:30' }),
    __metadata("design:type", String)
], PurchaseResponseDto.prototype, "updatedAt", void 0);
//# sourceMappingURL=purchase-response.dto.js.map
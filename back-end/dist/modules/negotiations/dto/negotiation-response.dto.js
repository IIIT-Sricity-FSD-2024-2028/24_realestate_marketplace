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
exports.NegotiationResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const negotiation_enum_js_1 = require("../../../shared/enums/negotiation.enum.js");
class NegotiationResponseDto {
    id;
    propertyId;
    buyerId;
    offerAmount;
    counterAmount;
    message;
    paymentMode;
    status;
    rejectionReason;
    canRespond;
    propertyHasSeller;
    propertyTitle;
    propertyCity;
    propertyState;
    propertyImage;
    buyerName;
    buyerEmail;
    createdAt;
    updatedAt;
}
exports.NegotiationResponseDto = NegotiationResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '65f1b2c3d4e5f6a7b8c9d0e1' }),
    __metadata("design:type", String)
], NegotiationResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '65f1b2c3d4e5f6a7b8c9d0e1', nullable: true }),
    __metadata("design:type", Object)
], NegotiationResponseDto.prototype, "propertyId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '65f1b2c3d4e5f6a7b8c9d0e1', nullable: true }),
    __metadata("design:type", Object)
], NegotiationResponseDto.prototype, "buyerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 8200000 }),
    __metadata("design:type", Number)
], NegotiationResponseDto.prototype, "offerAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 8800000, nullable: true }),
    __metadata("design:type", Object)
], NegotiationResponseDto.prototype, "counterAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'I can close quickly.', nullable: true }),
    __metadata("design:type", Object)
], NegotiationResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Home Loan', nullable: true }),
    __metadata("design:type", Object)
], NegotiationResponseDto.prototype, "paymentMode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: negotiation_enum_js_1.NegotiationStatus, example: negotiation_enum_js_1.NegotiationStatus.PENDING }),
    __metadata("design:type", String)
], NegotiationResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: null, nullable: true }),
    __metadata("design:type", Object)
], NegotiationResponseDto.prototype, "rejectionReason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Only on the admin review-queue: whether the caller may counter/accept/reject this negotiation. ' +
            'Only ever true for the seller who listed the property — price is the seller\'s call, so the ' +
            'admin queue is always view-only.',
    }),
    __metadata("design:type", Boolean)
], NegotiationResponseDto.prototype, "canRespond", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Only on the admin review-queue: false when the property has no seller, meaning nobody can ' +
            'answer this offer until one is assigned.',
    }),
    __metadata("design:type", Boolean)
], NegotiationResponseDto.prototype, "propertyHasSeller", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Populated on list/detail endpoints' }),
    __metadata("design:type", String)
], NegotiationResponseDto.prototype, "propertyTitle", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], NegotiationResponseDto.prototype, "propertyCity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], NegotiationResponseDto.prototype, "propertyState", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], NegotiationResponseDto.prototype, "propertyImage", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Populated only on the admin review-queue endpoint' }),
    __metadata("design:type", String)
], NegotiationResponseDto.prototype, "buyerName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], NegotiationResponseDto.prototype, "buyerEmail", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2025-01-01T05:30:00.000+05:30' }),
    __metadata("design:type", String)
], NegotiationResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2025-01-15T05:30:00.000+05:30' }),
    __metadata("design:type", String)
], NegotiationResponseDto.prototype, "updatedAt", void 0);
//# sourceMappingURL=negotiation-response.dto.js.map
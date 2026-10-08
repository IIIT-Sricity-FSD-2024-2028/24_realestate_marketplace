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
exports.RejectNegotiationDto = exports.CounterNegotiationDto = exports.CreateNegotiationDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateNegotiationDto {
    propertyId;
    offerAmount;
    message;
    paymentMode;
}
exports.CreateNegotiationDto = CreateNegotiationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Property being negotiated on', example: '65f1b2c3d4e5f6a7b8c9d0e1' }),
    (0, class_validator_1.IsMongoId)({ message: 'propertyId must be a valid property ID' }),
    __metadata("design:type", String)
], CreateNegotiationDto.prototype, "propertyId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Your offer amount (₹)', example: 8200000 }),
    (0, class_validator_1.IsNumber)({}, { message: 'offerAmount must be a number' }),
    (0, class_validator_1.IsPositive)({ message: 'offerAmount must be positive' }),
    __metadata("design:type", Number)
], CreateNegotiationDto.prototype, "offerAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'I can close quickly, all documents ready.', maxLength: 500 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], CreateNegotiationDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Home Loan', maxLength: 50 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], CreateNegotiationDto.prototype, "paymentMode", void 0);
class CounterNegotiationDto {
    counterAmount;
}
exports.CounterNegotiationDto = CounterNegotiationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Admin's counter-offer (₹)", example: 8800000 }),
    (0, class_validator_1.IsNumber)({}, { message: 'counterAmount must be a number' }),
    (0, class_validator_1.IsPositive)({ message: 'counterAmount must be positive' }),
    __metadata("design:type", Number)
], CounterNegotiationDto.prototype, "counterAmount", void 0);
class RejectNegotiationDto {
    reason;
}
exports.RejectNegotiationDto = RejectNegotiationDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Offer too far below asking price.', maxLength: 500 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], RejectNegotiationDto.prototype, "reason", void 0);
//# sourceMappingURL=create-negotiation.dto.js.map
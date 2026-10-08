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
exports.CancelVisitDto = exports.RescheduleVisitDto = exports.CreateVisitDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateVisitDto {
    propertyId;
    requestedDate;
    requestedSlot;
    message;
}
exports.CreateVisitDto = CreateVisitDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Property to visit', example: '65f1b2c3d4e5f6a7b8c9d0e1' }),
    (0, class_validator_1.IsMongoId)({ message: 'propertyId must be a valid property ID' }),
    __metadata("design:type", String)
], CreateVisitDto.prototype, "propertyId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Requested visit date', example: '2026-03-10' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateVisitDto.prototype, "requestedDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Requested time slot', example: '10:00 AM' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateVisitDto.prototype, "requestedSlot", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: "I'm particularly interested in the kitchen size.", maxLength: 500 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], CreateVisitDto.prototype, "message", void 0);
class RescheduleVisitDto {
    requestedDate;
    requestedSlot;
}
exports.RescheduleVisitDto = RescheduleVisitDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'New proposed visit date', example: '2026-03-12' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RescheduleVisitDto.prototype, "requestedDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'New proposed time slot', example: '2:00 PM' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RescheduleVisitDto.prototype, "requestedSlot", void 0);
class CancelVisitDto {
    reason;
}
exports.CancelVisitDto = CancelVisitDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Buyer no longer interested.', maxLength: 500 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], CancelVisitDto.prototype, "reason", void 0);
//# sourceMappingURL=create-visit.dto.js.map
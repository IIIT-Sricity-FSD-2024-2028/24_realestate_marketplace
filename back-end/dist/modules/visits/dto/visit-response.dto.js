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
exports.VisitResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const visit_enum_js_1 = require("../../../shared/enums/visit.enum.js");
class VisitResponseDto {
    id;
    propertyId;
    buyerId;
    requestedDate;
    requestedSlot;
    message;
    status;
    cancelReason;
    propertyTitle;
    propertyCity;
    propertyState;
    propertyImage;
    buyerName;
    buyerEmail;
    createdAt;
    updatedAt;
}
exports.VisitResponseDto = VisitResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '65f1b2c3d4e5f6a7b8c9d0e1' }),
    __metadata("design:type", String)
], VisitResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '65f1b2c3d4e5f6a7b8c9d0e1', nullable: true }),
    __metadata("design:type", Object)
], VisitResponseDto.prototype, "propertyId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '65f1b2c3d4e5f6a7b8c9d0e1', nullable: true }),
    __metadata("design:type", Object)
], VisitResponseDto.prototype, "buyerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-03-10' }),
    __metadata("design:type", String)
], VisitResponseDto.prototype, "requestedDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '10:00 AM' }),
    __metadata("design:type", String)
], VisitResponseDto.prototype, "requestedSlot", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Interested in the kitchen size.', nullable: true }),
    __metadata("design:type", Object)
], VisitResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: visit_enum_js_1.VisitStatus, example: visit_enum_js_1.VisitStatus.PENDING }),
    __metadata("design:type", String)
], VisitResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: null, nullable: true }),
    __metadata("design:type", Object)
], VisitResponseDto.prototype, "cancelReason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Populated on list/detail endpoints' }),
    __metadata("design:type", String)
], VisitResponseDto.prototype, "propertyTitle", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], VisitResponseDto.prototype, "propertyCity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], VisitResponseDto.prototype, "propertyState", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], VisitResponseDto.prototype, "propertyImage", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Populated only on the admin review-queue endpoint' }),
    __metadata("design:type", String)
], VisitResponseDto.prototype, "buyerName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], VisitResponseDto.prototype, "buyerEmail", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2025-01-01T05:30:00.000+05:30' }),
    __metadata("design:type", String)
], VisitResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2025-01-15T05:30:00.000+05:30' }),
    __metadata("design:type", String)
], VisitResponseDto.prototype, "updatedAt", void 0);
//# sourceMappingURL=visit-response.dto.js.map
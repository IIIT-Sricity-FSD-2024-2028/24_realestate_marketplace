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
exports.BookingResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const booking_enum_js_1 = require("../../../shared/enums/booking.enum.js");
class BookingResponseDto {
    id;
    propertyId;
    buyerId;
    date;
    time;
    status;
    notes;
    createdAt;
    updatedAt;
}
exports.BookingResponseDto = BookingResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'book_000001' }),
    __metadata("design:type", String)
], BookingResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'prop_000001' }),
    __metadata("design:type", String)
], BookingResponseDto.prototype, "propertyId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'usr_000003' }),
    __metadata("design:type", String)
], BookingResponseDto.prototype, "buyerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2025-03-15' }),
    __metadata("design:type", String)
], BookingResponseDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '14:30' }),
    __metadata("design:type", String)
], BookingResponseDto.prototype, "time", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: booking_enum_js_1.BookingStatus, example: booking_enum_js_1.BookingStatus.PENDING }),
    __metadata("design:type", String)
], BookingResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Please ensure the property manager is present.',
        nullable: true,
    }),
    __metadata("design:type", Object)
], BookingResponseDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2025-01-01T05:30:00.000+05:30' }),
    __metadata("design:type", String)
], BookingResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2025-01-10T05:30:00.000+05:30' }),
    __metadata("design:type", String)
], BookingResponseDto.prototype, "updatedAt", void 0);
//# sourceMappingURL=booking-response.dto.js.map
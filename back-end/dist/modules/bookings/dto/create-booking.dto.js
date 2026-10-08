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
exports.CreateBookingDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateBookingDto {
    propertyId;
    buyerId;
    date;
    time;
    notes;
}
exports.CreateBookingDto = CreateBookingDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of the property to book a viewing for',
        example: 'prop_000001',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Property ID is required' }),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "propertyId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of the buyer making the booking',
        example: 'usr_000003',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Buyer ID is required' }),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "buyerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Viewing appointment date (ISO 8601 format: YYYY-MM-DD)',
        example: '2025-03-15',
    }),
    (0, class_validator_1.IsDateString)({}, { message: 'Date must be a valid ISO 8601 date (YYYY-MM-DD)' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Booking date is required' }),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Preferred viewing time (HH:MM in 24-hour format)',
        example: '14:30',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Time is required' }),
    (0, class_validator_1.Matches)(/^([01]\d|2[0-3]):([0-5]\d)$/, {
        message: 'Time must be in HH:MM 24-hour format (e.g., 14:30)',
    }),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "time", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Optional notes or special requests for the viewing',
        example: 'Please ensure the property manager is present.',
        required: false,
        maxLength: 500,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(5, { message: 'Notes must be at least 5 characters if provided' }),
    (0, class_validator_1.MaxLength)(500, { message: 'Notes must not exceed 500 characters' }),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "notes", void 0);
//# sourceMappingURL=create-booking.dto.js.map
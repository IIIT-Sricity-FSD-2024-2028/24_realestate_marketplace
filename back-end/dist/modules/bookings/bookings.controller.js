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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const bookings_service_js_1 = require("./bookings.service.js");
const create_booking_dto_js_1 = require("./dto/create-booking.dto.js");
const update_booking_dto_js_1 = require("./dto/update-booking.dto.js");
const booking_response_dto_js_1 = require("./dto/booking-response.dto.js");
const role_enum_js_1 = require("../../common/enums/role.enum.js");
const api_role_decorator_js_1 = require("../../common/decorators/api-role.decorator.js");
const api_response_decorator_js_1 = require("../../common/decorators/api-response.decorator.js");
let BookingsController = class BookingsController {
    bookingsService;
    constructor(bookingsService) {
        this.bookingsService = bookingsService;
    }
    async create(dto) {
        const data = await this.bookingsService.create(dto);
        return { message: 'Booking created successfully', data };
    }
    async findAll(buyerId) {
        const data = buyerId
            ? await this.bookingsService.findByBuyer(buyerId)
            : await this.bookingsService.findAll();
        return { message: 'Bookings retrieved successfully', data };
    }
    async findOne(id) {
        const data = await this.bookingsService.findOne(id);
        return { message: 'Booking retrieved successfully', data };
    }
    async update(id, dto) {
        const data = await this.bookingsService.update(id, dto);
        return { message: 'Booking updated successfully', data };
    }
    async cancel(id) {
        const data = await this.bookingsService.cancel(id);
        return { message: 'Booking cancelled successfully', data };
    }
};
exports.BookingsController = BookingsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, api_role_decorator_js_1.ApiRole)(role_enum_js_1.Role.USER, role_enum_js_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a property viewing booking',
        description: 'Buyers and admins can book a viewing appointment. ' +
            'The property must exist. Booking date/time must be in the future. ' +
            'Duplicate bookings (same buyer, property, date, time) are rejected.',
    }),
    (0, api_response_decorator_js_1.ApiSuccessResponse)(booking_response_dto_js_1.BookingResponseDto, 201),
    (0, api_response_decorator_js_1.ApiValidationError)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_booking_dto_js_1.CreateBookingDto]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, api_role_decorator_js_1.ApiRole)(role_enum_js_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'List all bookings',
        description: 'Returns all bookings in the system. Admin-only.',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'buyerId',
        required: false,
        description: 'Filter bookings by buyer ID',
        example: 'usr_000003',
    }),
    (0, api_response_decorator_js_1.ApiSuccessResponse)(booking_response_dto_js_1.BookingResponseDto, 200, true),
    __param(0, (0, common_1.Query)('buyerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, api_role_decorator_js_1.ApiRole)(role_enum_js_1.Role.ADMIN, role_enum_js_1.Role.USER),
    (0, swagger_1.ApiOperation)({
        summary: 'Get booking by ID',
        description: 'Returns a single booking by ID. All authenticated roles can access.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Booking ID', example: 'book_000001' }),
    (0, api_response_decorator_js_1.ApiSuccessResponse)(booking_response_dto_js_1.BookingResponseDto),
    (0, api_response_decorator_js_1.ApiNotFound)('Booking'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, api_role_decorator_js_1.ApiRole)(role_enum_js_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'Update booking status or notes',
        description: 'Admins can update booking status (pending → confirmed → completed) ' +
            'and notes. Cannot change status of completed bookings.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Booking ID', example: 'book_000001' }),
    (0, api_response_decorator_js_1.ApiSuccessResponse)(booking_response_dto_js_1.BookingResponseDto),
    (0, api_response_decorator_js_1.ApiNotFound)('Booking'),
    (0, api_response_decorator_js_1.ApiValidationError)(),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_booking_dto_js_1.UpdateBookingDto]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id/cancel'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, api_role_decorator_js_1.ApiRole)(role_enum_js_1.Role.USER, role_enum_js_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'Cancel a booking',
        description: 'Cancels a pending or confirmed booking. ' +
            'Cannot cancel completed bookings or already-cancelled bookings.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Booking ID', example: 'book_000001' }),
    (0, api_response_decorator_js_1.ApiNotFound)('Booking'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "cancel", null);
exports.BookingsController = BookingsController = __decorate([
    (0, swagger_1.ApiTags)('Bookings'),
    (0, swagger_1.ApiExtraModels)(booking_response_dto_js_1.BookingResponseDto),
    (0, common_1.Controller)('bookings'),
    __metadata("design:paramtypes", [bookings_service_js_1.BookingsService])
], BookingsController);
//# sourceMappingURL=bookings.controller.js.map
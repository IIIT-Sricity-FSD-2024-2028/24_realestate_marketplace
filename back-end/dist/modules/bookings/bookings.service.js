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
exports.BookingsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const properties_service_js_1 = require("../properties/properties.service.js");
const booking_enum_js_1 = require("../../shared/enums/booking.enum.js");
const ist_time_helper_js_1 = require("../../shared/helpers/ist-time.helper.js");
let BookingsService = class BookingsService {
    propertiesService;
    bookings;
    constructor(connection, propertiesService) {
        this.propertiesService = propertiesService;
        this.bookings = connection.collection('bookings');
    }
    toResponse(b) {
        return {
            id: b.id,
            propertyId: b.propertyId,
            buyerId: b.buyerId,
            date: b.date,
            time: b.time,
            status: b.status,
            notes: b.notes,
            createdAt: (0, ist_time_helper_js_1.istTimestamp)(b.createdAt),
            updatedAt: (0, ist_time_helper_js_1.istTimestamp)(b.updatedAt),
        };
    }
    async create(dto) {
        await this.propertiesService.findOne(dto.propertyId);
        const bookingDate = new Date(`${dto.date}T${dto.time}:00`);
        if (bookingDate <= new Date()) {
            throw new common_1.BadRequestException('Booking date and time must be in the future');
        }
        const duplicate = await this.bookings.findOne({
            propertyId: dto.propertyId,
            buyerId: dto.buyerId,
            date: dto.date,
            time: dto.time,
            status: { $ne: booking_enum_js_1.BookingStatus.CANCELLED },
        });
        if (duplicate) {
            throw new common_1.BadRequestException('You already have a booking for this property at the same date and time');
        }
        const now = new Date();
        const booking = {
            id: `book_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            propertyId: dto.propertyId,
            buyerId: dto.buyerId,
            date: dto.date,
            time: dto.time,
            status: booking_enum_js_1.BookingStatus.PENDING,
            notes: dto.notes ?? null,
            createdAt: now,
            updatedAt: now,
        };
        await this.bookings.insertOne({ ...booking, _id: booking.id });
        return this.toResponse(booking);
    }
    async findAll() {
        const bookings = await this.bookings.find({}).sort({ createdAt: -1 }).toArray();
        return bookings.map(this.toResponse.bind(this));
    }
    async findByBuyer(buyerId) {
        const bookings = await this.bookings.find({ buyerId }).sort({ createdAt: -1 }).toArray();
        return bookings.map(this.toResponse.bind(this));
    }
    async findOne(id) {
        const booking = await this.bookings.findOne({ _id: id });
        if (!booking) {
            throw new common_1.NotFoundException(`Booking with ID "${id}" not found`);
        }
        return this.toResponse(booking);
    }
    async update(id, dto) {
        const booking = await this.bookings.findOne({ _id: id });
        if (!booking) {
            throw new common_1.NotFoundException(`Booking with ID "${id}" not found`);
        }
        if (booking.status === booking_enum_js_1.BookingStatus.COMPLETED &&
            dto.status &&
            dto.status !== booking_enum_js_1.BookingStatus.COMPLETED) {
            throw new common_1.BadRequestException('Cannot change status of a completed booking');
        }
        const update = {
            ...(dto.status && { status: dto.status }),
            ...(dto.notes !== undefined && { notes: dto.notes }),
            updatedAt: new Date(),
        };
        const result = await this.bookings.findOneAndUpdate({ _id: id }, { $set: update }, { returnDocument: 'after' });
        if (!result)
            throw new common_1.NotFoundException(`Booking with ID "${id}" not found`);
        return this.toResponse(result);
    }
    async cancel(id) {
        const booking = await this.bookings.findOne({ _id: id });
        if (!booking) {
            throw new common_1.NotFoundException(`Booking with ID "${id}" not found`);
        }
        if (booking.status === booking_enum_js_1.BookingStatus.COMPLETED) {
            throw new common_1.BadRequestException('Cannot cancel a completed booking');
        }
        if (booking.status === booking_enum_js_1.BookingStatus.CANCELLED) {
            throw new common_1.BadRequestException('Booking is already cancelled');
        }
        return this.update(id, { status: booking_enum_js_1.BookingStatus.CANCELLED });
    }
};
exports.BookingsService = BookingsService;
exports.BookingsService = BookingsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectConnection)()),
    __metadata("design:paramtypes", [mongoose_2.Connection,
        properties_service_js_1.PropertiesService])
], BookingsService);
//# sourceMappingURL=bookings.service.js.map
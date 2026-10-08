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
exports.PropertyResponseDto = exports.PropertyDocumentFileDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const property_enum_js_1 = require("../../../shared/enums/property.enum.js");
const billing_enum_js_1 = require("../../../shared/enums/billing.enum.js");
class PropertyDocumentFileDto {
    url;
    originalName;
    uploadedAt;
}
exports.PropertyDocumentFileDto = PropertyDocumentFileDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '/uploads/property-documents/65f.../deed-1699999999.pdf' }),
    __metadata("design:type", String)
], PropertyDocumentFileDto.prototype, "url", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'ownership-deed.pdf' }),
    __metadata("design:type", String)
], PropertyDocumentFileDto.prototype, "originalName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2025-01-01T05:30:00.000+05:30' }),
    __metadata("design:type", String)
], PropertyDocumentFileDto.prototype, "uploadedAt", void 0);
class PropertyResponseDto {
    id;
    title;
    description;
    type;
    listingType;
    price;
    areaSqft;
    bedrooms;
    bathrooms;
    address;
    city;
    state;
    status;
    images;
    adminId;
    sellerId;
    verificationStatus;
    rejectionReason;
    isFeatured;
    featuredTier;
    featuredUntil;
    documents;
    sellerName;
    sellerEmail;
    sellerPhone;
    sellerSince;
    createdAt;
    updatedAt;
}
exports.PropertyResponseDto = PropertyResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'prop_000001' }),
    __metadata("design:type", String)
], PropertyResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '3BHK Spacious Apartment in Anna Nagar' }),
    __metadata("design:type", String)
], PropertyResponseDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Beautifully furnished 3BHK with sea view.' }),
    __metadata("design:type", String)
], PropertyResponseDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: property_enum_js_1.PropertyType, example: property_enum_js_1.PropertyType.APARTMENT }),
    __metadata("design:type", String)
], PropertyResponseDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: property_enum_js_1.ListingType, example: property_enum_js_1.ListingType.SALE }),
    __metadata("design:type", String)
], PropertyResponseDto.prototype, "listingType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 7500000 }),
    __metadata("design:type", Number)
], PropertyResponseDto.prototype, "price", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1200 }),
    __metadata("design:type", Number)
], PropertyResponseDto.prototype, "areaSqft", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 3 }),
    __metadata("design:type", Number)
], PropertyResponseDto.prototype, "bedrooms", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 2 }),
    __metadata("design:type", Number)
], PropertyResponseDto.prototype, "bathrooms", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '42, 5th Avenue, Anna Nagar, Chennai' }),
    __metadata("design:type", String)
], PropertyResponseDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Chennai' }),
    __metadata("design:type", String)
], PropertyResponseDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Tamil Nadu' }),
    __metadata("design:type", String)
], PropertyResponseDto.prototype, "state", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: property_enum_js_1.PropertyStatus, example: property_enum_js_1.PropertyStatus.AVAILABLE }),
    __metadata("design:type", String)
], PropertyResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [String],
        example: ['https://cdn.example.com/img1.jpg'],
    }),
    __metadata("design:type", Array)
], PropertyResponseDto.prototype, "images", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'usr_000002', nullable: true, description: 'Owning/verifying admin' }),
    __metadata("design:type", Object)
], PropertyResponseDto.prototype, "adminId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: null, nullable: true, description: 'Submitting seller, if this listing came from a seller' }),
    __metadata("design:type", Object)
], PropertyResponseDto.prototype, "sellerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: property_enum_js_1.PropertyVerificationStatus,
        example: property_enum_js_1.PropertyVerificationStatus.VERIFIED,
        description: 'Admin/superuser listings are auto-verified; seller submissions start pending',
    }),
    __metadata("design:type", String)
], PropertyResponseDto.prototype, "verificationStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: null, nullable: true }),
    __metadata("design:type", Object)
], PropertyResponseDto.prototype, "rejectionReason", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'True while a paid promotion is live. Buyer search sorts these to the top.',
        example: false,
    }),
    __metadata("design:type", Boolean)
], PropertyResponseDto.prototype, "isFeatured", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: billing_enum_js_1.FeaturedTier, example: null, nullable: true }),
    __metadata("design:type", Object)
], PropertyResponseDto.prototype, "featuredTier", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: null, nullable: true, description: 'When the promotion lapses' }),
    __metadata("design:type", Object)
], PropertyResponseDto.prototype, "featuredUntil", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        type: [PropertyDocumentFileDto],
        description: 'Private verification documents (ownership deed, ID, etc.) — only present when the caller is ' +
            "the admin/superuser or the seller who owns this listing. Never sent to buyers/public callers; " +
            'use `images` for buyer-facing photos instead.',
    }),
    __metadata("design:type", Array)
], PropertyResponseDto.prototype, "documents", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Sam Seller', description: 'Populated only on the admin review-queue endpoint' }),
    __metadata("design:type", String)
], PropertyResponseDto.prototype, "sellerName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'sam.seller@example.com', description: 'Populated only on the admin review-queue endpoint' }),
    __metadata("design:type", String)
], PropertyResponseDto.prototype, "sellerEmail", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: "The seller's phone number, or null if they haven't given one. Review queue only.",
        nullable: true,
    }),
    __metadata("design:type", Object)
], PropertyResponseDto.prototype, "sellerPhone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'When the seller registered — shown as "Since" in the admin seller list. Review queue only.',
        nullable: true,
    }),
    __metadata("design:type", Object)
], PropertyResponseDto.prototype, "sellerSince", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2025-01-01T05:30:00.000+05:30' }),
    __metadata("design:type", String)
], PropertyResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2025-01-15T05:30:00.000+05:30' }),
    __metadata("design:type", String)
], PropertyResponseDto.prototype, "updatedAt", void 0);
//# sourceMappingURL=property-response.dto.js.map
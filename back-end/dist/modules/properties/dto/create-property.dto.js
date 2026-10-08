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
exports.CreatePropertyDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const property_enum_js_1 = require("../../../shared/enums/property.enum.js");
const service_cities_js_1 = require("../../../shared/constants/service-cities.js");
class CreatePropertyDto {
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
    status;
    images;
}
exports.CreatePropertyDto = CreatePropertyDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Property title / headline',
        example: '3BHK Spacious Apartment in Anna Nagar',
        minLength: 10,
        maxLength: 150,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Title is required' }),
    (0, class_validator_1.MinLength)(10, { message: 'Title must be at least 10 characters' }),
    (0, class_validator_1.MaxLength)(150, { message: 'Title must not exceed 150 characters' }),
    __metadata("design:type", String)
], CreatePropertyDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Detailed description of the property',
        example: 'Beautifully furnished 3BHK with sea view, modular kitchen, and 24/7 security.',
        minLength: 20,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Description is required' }),
    (0, class_validator_1.MinLength)(20, { message: 'Description must be at least 20 characters' }),
    __metadata("design:type", String)
], CreatePropertyDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Type of property',
        enum: property_enum_js_1.PropertyType,
        example: property_enum_js_1.PropertyType.APARTMENT,
    }),
    (0, class_validator_1.IsEnum)(property_enum_js_1.PropertyType, {
        message: `Type must be one of: ${Object.values(property_enum_js_1.PropertyType).join(', ')}`,
    }),
    __metadata("design:type", String)
], CreatePropertyDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Listing type — for sale or rent',
        enum: property_enum_js_1.ListingType,
        example: property_enum_js_1.ListingType.SALE,
    }),
    (0, class_validator_1.IsEnum)(property_enum_js_1.ListingType, {
        message: `Listing type must be one of: ${Object.values(property_enum_js_1.ListingType).join(', ')}`,
    }),
    __metadata("design:type", String)
], CreatePropertyDto.prototype, "listingType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Price in INR (₹). Must be a positive number.',
        example: 7500000,
        minimum: 1,
    }),
    (0, class_validator_1.IsNumber)({}, { message: 'Price must be a number' }),
    (0, class_validator_1.IsPositive)({ message: 'Price must be a positive number' }),
    __metadata("design:type", Number)
], CreatePropertyDto.prototype, "price", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Area in square feet',
        example: 1200,
        minimum: 1,
    }),
    (0, class_validator_1.IsNumber)({}, { message: 'Area must be a number' }),
    (0, class_validator_1.IsPositive)({ message: 'Area must be positive' }),
    __metadata("design:type", Number)
], CreatePropertyDto.prototype, "areaSqft", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of bedrooms (0 for studios)',
        example: 3,
        minimum: 0,
        maximum: 20,
    }),
    (0, class_validator_1.IsInt)({ message: 'Bedrooms must be a whole number' }),
    (0, class_validator_1.Min)(0, { message: 'Bedrooms cannot be negative' }),
    (0, class_validator_1.Max)(20, { message: 'Bedrooms cannot exceed 20' }),
    __metadata("design:type", Number)
], CreatePropertyDto.prototype, "bedrooms", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of bathrooms',
        example: 2,
        minimum: 1,
        maximum: 20,
    }),
    (0, class_validator_1.IsInt)({ message: 'Bathrooms must be a whole number' }),
    (0, class_validator_1.Min)(1, { message: 'Must have at least 1 bathroom' }),
    (0, class_validator_1.Max)(20, { message: 'Bathrooms cannot exceed 20' }),
    __metadata("design:type", Number)
], CreatePropertyDto.prototype, "bathrooms", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Full street address',
        example: '42, 5th Avenue, Anna Nagar, Chennai',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Address is required' }),
    __metadata("design:type", String)
], CreatePropertyDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'City the property is in. truEstate has launched in four cities only, ' +
            'and each is run by its own admin who verifies and manages every ' +
            'listing there — so a listing outside this list would have nobody to ' +
            'handle it and is rejected.',
        enum: service_cities_js_1.ServiceCity,
        example: service_cities_js_1.ServiceCity.HYDERABAD,
    }),
    (0, class_validator_1.IsEnum)(service_cities_js_1.ServiceCity, {
        message: `City must be one of the cities we operate in: ${service_cities_js_1.SERVICE_CITIES.join(', ')}`,
    }),
    __metadata("design:type", String)
], CreatePropertyDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Current availability status',
        enum: property_enum_js_1.PropertyStatus,
        example: property_enum_js_1.PropertyStatus.AVAILABLE,
        default: property_enum_js_1.PropertyStatus.AVAILABLE,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(property_enum_js_1.PropertyStatus, {
        message: `Status must be one of: ${Object.values(property_enum_js_1.PropertyStatus).join(', ')}`,
    }),
    __metadata("design:type", String)
], CreatePropertyDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'List of image URLs for the property',
        type: [String],
        example: ['https://cdn.example.com/img1.jpg', 'https://cdn.example.com/img2.jpg'],
        minItems: 1,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)({ message: 'Images must be an array of URLs' }),
    (0, class_validator_1.ArrayMinSize)(1, { message: 'Provide at least one image URL' }),
    (0, class_validator_1.IsUrl)({}, { each: true, message: 'Each image must be a valid URL' }),
    __metadata("design:type", Array)
], CreatePropertyDto.prototype, "images", void 0);
//# sourceMappingURL=create-property.dto.js.map
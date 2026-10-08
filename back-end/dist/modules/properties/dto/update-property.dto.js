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
exports.UpdatePropertyDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const property_enum_js_1 = require("../../../shared/enums/property.enum.js");
const service_cities_js_1 = require("../../../shared/constants/service-cities.js");
class UpdatePropertyDto {
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
    adminId;
}
exports.UpdatePropertyDto = UpdatePropertyDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '3BHK Renovated Apartment in Anna Nagar' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(10),
    (0, class_validator_1.MaxLength)(150),
    __metadata("design:type", String)
], UpdatePropertyDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Updated description with new amenities.' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(20),
    __metadata("design:type", String)
], UpdatePropertyDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: property_enum_js_1.PropertyType, example: property_enum_js_1.PropertyType.VILLA }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(property_enum_js_1.PropertyType, {
        message: `Type must be one of: ${Object.values(property_enum_js_1.PropertyType).join(', ')}`,
    }),
    __metadata("design:type", String)
], UpdatePropertyDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: property_enum_js_1.ListingType, example: property_enum_js_1.ListingType.RENT }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(property_enum_js_1.ListingType),
    __metadata("design:type", String)
], UpdatePropertyDto.prototype, "listingType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 8500000 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], UpdatePropertyDto.prototype, "price", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 1350 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], UpdatePropertyDto.prototype, "areaSqft", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 4 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(20),
    __metadata("design:type", Number)
], UpdatePropertyDto.prototype, "bedrooms", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 3 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(20),
    __metadata("design:type", Number)
], UpdatePropertyDto.prototype, "bathrooms", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '50, 6th Avenue, Anna Nagar, Chennai' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePropertyDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: service_cities_js_1.ServiceCity, example: service_cities_js_1.ServiceCity.CHENNAI }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(service_cities_js_1.ServiceCity, {
        message: `City must be one of the cities we operate in: ${service_cities_js_1.SERVICE_CITIES.join(', ')}`,
    }),
    __metadata("design:type", String)
], UpdatePropertyDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: property_enum_js_1.PropertyStatus, example: property_enum_js_1.PropertyStatus.SOLD }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(property_enum_js_1.PropertyStatus, {
        message: `Status must be one of: ${Object.values(property_enum_js_1.PropertyStatus).join(', ')}`,
    }),
    __metadata("design:type", String)
], UpdatePropertyDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        type: [String],
        example: ['https://cdn.example.com/new-img.jpg'],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.IsUrl)({}, { each: true }),
    __metadata("design:type", Array)
], UpdatePropertyDto.prototype, "images", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'ID of the admin managing this property',
        example: 'usr_000003',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePropertyDto.prototype, "adminId", void 0);
//# sourceMappingURL=update-property.dto.js.map
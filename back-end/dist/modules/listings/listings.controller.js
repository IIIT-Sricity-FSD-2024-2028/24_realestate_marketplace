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
exports.ListingsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const listings_service_js_1 = require("./listings.service.js");
const listing_filter_dto_js_1 = require("./dto/listing-filter.dto.js");
const property_response_dto_js_1 = require("../properties/dto/property-response.dto.js");
let ListingsController = class ListingsController {
    listingsService;
    constructor(listingsService) {
        this.listingsService = listingsService;
    }
    async search(filters) {
        const data = await this.listingsService.search(filters);
        return {
            message: `Search completed successfully. Found ${data.total} propert${data.total === 1 ? 'y' : 'ies'}.`,
            data,
        };
    }
};
exports.ListingsController = ListingsController;
__decorate([
    (0, common_1.Get)('search'),
    (0, swagger_1.ApiOperation)({
        summary: 'Search and filter property listings',
        description: 'Public search endpoint. Supports filtering by city, state, type, listing type, ' +
            'status, price range, bedrooms, and area. Results are paginated (max 50 per page). ' +
            'If minPrice > maxPrice, a 400 error is returned.',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Paginated list of matching properties',
        schema: {
            properties: {
                success: { type: 'boolean', example: true },
                statusCode: { type: 'number', example: 200 },
                message: { type: 'string', example: 'Search completed successfully' },
                data: {
                    properties: {
                        items: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/PropertyResponseDto' },
                        },
                        total: { type: 'number', example: 42 },
                        page: { type: 'number', example: 1 },
                        limit: { type: 'number', example: 10 },
                        totalPages: { type: 'number', example: 5 },
                    },
                },
            },
        },
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [listing_filter_dto_js_1.ListingFilterDto]),
    __metadata("design:returntype", Promise)
], ListingsController.prototype, "search", null);
exports.ListingsController = ListingsController = __decorate([
    (0, swagger_1.ApiTags)('Listings'),
    (0, swagger_1.ApiExtraModels)(property_response_dto_js_1.PropertyResponseDto),
    (0, common_1.Controller)('listings'),
    __metadata("design:paramtypes", [listings_service_js_1.ListingsService])
], ListingsController);
//# sourceMappingURL=listings.controller.js.map
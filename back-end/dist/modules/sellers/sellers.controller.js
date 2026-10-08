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
exports.SellersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const sellers_service_js_1 = require("./sellers.service.js");
const create_seller_dto_js_1 = require("./dto/create-seller.dto.js");
const update_seller_dto_js_1 = require("./dto/update-seller.dto.js");
const seller_response_dto_js_1 = require("./dto/seller-response.dto.js");
const role_enum_js_1 = require("../../common/enums/role.enum.js");
const api_role_decorator_js_1 = require("../../common/decorators/api-role.decorator.js");
const api_response_decorator_js_1 = require("../../common/decorators/api-response.decorator.js");
let SellersController = class SellersController {
    service;
    constructor(service) {
        this.service = service;
    }
    async create(dto) {
        const data = await this.service.create(dto);
        return { message: 'Seller created successfully', data };
    }
    async findAll() {
        const data = await this.service.findAll();
        return { message: 'Sellers retrieved successfully', data };
    }
    async findOne(id) {
        const data = await this.service.findOne(id);
        return { message: 'Seller retrieved successfully', data };
    }
    async update(id, dto) {
        const data = await this.service.update(id, dto);
        return { message: 'Seller updated successfully', data };
    }
    async remove(id) {
        await this.service.remove(id);
        return { message: 'Seller deleted successfully', data: null };
    }
};
exports.SellersController = SellersController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, api_role_decorator_js_1.ApiRole)(role_enum_js_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new seller' }),
    (0, api_response_decorator_js_1.ApiSuccessResponse)(seller_response_dto_js_1.SellerResponseDto, 201),
    (0, api_response_decorator_js_1.ApiValidationError)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_seller_dto_js_1.CreateSellerDto]),
    __metadata("design:returntype", Promise)
], SellersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all sellers' }),
    (0, api_response_decorator_js_1.ApiSuccessResponse)(seller_response_dto_js_1.SellerResponseDto, 200, true),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SellersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get seller by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Seller ID' }),
    (0, api_response_decorator_js_1.ApiSuccessResponse)(seller_response_dto_js_1.SellerResponseDto),
    (0, api_response_decorator_js_1.ApiNotFound)('Seller'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SellersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, api_role_decorator_js_1.ApiRole)(role_enum_js_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Update a seller' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Seller ID' }),
    (0, api_response_decorator_js_1.ApiSuccessResponse)(seller_response_dto_js_1.SellerResponseDto),
    (0, api_response_decorator_js_1.ApiNotFound)('Seller'),
    (0, api_response_decorator_js_1.ApiValidationError)(),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_seller_dto_js_1.UpdateSellerDto]),
    __metadata("design:returntype", Promise)
], SellersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, api_role_decorator_js_1.ApiRole)(role_enum_js_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a seller' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Seller ID' }),
    (0, api_response_decorator_js_1.ApiNotFound)('Seller'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SellersController.prototype, "remove", null);
exports.SellersController = SellersController = __decorate([
    (0, swagger_1.ApiTags)('Sellers'),
    (0, swagger_1.ApiExtraModels)(seller_response_dto_js_1.SellerResponseDto),
    (0, common_1.Controller)('sellers'),
    __metadata("design:paramtypes", [sellers_service_js_1.SellersService])
], SellersController);
//# sourceMappingURL=sellers.controller.js.map
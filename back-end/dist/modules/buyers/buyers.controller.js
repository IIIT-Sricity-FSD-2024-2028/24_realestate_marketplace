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
exports.BuyersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const buyers_service_js_1 = require("./buyers.service.js");
const create_buyer_dto_js_1 = require("./dto/create-buyer.dto.js");
const update_buyer_dto_js_1 = require("./dto/update-buyer.dto.js");
const buyer_response_dto_js_1 = require("./dto/buyer-response.dto.js");
const role_enum_js_1 = require("../../common/enums/role.enum.js");
const api_role_decorator_js_1 = require("../../common/decorators/api-role.decorator.js");
const api_response_decorator_js_1 = require("../../common/decorators/api-response.decorator.js");
let BuyersController = class BuyersController {
    service;
    constructor(service) {
        this.service = service;
    }
    async create(dto) {
        const data = await this.service.create(dto);
        return { message: 'Buyer created successfully', data };
    }
    async findAll() {
        const data = await this.service.findAll();
        return { message: 'Buyers retrieved successfully', data };
    }
    async findOne(id) {
        const data = await this.service.findOne(id);
        return { message: 'Buyer retrieved successfully', data };
    }
    async update(id, dto) {
        const data = await this.service.update(id, dto);
        return { message: 'Buyer updated successfully', data };
    }
    async remove(id) {
        await this.service.remove(id);
        return { message: 'Buyer deleted successfully', data: null };
    }
};
exports.BuyersController = BuyersController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, api_role_decorator_js_1.ApiRole)(role_enum_js_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new buyer' }),
    (0, api_response_decorator_js_1.ApiSuccessResponse)(buyer_response_dto_js_1.BuyerResponseDto, 201),
    (0, api_response_decorator_js_1.ApiValidationError)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_buyer_dto_js_1.CreateBuyerDto]),
    __metadata("design:returntype", Promise)
], BuyersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all buyers' }),
    (0, api_response_decorator_js_1.ApiSuccessResponse)(buyer_response_dto_js_1.BuyerResponseDto, 200, true),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BuyersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get buyer by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Buyer ID' }),
    (0, api_response_decorator_js_1.ApiSuccessResponse)(buyer_response_dto_js_1.BuyerResponseDto),
    (0, api_response_decorator_js_1.ApiNotFound)('Buyer'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BuyersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, api_role_decorator_js_1.ApiRole)(role_enum_js_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Update a buyer' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Buyer ID' }),
    (0, api_response_decorator_js_1.ApiSuccessResponse)(buyer_response_dto_js_1.BuyerResponseDto),
    (0, api_response_decorator_js_1.ApiNotFound)('Buyer'),
    (0, api_response_decorator_js_1.ApiValidationError)(),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_buyer_dto_js_1.UpdateBuyerDto]),
    __metadata("design:returntype", Promise)
], BuyersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, api_role_decorator_js_1.ApiRole)(role_enum_js_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a buyer' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Buyer ID' }),
    (0, api_response_decorator_js_1.ApiNotFound)('Buyer'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BuyersController.prototype, "remove", null);
exports.BuyersController = BuyersController = __decorate([
    (0, swagger_1.ApiTags)('Buyers'),
    (0, swagger_1.ApiExtraModels)(buyer_response_dto_js_1.BuyerResponseDto),
    (0, common_1.Controller)('buyers'),
    __metadata("design:paramtypes", [buyers_service_js_1.BuyersService])
], BuyersController);
//# sourceMappingURL=buyers.controller.js.map
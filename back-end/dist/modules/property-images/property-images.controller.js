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
exports.PropertyImagesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const property_images_service_js_1 = require("./property-images.service.js");
const create_property_image_dto_js_1 = require("./dto/create-property-image.dto.js");
const update_property_image_dto_js_1 = require("./dto/update-property-image.dto.js");
const property_image_response_dto_js_1 = require("./dto/property-image-response.dto.js");
const role_enum_js_1 = require("../../common/enums/role.enum.js");
const api_role_decorator_js_1 = require("../../common/decorators/api-role.decorator.js");
const api_response_decorator_js_1 = require("../../common/decorators/api-response.decorator.js");
let PropertyImagesController = class PropertyImagesController {
    service;
    constructor(service) {
        this.service = service;
    }
    async create(dto) {
        const data = await this.service.create(dto);
        return { message: 'PropertyImage created successfully', data };
    }
    async findAll() {
        const data = await this.service.findAll();
        return { message: 'PropertyImages retrieved successfully', data };
    }
    async findOne(id) {
        const data = await this.service.findOne(id);
        return { message: 'PropertyImage retrieved successfully', data };
    }
    async update(id, dto) {
        const data = await this.service.update(id, dto);
        return { message: 'PropertyImage updated successfully', data };
    }
    async remove(id) {
        await this.service.remove(id);
        return { message: 'PropertyImage deleted successfully', data: null };
    }
};
exports.PropertyImagesController = PropertyImagesController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, api_role_decorator_js_1.ApiRole)(role_enum_js_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new property-image' }),
    (0, api_response_decorator_js_1.ApiSuccessResponse)(property_image_response_dto_js_1.PropertyImageResponseDto, 201),
    (0, api_response_decorator_js_1.ApiValidationError)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_property_image_dto_js_1.CreatePropertyImageDto]),
    __metadata("design:returntype", Promise)
], PropertyImagesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all property-images' }),
    (0, api_response_decorator_js_1.ApiSuccessResponse)(property_image_response_dto_js_1.PropertyImageResponseDto, 200, true),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PropertyImagesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get property-image by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'PropertyImage ID' }),
    (0, api_response_decorator_js_1.ApiSuccessResponse)(property_image_response_dto_js_1.PropertyImageResponseDto),
    (0, api_response_decorator_js_1.ApiNotFound)('PropertyImage'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PropertyImagesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, api_role_decorator_js_1.ApiRole)(role_enum_js_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Update a property-image' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'PropertyImage ID' }),
    (0, api_response_decorator_js_1.ApiSuccessResponse)(property_image_response_dto_js_1.PropertyImageResponseDto),
    (0, api_response_decorator_js_1.ApiNotFound)('PropertyImage'),
    (0, api_response_decorator_js_1.ApiValidationError)(),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_property_image_dto_js_1.UpdatePropertyImageDto]),
    __metadata("design:returntype", Promise)
], PropertyImagesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, api_role_decorator_js_1.ApiRole)(role_enum_js_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a property-image' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'PropertyImage ID' }),
    (0, api_response_decorator_js_1.ApiNotFound)('PropertyImage'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PropertyImagesController.prototype, "remove", null);
exports.PropertyImagesController = PropertyImagesController = __decorate([
    (0, swagger_1.ApiTags)('PropertyImages'),
    (0, swagger_1.ApiExtraModels)(property_image_response_dto_js_1.PropertyImageResponseDto),
    (0, common_1.Controller)('property-images'),
    __metadata("design:paramtypes", [property_images_service_js_1.PropertyImagesService])
], PropertyImagesController);
//# sourceMappingURL=property-images.controller.js.map
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
exports.AdminsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const admins_service_js_1 = require("./admins.service.js");
const create_admin_dto_js_1 = require("./dto/create-admin.dto.js");
const update_admin_dto_js_1 = require("./dto/update-admin.dto.js");
const admin_response_dto_js_1 = require("./dto/admin-response.dto.js");
const role_enum_js_1 = require("../../common/enums/role.enum.js");
const api_role_decorator_js_1 = require("../../common/decorators/api-role.decorator.js");
const api_response_decorator_js_1 = require("../../common/decorators/api-response.decorator.js");
let AdminsController = class AdminsController {
    service;
    constructor(service) {
        this.service = service;
    }
    async create(dto) {
        const data = await this.service.create(dto);
        return { message: 'Admin created successfully', data };
    }
    async findAll() {
        const data = await this.service.findAll();
        return { message: 'Admins retrieved successfully', data };
    }
    async findOne(id) {
        const data = await this.service.findOne(id);
        return { message: 'Admin retrieved successfully', data };
    }
    async update(id, dto) {
        const data = await this.service.update(id, dto);
        return { message: 'Admin updated successfully', data };
    }
    async remove(id) {
        await this.service.remove(id);
        return { message: 'Admin deleted successfully', data: null };
    }
};
exports.AdminsController = AdminsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, api_role_decorator_js_1.ApiRole)(role_enum_js_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new admin' }),
    (0, api_response_decorator_js_1.ApiSuccessResponse)(admin_response_dto_js_1.AdminResponseDto, 201),
    (0, api_response_decorator_js_1.ApiValidationError)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_admin_dto_js_1.CreateAdminDto]),
    __metadata("design:returntype", Promise)
], AdminsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, api_role_decorator_js_1.ApiRole)(role_enum_js_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'List all admins' }),
    (0, api_response_decorator_js_1.ApiSuccessResponse)(admin_response_dto_js_1.AdminResponseDto, 200, true),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, api_role_decorator_js_1.ApiRole)(role_enum_js_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get admin by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Admin ID' }),
    (0, api_response_decorator_js_1.ApiSuccessResponse)(admin_response_dto_js_1.AdminResponseDto),
    (0, api_response_decorator_js_1.ApiNotFound)('Admin'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, api_role_decorator_js_1.ApiRole)(role_enum_js_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Update a admin' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Admin ID' }),
    (0, api_response_decorator_js_1.ApiSuccessResponse)(admin_response_dto_js_1.AdminResponseDto),
    (0, api_response_decorator_js_1.ApiNotFound)('Admin'),
    (0, api_response_decorator_js_1.ApiValidationError)(),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_admin_dto_js_1.UpdateAdminDto]),
    __metadata("design:returntype", Promise)
], AdminsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, api_role_decorator_js_1.ApiRole)(role_enum_js_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a admin' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Admin ID' }),
    (0, api_response_decorator_js_1.ApiNotFound)('Admin'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminsController.prototype, "remove", null);
exports.AdminsController = AdminsController = __decorate([
    (0, swagger_1.ApiTags)('Admins'),
    (0, swagger_1.ApiExtraModels)(admin_response_dto_js_1.AdminResponseDto),
    (0, common_1.Controller)('admins'),
    __metadata("design:paramtypes", [admins_service_js_1.AdminsService])
], AdminsController);
//# sourceMappingURL=admins.controller.js.map
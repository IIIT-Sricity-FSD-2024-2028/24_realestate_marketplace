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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const users_service_js_1 = require("./users.service.js");
const create_user_dto_js_1 = require("./dto/create-user.dto.js");
const update_user_dto_js_1 = require("./dto/update-user.dto.js");
const user_response_dto_js_1 = require("./dto/user-response.dto.js");
const role_enum_js_1 = require("../../common/enums/role.enum.js");
const api_role_decorator_js_1 = require("../../common/decorators/api-role.decorator.js");
const current_user_decorator_js_1 = require("../../common/decorators/current-user.decorator.js");
const api_response_decorator_js_1 = require("../../common/decorators/api-response.decorator.js");
let UsersController = class UsersController {
    usersService;
    constructor(usersService) {
        this.usersService = usersService;
    }
    async create(createUserDto, user) {
        const data = await this.usersService.create(createUserDto, user);
        return { message: 'User created successfully', data };
    }
    async findAll() {
        const data = await this.usersService.findAll();
        return { message: 'Users retrieved successfully', data };
    }
    async findOne(id) {
        const data = await this.usersService.findOne(id);
        return { message: 'User retrieved successfully', data };
    }
    async update(id, updateUserDto, actor) {
        const data = await this.usersService.update(id, updateUserDto, actor);
        return { message: 'User updated successfully', data };
    }
    async remove(id, actor) {
        await this.usersService.remove(id, actor);
        return { message: 'User deleted successfully', data: null };
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, api_role_decorator_js_1.ApiRole)(role_enum_js_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a user',
        description: 'Creates a user record through admin-managed user management. An admin can create ' +
            '`user` accounts only — creating an `admin` or `superuser` account requires a superuser, ' +
            'otherwise an admin could mint a superuser and take over the platform. ' +
            'The password must meet complexity requirements. Email must be unique. ' +
            'For public self-registration, use POST /auth/register instead.',
    }),
    (0, api_response_decorator_js_1.ApiSuccessResponse)(user_response_dto_js_1.UserResponseDto, 201),
    (0, api_response_decorator_js_1.ApiValidationError)(),
    (0, swagger_1.ApiConflictResponse)({ description: 'A user with this email already exists' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_js_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_dto_js_1.CreateUserDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, api_role_decorator_js_1.ApiRole)(role_enum_js_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'List all users',
        description: 'Returns all managed users. Admin-only endpoint.',
    }),
    (0, api_response_decorator_js_1.ApiSuccessResponse)(user_response_dto_js_1.UserResponseDto, 200, true),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, api_role_decorator_js_1.ApiRole)(role_enum_js_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'Get user by ID',
        description: 'Returns a single user by their unique ID. Admin-only endpoint.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'User ID', example: '65f1b2c3d4e5f6a7b8c9d0e1' }),
    (0, api_response_decorator_js_1.ApiSuccessResponse)(user_response_dto_js_1.UserResponseDto),
    (0, api_response_decorator_js_1.ApiNotFound)('User'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, api_role_decorator_js_1.ApiRole)(role_enum_js_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'Update a user',
        description: 'Partially updates user fields. Only send fields you want to change. Admin-only.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'User ID', example: '65f1b2c3d4e5f6a7b8c9d0e1' }),
    (0, api_response_decorator_js_1.ApiSuccessResponse)(user_response_dto_js_1.UserResponseDto),
    (0, api_response_decorator_js_1.ApiNotFound)('User'),
    (0, api_response_decorator_js_1.ApiValidationError)(),
    (0, swagger_1.ApiConflictResponse)({ description: 'Email already taken by another user' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_js_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_user_dto_js_1.UpdateUserDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, api_role_decorator_js_1.ApiRole)(role_enum_js_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'Delete a user',
        description: 'Permanently deletes a user account. Admin-only.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'User ID', example: '65f1b2c3d4e5f6a7b8c9d0e1' }),
    (0, api_response_decorator_js_1.ApiNotFound)('User'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_js_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "remove", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('Users'),
    (0, swagger_1.ApiExtraModels)(user_response_dto_js_1.UserResponseDto),
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [users_service_js_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map
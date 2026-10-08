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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const swagger_1 = require("@nestjs/swagger");
const auth_service_js_1 = require("./auth.service.js");
const register_dto_js_1 = require("./dto/register.dto.js");
const login_dto_js_1 = require("./dto/login.dto.js");
const auth_response_dto_js_1 = require("./dto/auth-response.dto.js");
const forgot_password_dto_js_1 = require("./dto/forgot-password.dto.js");
const forgot_password_response_dto_js_1 = require("./dto/forgot-password-response.dto.js");
const change_password_dto_js_1 = require("./dto/change-password.dto.js");
const user_response_dto_js_1 = require("../users/dto/user-response.dto.js");
const users_service_js_1 = require("../users/users.service.js");
const jwt_auth_guard_js_1 = require("../../common/guards/jwt-auth.guard.js");
const current_user_decorator_js_1 = require("../../common/decorators/current-user.decorator.js");
const api_response_decorator_js_1 = require("../../common/decorators/api-response.decorator.js");
let AuthController = class AuthController {
    authService;
    usersService;
    constructor(authService, usersService) {
        this.authService = authService;
        this.usersService = usersService;
    }
    async register(dto) {
        const data = await this.authService.register(dto);
        return { message: 'Registration successful', data };
    }
    async login(dto) {
        const data = await this.authService.login(dto);
        return { message: 'Login successful', data };
    }
    async forgotPassword(dto) {
        const data = await this.authService.forgotPassword(dto);
        return {
            message: 'If an account with those details exists, a new password has been emailed to it.',
            data,
        };
    }
    async changePassword(dto, user) {
        await this.authService.changePassword(user, dto);
        return { message: 'Password changed successfully', data: null };
    }
    async me(user) {
        const data = await this.usersService.findOne(user.id);
        return { message: 'Current user retrieved successfully', data };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('register'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, throttler_1.Throttle)({ default: { limit: 10, ttl: 60_000 } }),
    (0, swagger_1.ApiOperation)({
        summary: 'Register a new account',
        description: 'Public self-registration. Always creates a Role.USER account (Admin accounts are ' +
            'created separately via POST /users by an existing admin). Returns a JWT immediately.',
    }),
    (0, api_response_decorator_js_1.ApiSuccessResponse)(auth_response_dto_js_1.AuthResponseDto, 201),
    (0, api_response_decorator_js_1.ApiValidationError)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_dto_js_1.RegisterDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, throttler_1.Throttle)({ default: { limit: 10, ttl: 60_000 } }),
    (0, swagger_1.ApiOperation)({
        summary: 'Log in with email and password',
        description: 'Returns a JWT bearer token and the authenticated user profile.',
    }),
    (0, api_response_decorator_js_1.ApiSuccessResponse)(auth_response_dto_js_1.AuthResponseDto, 200),
    (0, api_response_decorator_js_1.ApiValidationError)(),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Invalid email or password' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_js_1.LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('forgot-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, throttler_1.Throttle)({ default: { limit: 5, ttl: 60_000 } }),
    (0, swagger_1.ApiOperation)({
        summary: 'Email a new password to the account',
        description: 'Always responds 200 whether or not the account exists (prevents account enumeration). If it ' +
            'does exist, a newly generated password is emailed straight to it and the old password stops ' +
            'working immediately — the stored password is a bcrypt hash, so the original cannot be ' +
            'recovered or sent. The new password is never returned in this response, only emailed. Pass ' +
            '`userType` to pick which account when one email owns both a buyer and a seller account.',
    }),
    (0, api_response_decorator_js_1.ApiSuccessResponse)(forgot_password_response_dto_js_1.ForgotPasswordResponseDto, 200),
    (0, api_response_decorator_js_1.ApiValidationError)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [forgot_password_dto_js_1.ForgotPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    (0, common_1.Patch)('change-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, swagger_1.ApiOperation)({
        summary: "Change the current user's own password",
        description: 'Any authenticated account. Requires the current password to confirm identity.',
    }),
    (0, api_response_decorator_js_1.ApiValidationError)(),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Missing/invalid token, or the current password is wrong' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_js_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [change_password_dto_js_1.ChangePasswordDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get the current authenticated user',
        description: 'Returns the profile of the user identified by the bearer token.',
    }),
    (0, api_response_decorator_js_1.ApiSuccessResponse)(user_response_dto_js_1.UserResponseDto, 200),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Missing or invalid authentication token' }),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "me", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Auth'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_js_1.AuthService,
        users_service_js_1.UsersService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map
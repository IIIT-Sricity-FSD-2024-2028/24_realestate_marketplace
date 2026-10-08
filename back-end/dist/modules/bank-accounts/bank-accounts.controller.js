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
exports.BankAccountsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const bank_accounts_service_js_1 = require("./bank-accounts.service.js");
const create_bank_account_dto_js_1 = require("./dto/create-bank-account.dto.js");
const update_bank_account_dto_js_1 = require("./dto/update-bank-account.dto.js");
const bank_account_response_dto_js_1 = require("./dto/bank-account-response.dto.js");
const role_enum_js_1 = require("../../common/enums/role.enum.js");
const api_role_decorator_js_1 = require("../../common/decorators/api-role.decorator.js");
const api_response_decorator_js_1 = require("../../common/decorators/api-response.decorator.js");
let BankAccountsController = class BankAccountsController {
    service;
    constructor(service) {
        this.service = service;
    }
    async create(dto) {
        const data = await this.service.create(dto);
        return { message: 'BankAccount created successfully', data };
    }
    async findAll() {
        const data = await this.service.findAll();
        return { message: 'BankAccounts retrieved successfully', data };
    }
    async findOne(id) {
        const data = await this.service.findOne(id);
        return { message: 'BankAccount retrieved successfully', data };
    }
    async update(id, dto) {
        const data = await this.service.update(id, dto);
        return { message: 'BankAccount updated successfully', data };
    }
    async remove(id) {
        await this.service.remove(id);
        return { message: 'BankAccount deleted successfully', data: null };
    }
};
exports.BankAccountsController = BankAccountsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, api_role_decorator_js_1.ApiRole)(role_enum_js_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new bank-account' }),
    (0, api_response_decorator_js_1.ApiSuccessResponse)(bank_account_response_dto_js_1.BankAccountResponseDto, 201),
    (0, api_response_decorator_js_1.ApiValidationError)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_bank_account_dto_js_1.CreateBankAccountDto]),
    __metadata("design:returntype", Promise)
], BankAccountsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all bank-accounts' }),
    (0, api_response_decorator_js_1.ApiSuccessResponse)(bank_account_response_dto_js_1.BankAccountResponseDto, 200, true),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BankAccountsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get bank-account by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'BankAccount ID' }),
    (0, api_response_decorator_js_1.ApiSuccessResponse)(bank_account_response_dto_js_1.BankAccountResponseDto),
    (0, api_response_decorator_js_1.ApiNotFound)('BankAccount'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BankAccountsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, api_role_decorator_js_1.ApiRole)(role_enum_js_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Update a bank-account' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'BankAccount ID' }),
    (0, api_response_decorator_js_1.ApiSuccessResponse)(bank_account_response_dto_js_1.BankAccountResponseDto),
    (0, api_response_decorator_js_1.ApiNotFound)('BankAccount'),
    (0, api_response_decorator_js_1.ApiValidationError)(),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_bank_account_dto_js_1.UpdateBankAccountDto]),
    __metadata("design:returntype", Promise)
], BankAccountsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, api_role_decorator_js_1.ApiRole)(role_enum_js_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a bank-account' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'BankAccount ID' }),
    (0, api_response_decorator_js_1.ApiNotFound)('BankAccount'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BankAccountsController.prototype, "remove", null);
exports.BankAccountsController = BankAccountsController = __decorate([
    (0, swagger_1.ApiTags)('BankAccounts'),
    (0, swagger_1.ApiExtraModels)(bank_account_response_dto_js_1.BankAccountResponseDto),
    (0, common_1.Controller)('bank-accounts'),
    __metadata("design:paramtypes", [bank_accounts_service_js_1.BankAccountsService])
], BankAccountsController);
//# sourceMappingURL=bank-accounts.controller.js.map
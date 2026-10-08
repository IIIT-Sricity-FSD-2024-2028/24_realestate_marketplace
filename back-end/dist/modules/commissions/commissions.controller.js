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
exports.CommissionsController = exports.WaiveCommissionDto = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const swagger_2 = require("@nestjs/swagger");
const commissions_service_js_1 = require("./commissions.service.js");
const commission_response_dto_js_1 = require("./dto/commission-response.dto.js");
const role_enum_js_1 = require("../../common/enums/role.enum.js");
const api_role_decorator_js_1 = require("../../common/decorators/api-role.decorator.js");
const current_user_decorator_js_1 = require("../../common/decorators/current-user.decorator.js");
const api_response_decorator_js_1 = require("../../common/decorators/api-response.decorator.js");
class WaiveCommissionDto {
    reason;
}
exports.WaiveCommissionDto = WaiveCommissionDto;
__decorate([
    (0, swagger_2.ApiPropertyOptional)({ example: 'Goodwill — first deal for this seller', maxLength: 200 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], WaiveCommissionDto.prototype, "reason", void 0);
let CommissionsController = class CommissionsController {
    service;
    constructor(service) {
        this.service = service;
    }
    async findMine(user) {
        const data = await this.service.findByParty(user.id);
        return { message: 'Commission invoices retrieved successfully', data };
    }
    async findAll(limit) {
        const parsed = Number(limit);
        const data = await this.service.findAll(Number.isFinite(parsed) && parsed > 0 ? Math.min(parsed, 500) : 100);
        return { message: 'Commissions retrieved successfully', data };
    }
    async reinstate(id) {
        const data = await this.service.reinstate(id);
        return { message: 'Commission reinstated — it is payable again', data };
    }
    async waive(id, dto) {
        const data = await this.service.waive(id, dto.reason ?? '');
        return { message: 'Commission waived', data };
    }
};
exports.CommissionsController = CommissionsController;
__decorate([
    (0, common_1.Get)('mine'),
    (0, api_role_decorator_js_1.ApiRole)(role_enum_js_1.Role.USER),
    (0, swagger_1.ApiOperation)({
        summary: 'Commission invoices owed by the authenticated account',
        description: 'Both sides of the book for this account: what is still owed on closed deals and what has ' +
            'already been settled. Buyers and sellers each see only their own lines.',
    }),
    (0, api_response_decorator_js_1.ApiSuccessResponse)(commission_response_dto_js_1.CommissionResponseDto, 200, true),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CommissionsController.prototype, "findMine", null);
__decorate([
    (0, common_1.Get)(),
    (0, api_role_decorator_js_1.ApiRole)(role_enum_js_1.Role.SUPERUSER),
    (0, swagger_1.ApiOperation)({
        summary: 'Platform-wide commission book',
        description: 'Every accrued, settled and waived commission line. Superuser only.',
    }),
    (0, api_response_decorator_js_1.ApiSuccessResponse)(commission_response_dto_js_1.CommissionResponseDto, 200, true),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CommissionsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Patch)(':id/reinstate'),
    (0, api_role_decorator_js_1.ApiRole)(role_enum_js_1.Role.SUPERUSER),
    (0, swagger_1.ApiOperation)({
        summary: 'Undo a write-off, making the invoice payable again',
        description: 'Superuser only. Puts a `waived` line back to `accrued` with its original amount and rate ' +
            'intact, so the party can settle it through the normal checkout. A settled commission ' +
            'cannot be reinstated.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Commission ID' }),
    (0, api_response_decorator_js_1.ApiSuccessResponse)(commission_response_dto_js_1.CommissionResponseDto),
    (0, api_response_decorator_js_1.ApiNotFound)('Commission'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CommissionsController.prototype, "reinstate", null);
__decorate([
    (0, common_1.Patch)(':id/waive'),
    (0, api_role_decorator_js_1.ApiRole)(role_enum_js_1.Role.SUPERUSER),
    (0, swagger_1.ApiOperation)({
        summary: 'Write off a commission line',
        description: 'Superuser only. The line stays on the books marked `waived`, so written-off revenue is ' +
            'visible in the report rather than silently disappearing.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Commission ID' }),
    (0, api_response_decorator_js_1.ApiSuccessResponse)(commission_response_dto_js_1.CommissionResponseDto),
    (0, api_response_decorator_js_1.ApiNotFound)('Commission'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, WaiveCommissionDto]),
    __metadata("design:returntype", Promise)
], CommissionsController.prototype, "waive", null);
exports.CommissionsController = CommissionsController = __decorate([
    (0, swagger_1.ApiTags)('Commissions'),
    (0, common_1.Controller)('commissions'),
    __metadata("design:paramtypes", [commissions_service_js_1.CommissionsService])
], CommissionsController);
//# sourceMappingURL=commissions.controller.js.map
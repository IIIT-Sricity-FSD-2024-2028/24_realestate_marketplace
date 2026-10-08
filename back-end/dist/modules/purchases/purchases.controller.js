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
exports.PurchasesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const purchases_service_js_1 = require("./purchases.service.js");
const purchase_response_dto_js_1 = require("./dto/purchase-response.dto.js");
const purchase_filter_dto_js_1 = require("./dto/purchase-filter.dto.js");
const role_enum_js_1 = require("../../common/enums/role.enum.js");
const api_role_decorator_js_1 = require("../../common/decorators/api-role.decorator.js");
const current_user_decorator_js_1 = require("../../common/decorators/current-user.decorator.js");
const api_response_decorator_js_1 = require("../../common/decorators/api-response.decorator.js");
let PurchasesController = class PurchasesController {
    purchasesService;
    constructor(purchasesService) {
        this.purchasesService = purchasesService;
    }
    async findMine(user) {
        const data = await this.purchasesService.findByOwner(user.id);
        return { message: 'Your purchases retrieved successfully', data };
    }
    async findForReview(filters, user) {
        const data = await this.purchasesService.findForReview(filters, user);
        return { message: 'Purchases retrieved successfully', data };
    }
    async findForSeller(filters, user) {
        const data = await this.purchasesService.findForSeller(user, filters);
        return { message: 'Purchases retrieved successfully', data };
    }
    async findOne(id, user) {
        const data = await this.purchasesService.findOne(id, user);
        return { message: 'Purchase retrieved successfully', data };
    }
    async advance(id, user) {
        const data = await this.purchasesService.advance(id, user);
        return { message: 'Purchase advanced to the next step', data };
    }
    async cancel(id, user) {
        const data = await this.purchasesService.cancel(id, user);
        return { message: 'Purchase cancelled', data };
    }
};
exports.PurchasesController = PurchasesController;
__decorate([
    (0, common_1.Get)('mine'),
    (0, api_role_decorator_js_1.ApiRole)(role_enum_js_1.Role.USER),
    (0, swagger_1.ApiOperation)({
        summary: "List the authenticated buyer's own purchases",
        description: 'Every purchase created from one of this buyer\'s accepted negotiations, with deal-step progress.',
    }),
    (0, api_response_decorator_js_1.ApiSuccessResponse)(purchase_response_dto_js_1.PurchaseResponseDto, 200, true),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PurchasesController.prototype, "findMine", null);
__decorate([
    (0, common_1.Get)('review-queue'),
    (0, api_role_decorator_js_1.ApiRole)(role_enum_js_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'Admin/superuser purchase tracking queue',
        description: 'Every purchase, with buyer and property populated. Filter by dealStatus. Every admin sees ' +
            'the same full queue — no per-admin scoping.',
    }),
    (0, api_response_decorator_js_1.ApiSuccessResponse)(purchase_response_dto_js_1.PurchaseResponseDto, 200, true),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_js_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [purchase_filter_dto_js_1.PurchaseFilterDto, Object]),
    __metadata("design:returntype", Promise)
], PurchasesController.prototype, "findForReview", null);
__decorate([
    (0, common_1.Get)('seller-queue'),
    (0, api_role_decorator_js_1.ApiRole)(role_enum_js_1.Role.USER),
    (0, swagger_1.ApiOperation)({
        summary: "Seller's purchase tracking queue (read-only)",
        description: 'Every purchase on a property this seller submitted. Seller accounts only.',
    }),
    (0, api_response_decorator_js_1.ApiSuccessResponse)(purchase_response_dto_js_1.PurchaseResponseDto, 200, true),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_js_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [purchase_filter_dto_js_1.PurchaseFilterDto, Object]),
    __metadata("design:returntype", Promise)
], PurchasesController.prototype, "findForSeller", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, api_role_decorator_js_1.ApiRole)(role_enum_js_1.Role.ADMIN, role_enum_js_1.Role.USER),
    (0, swagger_1.ApiOperation)({
        summary: 'Get a purchase by ID',
        description: 'Admins/superusers can view any purchase; buyers may only view their own.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Purchase ID', example: '65f1b2c3d4e5f6a7b8c9d0e1' }),
    (0, api_response_decorator_js_1.ApiSuccessResponse)(purchase_response_dto_js_1.PurchaseResponseDto),
    (0, api_response_decorator_js_1.ApiNotFound)('Purchase'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_js_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PurchasesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id/advance'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, api_role_decorator_js_1.ApiRole)(role_enum_js_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'Advance a purchase to its next deal step',
        description: 'Moves through: Offer Accepted → Document Verification → Token Payment → Full Payment → Registration. ' +
            'Advancing past Registration marks the deal completed. Admin/superuser only.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Purchase ID', example: '65f1b2c3d4e5f6a7b8c9d0e1' }),
    (0, api_response_decorator_js_1.ApiSuccessResponse)(purchase_response_dto_js_1.PurchaseResponseDto),
    (0, api_response_decorator_js_1.ApiNotFound)('Purchase'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_js_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PurchasesController.prototype, "advance", null);
__decorate([
    (0, common_1.Patch)(':id/cancel'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, api_role_decorator_js_1.ApiRole)(role_enum_js_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel a purchase', description: 'Admin/superuser only.' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Purchase ID', example: '65f1b2c3d4e5f6a7b8c9d0e1' }),
    (0, api_response_decorator_js_1.ApiSuccessResponse)(purchase_response_dto_js_1.PurchaseResponseDto),
    (0, api_response_decorator_js_1.ApiNotFound)('Purchase'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_js_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PurchasesController.prototype, "cancel", null);
exports.PurchasesController = PurchasesController = __decorate([
    (0, swagger_1.ApiTags)('Purchases'),
    (0, common_1.Controller)('purchases'),
    __metadata("design:paramtypes", [purchases_service_js_1.PurchasesService])
], PurchasesController);
//# sourceMappingURL=purchases.controller.js.map
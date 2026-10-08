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
exports.NegotiationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const negotiations_service_js_1 = require("./negotiations.service.js");
const create_negotiation_dto_js_1 = require("./dto/create-negotiation.dto.js");
const negotiation_response_dto_js_1 = require("./dto/negotiation-response.dto.js");
const negotiation_filter_dto_js_1 = require("./dto/negotiation-filter.dto.js");
const role_enum_js_1 = require("../../common/enums/role.enum.js");
const api_role_decorator_js_1 = require("../../common/decorators/api-role.decorator.js");
const current_user_decorator_js_1 = require("../../common/decorators/current-user.decorator.js");
const api_response_decorator_js_1 = require("../../common/decorators/api-response.decorator.js");
let NegotiationsController = class NegotiationsController {
    negotiationsService;
    constructor(negotiationsService) {
        this.negotiationsService = negotiationsService;
    }
    async create(dto, user) {
        const data = await this.negotiationsService.create(dto, user);
        return { message: 'Offer submitted successfully', data };
    }
    async findMine(user) {
        const data = await this.negotiationsService.findByOwner(user.id);
        return { message: 'Your negotiations retrieved successfully', data };
    }
    async findForReview(filters, user) {
        const data = await this.negotiationsService.findForReview(filters, user);
        return { message: 'Negotiations retrieved successfully', data };
    }
    async findForSeller(filters, user) {
        const data = await this.negotiationsService.findForSeller(user, filters);
        return { message: 'Negotiations retrieved successfully', data };
    }
    async findOne(id, user) {
        const data = await this.negotiationsService.findOne(id, user);
        return { message: 'Negotiation retrieved successfully', data };
    }
    async counter(id, dto, user) {
        const data = await this.negotiationsService.counter(id, dto, user);
        return { message: 'Counter-offer sent', data };
    }
    async accept(id, user) {
        const data = await this.negotiationsService.acceptOffer(id, user);
        return { message: 'Offer accepted — purchase created', data };
    }
    async reject(id, dto, user) {
        const data = await this.negotiationsService.reject(id, dto, user);
        return { message: 'Negotiation rejected', data };
    }
    async acceptCounter(id, user) {
        const data = await this.negotiationsService.acceptCounterByBuyer(id, user);
        return { message: 'Counter-offer accepted — purchase created', data };
    }
    async withdraw(id, user) {
        const data = await this.negotiationsService.withdraw(id, user);
        return { message: 'Offer withdrawn', data };
    }
};
exports.NegotiationsController = NegotiationsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, api_role_decorator_js_1.ApiRole)(role_enum_js_1.Role.USER),
    (0, swagger_1.ApiOperation)({
        summary: 'Submit an offer on a property',
        description: "Buyer accounts only. Starts in `pending` status, awaiting the seller's response.",
    }),
    (0, api_response_decorator_js_1.ApiSuccessResponse)(negotiation_response_dto_js_1.NegotiationResponseDto, 201),
    (0, api_response_decorator_js_1.ApiValidationError)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_js_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_negotiation_dto_js_1.CreateNegotiationDto, Object]),
    __metadata("design:returntype", Promise)
], NegotiationsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('mine'),
    (0, api_role_decorator_js_1.ApiRole)(role_enum_js_1.Role.USER),
    (0, swagger_1.ApiOperation)({ summary: "List the authenticated buyer's own negotiations" }),
    (0, api_response_decorator_js_1.ApiSuccessResponse)(negotiation_response_dto_js_1.NegotiationResponseDto, 200, true),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NegotiationsController.prototype, "findMine", null);
__decorate([
    (0, common_1.Get)('review-queue'),
    (0, api_role_decorator_js_1.ApiRole)(role_enum_js_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'Admin/superuser negotiation oversight queue (view-only)',
        description: 'Every negotiation, with buyer and property populated. Filter by status. Every admin sees the ' +
            'same full queue — no per-admin scoping. This queue is strictly READ-ONLY: negotiation is ' +
            'buyer-seller, and only the seller who listed the property may counter/accept/reject (see ' +
            '/negotiations/seller-queue). `propertyHasSeller: false` marks an offer nobody can answer.',
    }),
    (0, api_response_decorator_js_1.ApiSuccessResponse)(negotiation_response_dto_js_1.NegotiationResponseDto, 200, true),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_js_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [negotiation_filter_dto_js_1.NegotiationFilterDto, Object]),
    __metadata("design:returntype", Promise)
], NegotiationsController.prototype, "findForReview", null);
__decorate([
    (0, common_1.Get)('seller-queue'),
    (0, api_role_decorator_js_1.ApiRole)(role_enum_js_1.Role.USER),
    (0, swagger_1.ApiOperation)({
        summary: "Seller's negotiation queue",
        description: 'Every negotiation on a property this seller submitted. Seller accounts only.',
    }),
    (0, api_response_decorator_js_1.ApiSuccessResponse)(negotiation_response_dto_js_1.NegotiationResponseDto, 200, true),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_js_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [negotiation_filter_dto_js_1.NegotiationFilterDto, Object]),
    __metadata("design:returntype", Promise)
], NegotiationsController.prototype, "findForSeller", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, api_role_decorator_js_1.ApiRole)(role_enum_js_1.Role.ADMIN, role_enum_js_1.Role.USER),
    (0, swagger_1.ApiOperation)({
        summary: 'Get a negotiation by ID',
        description: 'Admins/superusers can view any negotiation; buyers may only view their own.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Negotiation ID', example: '65f1b2c3d4e5f6a7b8c9d0e1' }),
    (0, api_response_decorator_js_1.ApiSuccessResponse)(negotiation_response_dto_js_1.NegotiationResponseDto),
    (0, api_response_decorator_js_1.ApiNotFound)('Negotiation'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_js_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], NegotiationsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id/counter'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, api_role_decorator_js_1.ApiRole)(role_enum_js_1.Role.USER),
    (0, swagger_1.ApiOperation)({
        summary: 'Counter-offer a pending negotiation',
        description: 'Only the seller who listed the property may respond. Admins never negotiate price.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Negotiation ID', example: '65f1b2c3d4e5f6a7b8c9d0e1' }),
    (0, api_response_decorator_js_1.ApiSuccessResponse)(negotiation_response_dto_js_1.NegotiationResponseDto),
    (0, api_response_decorator_js_1.ApiNotFound)('Negotiation'),
    (0, api_response_decorator_js_1.ApiValidationError)(),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_js_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_negotiation_dto_js_1.CounterNegotiationDto, Object]),
    __metadata("design:returntype", Promise)
], NegotiationsController.prototype, "counter", null);
__decorate([
    (0, common_1.Patch)(':id/accept'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, api_role_decorator_js_1.ApiRole)(role_enum_js_1.Role.USER),
    (0, swagger_1.ApiOperation)({
        summary: "Accept the buyer's offer as-is",
        description: "Only the seller who listed the property may respond. Creates a Purchase at the buyer's " +
            'offer amount, which the buyer then initiates and the admin drives step by step.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Negotiation ID', example: '65f1b2c3d4e5f6a7b8c9d0e1' }),
    (0, api_response_decorator_js_1.ApiSuccessResponse)(negotiation_response_dto_js_1.NegotiationResponseDto),
    (0, api_response_decorator_js_1.ApiNotFound)('Negotiation'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_js_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], NegotiationsController.prototype, "accept", null);
__decorate([
    (0, common_1.Patch)(':id/reject'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, api_role_decorator_js_1.ApiRole)(role_enum_js_1.Role.USER),
    (0, swagger_1.ApiOperation)({
        summary: 'Reject a negotiation',
        description: 'Only the seller who listed the property may respond. Admins never negotiate price.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Negotiation ID', example: '65f1b2c3d4e5f6a7b8c9d0e1' }),
    (0, api_response_decorator_js_1.ApiSuccessResponse)(negotiation_response_dto_js_1.NegotiationResponseDto),
    (0, api_response_decorator_js_1.ApiNotFound)('Negotiation'),
    (0, api_response_decorator_js_1.ApiValidationError)(),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_js_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_negotiation_dto_js_1.RejectNegotiationDto, Object]),
    __metadata("design:returntype", Promise)
], NegotiationsController.prototype, "reject", null);
__decorate([
    (0, common_1.Patch)(':id/accept-counter'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, api_role_decorator_js_1.ApiRole)(role_enum_js_1.Role.USER),
    (0, swagger_1.ApiOperation)({
        summary: "Accept the seller's counter-offer",
        description: 'Buyer (owner) only. Creates a Purchase at the counter-offer amount.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Negotiation ID', example: '65f1b2c3d4e5f6a7b8c9d0e1' }),
    (0, api_response_decorator_js_1.ApiSuccessResponse)(negotiation_response_dto_js_1.NegotiationResponseDto),
    (0, api_response_decorator_js_1.ApiNotFound)('Negotiation'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_js_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], NegotiationsController.prototype, "acceptCounter", null);
__decorate([
    (0, common_1.Patch)(':id/withdraw'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, api_role_decorator_js_1.ApiRole)(role_enum_js_1.Role.USER),
    (0, swagger_1.ApiOperation)({ summary: 'Withdraw your own offer', description: 'Buyer (owner) only.' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Negotiation ID', example: '65f1b2c3d4e5f6a7b8c9d0e1' }),
    (0, api_response_decorator_js_1.ApiSuccessResponse)(negotiation_response_dto_js_1.NegotiationResponseDto),
    (0, api_response_decorator_js_1.ApiNotFound)('Negotiation'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_js_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], NegotiationsController.prototype, "withdraw", null);
exports.NegotiationsController = NegotiationsController = __decorate([
    (0, swagger_1.ApiTags)('Negotiations'),
    (0, common_1.Controller)('negotiations'),
    __metadata("design:paramtypes", [negotiations_service_js_1.NegotiationsService])
], NegotiationsController);
//# sourceMappingURL=negotiations.controller.js.map
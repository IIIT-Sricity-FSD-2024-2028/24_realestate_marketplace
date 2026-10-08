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
exports.VisitsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const visits_service_js_1 = require("./visits.service.js");
const create_visit_dto_js_1 = require("./dto/create-visit.dto.js");
const visit_response_dto_js_1 = require("./dto/visit-response.dto.js");
const visit_filter_dto_js_1 = require("./dto/visit-filter.dto.js");
const role_enum_js_1 = require("../../common/enums/role.enum.js");
const api_role_decorator_js_1 = require("../../common/decorators/api-role.decorator.js");
const current_user_decorator_js_1 = require("../../common/decorators/current-user.decorator.js");
const api_response_decorator_js_1 = require("../../common/decorators/api-response.decorator.js");
let VisitsController = class VisitsController {
    visitsService;
    constructor(visitsService) {
        this.visitsService = visitsService;
    }
    async create(dto, user) {
        const data = await this.visitsService.create(dto, user);
        return { message: 'Visit requested successfully', data };
    }
    async findMine(user) {
        const data = await this.visitsService.findByOwner(user.id);
        return { message: 'Your visits retrieved successfully', data };
    }
    async findForReview(filters, user) {
        const data = await this.visitsService.findForReview(user, filters);
        return { message: 'Visits retrieved successfully', data };
    }
    async findOne(id, user) {
        const data = await this.visitsService.findOne(id, user);
        return { message: 'Visit retrieved successfully', data };
    }
    async confirm(id, user) {
        const data = await this.visitsService.confirm(id, user);
        return { message: 'Visit confirmed', data };
    }
    async reschedule(id, dto, user) {
        const data = await this.visitsService.reschedule(id, dto, user);
        return { message: 'Visit rescheduled', data };
    }
    async complete(id, user) {
        const data = await this.visitsService.complete(id, user);
        return { message: 'Visit marked completed', data };
    }
    async cancel(id, dto, user) {
        const data = await this.visitsService.cancel(id, dto, user);
        return { message: 'Visit cancelled', data };
    }
};
exports.VisitsController = VisitsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, api_role_decorator_js_1.ApiRole)(role_enum_js_1.Role.USER),
    (0, swagger_1.ApiOperation)({
        summary: 'Request a site visit on a property',
        description: 'Buyer accounts only. Starts in `pending` status, awaiting any admin to confirm — site visits ' +
            'are handled by the admin, not the seller.',
    }),
    (0, api_response_decorator_js_1.ApiSuccessResponse)(visit_response_dto_js_1.VisitResponseDto, 201),
    (0, api_response_decorator_js_1.ApiValidationError)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_js_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_visit_dto_js_1.CreateVisitDto, Object]),
    __metadata("design:returntype", Promise)
], VisitsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('mine'),
    (0, api_role_decorator_js_1.ApiRole)(role_enum_js_1.Role.USER),
    (0, swagger_1.ApiOperation)({ summary: "List the authenticated buyer's own visit requests" }),
    (0, api_response_decorator_js_1.ApiSuccessResponse)(visit_response_dto_js_1.VisitResponseDto, 200, true),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], VisitsController.prototype, "findMine", null);
__decorate([
    (0, common_1.Get)('review-queue'),
    (0, api_role_decorator_js_1.ApiRole)(role_enum_js_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'Admin/superuser visit queue',
        description: 'Every visit request, with buyer and property populated. Every admin sees the same full ' +
            'queue — every item here is one any admin may act on.',
    }),
    (0, api_response_decorator_js_1.ApiSuccessResponse)(visit_response_dto_js_1.VisitResponseDto, 200, true),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_js_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [visit_filter_dto_js_1.VisitFilterDto, Object]),
    __metadata("design:returntype", Promise)
], VisitsController.prototype, "findForReview", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, api_role_decorator_js_1.ApiRole)(role_enum_js_1.Role.USER),
    (0, swagger_1.ApiOperation)({ summary: 'Get a visit by ID', description: 'Buyer (owner) only.' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Visit ID', example: '65f1b2c3d4e5f6a7b8c9d0e1' }),
    (0, api_response_decorator_js_1.ApiSuccessResponse)(visit_response_dto_js_1.VisitResponseDto),
    (0, api_response_decorator_js_1.ApiNotFound)('Visit'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_js_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], VisitsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id/confirm'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, api_role_decorator_js_1.ApiRole)(role_enum_js_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'Confirm a pending visit request',
        description: 'Any admin (or superuser) may respond — no per-admin restriction.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Visit ID', example: '65f1b2c3d4e5f6a7b8c9d0e1' }),
    (0, api_response_decorator_js_1.ApiSuccessResponse)(visit_response_dto_js_1.VisitResponseDto),
    (0, api_response_decorator_js_1.ApiNotFound)('Visit'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_js_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], VisitsController.prototype, "confirm", null);
__decorate([
    (0, common_1.Patch)(':id/reschedule'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, api_role_decorator_js_1.ApiRole)(role_enum_js_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'Propose a new date/time for a visit',
        description: 'Any admin (or superuser) may respond — no per-admin restriction.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Visit ID', example: '65f1b2c3d4e5f6a7b8c9d0e1' }),
    (0, api_response_decorator_js_1.ApiSuccessResponse)(visit_response_dto_js_1.VisitResponseDto),
    (0, api_response_decorator_js_1.ApiNotFound)('Visit'),
    (0, api_response_decorator_js_1.ApiValidationError)(),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_js_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_visit_dto_js_1.RescheduleVisitDto, Object]),
    __metadata("design:returntype", Promise)
], VisitsController.prototype, "reschedule", null);
__decorate([
    (0, common_1.Patch)(':id/complete'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, api_role_decorator_js_1.ApiRole)(role_enum_js_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'Mark a visit as completed',
        description: 'Any admin (or superuser) may respond — no per-admin restriction.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Visit ID', example: '65f1b2c3d4e5f6a7b8c9d0e1' }),
    (0, api_response_decorator_js_1.ApiSuccessResponse)(visit_response_dto_js_1.VisitResponseDto),
    (0, api_response_decorator_js_1.ApiNotFound)('Visit'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_js_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], VisitsController.prototype, "complete", null);
__decorate([
    (0, common_1.Patch)(':id/cancel'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, api_role_decorator_js_1.ApiRole)(role_enum_js_1.Role.USER, role_enum_js_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'Cancel a visit',
        description: 'The requesting buyer, or any admin, may cancel.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Visit ID', example: '65f1b2c3d4e5f6a7b8c9d0e1' }),
    (0, api_response_decorator_js_1.ApiSuccessResponse)(visit_response_dto_js_1.VisitResponseDto),
    (0, api_response_decorator_js_1.ApiNotFound)('Visit'),
    (0, api_response_decorator_js_1.ApiValidationError)(),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_js_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_visit_dto_js_1.CancelVisitDto, Object]),
    __metadata("design:returntype", Promise)
], VisitsController.prototype, "cancel", null);
exports.VisitsController = VisitsController = __decorate([
    (0, swagger_1.ApiTags)('Visits'),
    (0, common_1.Controller)('visits'),
    __metadata("design:paramtypes", [visits_service_js_1.VisitsService])
], VisitsController);
//# sourceMappingURL=visits.controller.js.map
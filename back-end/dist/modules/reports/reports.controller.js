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
exports.ReportsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const reports_service_js_1 = require("./reports.service.js");
const create_report_dto_js_1 = require("./dto/create-report.dto.js");
const update_report_dto_js_1 = require("./dto/update-report.dto.js");
const report_response_dto_js_1 = require("./dto/report-response.dto.js");
const role_enum_js_1 = require("../../common/enums/role.enum.js");
const api_role_decorator_js_1 = require("../../common/decorators/api-role.decorator.js");
const api_response_decorator_js_1 = require("../../common/decorators/api-response.decorator.js");
let ReportsController = class ReportsController {
    service;
    constructor(service) {
        this.service = service;
    }
    async create(dto) {
        const data = await this.service.create(dto);
        return { message: 'Report created successfully', data };
    }
    async findAll() {
        const data = await this.service.findAll();
        return { message: 'Reports retrieved successfully', data };
    }
    async findOne(id) {
        const data = await this.service.findOne(id);
        return { message: 'Report retrieved successfully', data };
    }
    async update(id, dto) {
        const data = await this.service.update(id, dto);
        return { message: 'Report updated successfully', data };
    }
    async remove(id) {
        await this.service.remove(id);
        return { message: 'Report deleted successfully', data: null };
    }
};
exports.ReportsController = ReportsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, api_role_decorator_js_1.ApiRole)(role_enum_js_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new report' }),
    (0, api_response_decorator_js_1.ApiSuccessResponse)(report_response_dto_js_1.ReportResponseDto, 201),
    (0, api_response_decorator_js_1.ApiValidationError)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_report_dto_js_1.CreateReportDto]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all reports' }),
    (0, api_response_decorator_js_1.ApiSuccessResponse)(report_response_dto_js_1.ReportResponseDto, 200, true),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get report by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Report ID' }),
    (0, api_response_decorator_js_1.ApiSuccessResponse)(report_response_dto_js_1.ReportResponseDto),
    (0, api_response_decorator_js_1.ApiNotFound)('Report'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, api_role_decorator_js_1.ApiRole)(role_enum_js_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Update a report' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Report ID' }),
    (0, api_response_decorator_js_1.ApiSuccessResponse)(report_response_dto_js_1.ReportResponseDto),
    (0, api_response_decorator_js_1.ApiNotFound)('Report'),
    (0, api_response_decorator_js_1.ApiValidationError)(),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_report_dto_js_1.UpdateReportDto]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, api_role_decorator_js_1.ApiRole)(role_enum_js_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a report' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Report ID' }),
    (0, api_response_decorator_js_1.ApiNotFound)('Report'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "remove", null);
exports.ReportsController = ReportsController = __decorate([
    (0, swagger_1.ApiTags)('Reports'),
    (0, swagger_1.ApiExtraModels)(report_response_dto_js_1.ReportResponseDto),
    (0, common_1.Controller)('reports'),
    __metadata("design:paramtypes", [reports_service_js_1.ReportsService])
], ReportsController);
//# sourceMappingURL=reports.controller.js.map
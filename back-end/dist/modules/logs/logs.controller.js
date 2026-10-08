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
exports.LogsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const api_role_decorator_js_1 = require("../../common/decorators/api-role.decorator.js");
const role_enum_js_1 = require("../../common/enums/role.enum.js");
const log_channels_js_1 = require("../../common/logging/log-channels.js");
const log_query_dto_js_1 = require("./dto/log-query.dto.js");
const logs_service_js_1 = require("./logs.service.js");
let LogsController = class LogsController {
    logsService;
    constructor(logsService) {
        this.logsService = logsService;
    }
    summary() {
        return { message: 'Log files retrieved successfully', data: this.logsService.summary() };
    }
    async read(params, query) {
        const data = await this.logsService.read(params.channel, query);
        return { message: 'Log entries retrieved successfully', data };
    }
};
exports.LogsController = LogsController;
__decorate([
    (0, common_1.Get)(),
    (0, api_role_decorator_js_1.ApiRole)(role_enum_js_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'List every log channel and the files it has on disk',
        description: 'Returns the four channels (http, error, app, audit) with their directory, the file ' +
            'currently being appended to, and every rotated file with its size.',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], LogsController.prototype, "summary", null);
__decorate([
    (0, common_1.Get)(':channel'),
    (0, api_role_decorator_js_1.ApiRole)(role_enum_js_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'Read the most recent entries from one log channel',
        description: 'Tails the current file (or the one named by ?file=), newest entry last. ' +
            'Use ?lines= to change how many, and ?level= to filter by severity.',
    }),
    (0, swagger_1.ApiParam)({ name: 'channel', enum: log_channels_js_1.LOG_CHANNELS }),
    __param(0, (0, common_1.Param)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [log_query_dto_js_1.LogChannelParamDto, log_query_dto_js_1.LogQueryDto]),
    __metadata("design:returntype", Promise)
], LogsController.prototype, "read", null);
exports.LogsController = LogsController = __decorate([
    (0, swagger_1.ApiTags)('Logs'),
    (0, common_1.Controller)('logs'),
    __metadata("design:paramtypes", [logs_service_js_1.LogsService])
], LogsController);
//# sourceMappingURL=logs.controller.js.map
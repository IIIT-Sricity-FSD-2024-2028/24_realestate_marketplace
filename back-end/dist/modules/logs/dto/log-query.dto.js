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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogChannelParamDto = exports.LogQueryDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const log_channels_js_1 = require("../../../common/logging/log-channels.js");
class LogQueryDto {
    file;
    lines = 100;
    level;
}
exports.LogQueryDto = LogQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Which log file to read. Defaults to the current (today\'s) file.',
        example: 'http-2026-08-28.log',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^[A-Za-z0-9._-]+\.log$/, { message: 'file must be a .log file name' }),
    __metadata("design:type", String)
], LogQueryDto.prototype, "file", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'How many of the most recent entries to return',
        default: 100,
        minimum: 1,
        maximum: 1000,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(1000),
    __metadata("design:type", Number)
], LogQueryDto.prototype, "lines", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Only return entries at this level',
        enum: ['debug', 'info', 'warn', 'error', 'fatal'],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['debug', 'info', 'warn', 'error', 'fatal']),
    __metadata("design:type", String)
], LogQueryDto.prototype, "level", void 0);
class LogChannelParamDto {
    channel;
}
exports.LogChannelParamDto = LogChannelParamDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: log_channels_js_1.LOG_CHANNELS }),
    (0, class_validator_1.IsIn)(log_channels_js_1.LOG_CHANNELS),
    __metadata("design:type", String)
], LogChannelParamDto.prototype, "channel", void 0);
//# sourceMappingURL=log-query.dto.js.map
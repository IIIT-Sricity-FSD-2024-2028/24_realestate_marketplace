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
exports.PaymentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const payments_service_js_1 = require("./payments.service.js");
const payment_response_dto_js_1 = require("./dto/payment-response.dto.js");
const role_enum_js_1 = require("../../common/enums/role.enum.js");
const api_role_decorator_js_1 = require("../../common/decorators/api-role.decorator.js");
const current_user_decorator_js_1 = require("../../common/decorators/current-user.decorator.js");
const api_response_decorator_js_1 = require("../../common/decorators/api-response.decorator.js");
let PaymentsController = class PaymentsController {
    service;
    constructor(service) {
        this.service = service;
    }
    async findMine(user) {
        const data = await this.service.findByUser(user.id);
        return { message: 'Payment history retrieved successfully', data };
    }
    async findAll(limit) {
        const parsed = Number(limit);
        const data = await this.service.findAll(Number.isFinite(parsed) && parsed > 0 ? Math.min(parsed, 500) : 100);
        return { message: 'Payments retrieved successfully', data };
    }
    async findOne(id, user) {
        const data = await this.service.findOne(id);
        if (user.role !== role_enum_js_1.Role.SUPERUSER && data.userId !== user.id) {
            throw new common_1.ForbiddenException('You do not have permission to view this payment');
        }
        return { message: 'Payment retrieved successfully', data };
    }
    async webhook(req, signature, body) {
        const raw = req.rawBody?.toString('utf8');
        if (!raw || !signature || !this.service.verifyWebhook(raw, signature)) {
            throw new common_1.BadRequestException('Invalid webhook signature');
        }
        const entity = body?.payload?.payment?.entity;
        if (body?.event === 'payment.captured' && entity?.order_id) {
            await this.service.captureFromWebhook(entity.order_id, entity.id ?? 'unknown');
        }
        return { message: 'Webhook processed', data: null };
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.Get)('mine'),
    (0, api_role_decorator_js_1.ApiRole)(role_enum_js_1.Role.USER, role_enum_js_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: "The authenticated account's own payment history",
        description: 'Every order this account opened, paid or not, newest first.',
    }),
    (0, api_response_decorator_js_1.ApiSuccessResponse)(payment_response_dto_js_1.PaymentResponseDto, 200, true),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "findMine", null);
__decorate([
    (0, common_1.Get)(),
    (0, api_role_decorator_js_1.ApiRole)(role_enum_js_1.Role.SUPERUSER),
    (0, swagger_1.ApiOperation)({
        summary: 'Platform-wide payment ledger',
        description: 'Superuser only — this is the money trail for the whole platform, so it is deliberately ' +
            'not exposed to city admins.',
    }),
    (0, api_response_decorator_js_1.ApiSuccessResponse)(payment_response_dto_js_1.PaymentResponseDto, 200, true),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, api_role_decorator_js_1.ApiRole)(role_enum_js_1.Role.USER, role_enum_js_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get a payment (receipt) by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Payment ID' }),
    (0, api_response_decorator_js_1.ApiSuccessResponse)(payment_response_dto_js_1.PaymentResponseDto),
    (0, api_response_decorator_js_1.ApiNotFound)('Payment'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_js_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)('webhook'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiExcludeEndpoint)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Headers)('x-razorpay-signature')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "webhook", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, swagger_1.ApiTags)('Payments'),
    (0, common_1.Controller)('payments'),
    __metadata("design:paramtypes", [payments_service_js_1.PaymentsService])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map
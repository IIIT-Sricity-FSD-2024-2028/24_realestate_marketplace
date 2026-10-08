"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const payments_controller_js_1 = require("./payments.controller.js");
const payments_service_js_1 = require("./payments.service.js");
const payment_schema_js_1 = require("./schemas/payment.schema.js");
const mock_gateway_js_1 = require("./gateway/mock.gateway.js");
const payment_gateway_provider_js_1 = require("./gateway/payment-gateway.provider.js");
let PaymentsModule = class PaymentsModule {
};
exports.PaymentsModule = PaymentsModule;
exports.PaymentsModule = PaymentsModule = __decorate([
    (0, common_1.Module)({
        imports: [mongoose_1.MongooseModule.forFeature([{ name: payment_schema_js_1.Payment.name, schema: payment_schema_js_1.PaymentSchema }])],
        controllers: [payments_controller_js_1.PaymentsController],
        providers: [payments_service_js_1.PaymentsService, mock_gateway_js_1.MockPaymentGateway, payment_gateway_provider_js_1.paymentGatewayProvider],
        exports: [payments_service_js_1.PaymentsService],
    })
], PaymentsModule);
//# sourceMappingURL=payments.module.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentGatewayProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mock_gateway_js_1 = require("./mock.gateway.js");
const razorpay_gateway_js_1 = require("./razorpay.gateway.js");
const payment_gateway_interface_js_1 = require("./payment-gateway.interface.js");
exports.paymentGatewayProvider = {
    provide: payment_gateway_interface_js_1.PAYMENT_GATEWAY,
    inject: [config_1.ConfigService, mock_gateway_js_1.MockPaymentGateway],
    useFactory: (config, mock) => {
        const logger = new common_1.Logger('PaymentGateway');
        const keyId = config.get('payments.razorpay.keyId');
        const keySecret = config.get('payments.razorpay.keySecret');
        if (keyId && keySecret) {
            const gateway = new razorpay_gateway_js_1.RazorpayGateway(keyId, keySecret, config.get('payments.razorpay.webhookSecret') ?? null);
            logger.log(`Razorpay driver active (${gateway.isLive ? 'LIVE — real money' : 'test keys'})`);
            return gateway;
        }
        logger.log('Mock payment driver active — set RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET to go live');
        return mock;
    },
};
//# sourceMappingURL=payment-gateway.provider.js.map
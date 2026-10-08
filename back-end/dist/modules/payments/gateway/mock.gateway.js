"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var MockPaymentGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockPaymentGateway = void 0;
const common_1 = require("@nestjs/common");
const node_crypto_1 = require("node:crypto");
let MockPaymentGateway = MockPaymentGateway_1 = class MockPaymentGateway {
    name = 'mock';
    isLive = false;
    keyId = 'rzp_test_truestate_mock';
    logger = new common_1.Logger(MockPaymentGateway_1.name);
    orders = new Map();
    keySecret = (0, node_crypto_1.randomBytes)(32).toString('hex');
    createOrder(input) {
        const orderId = `order_${(0, node_crypto_1.randomBytes)(9).toString('base64url')}`;
        this.orders.set(orderId, { amount: input.amountInRupees, receipt: input.receipt });
        this.logger.debug(`Mock order ${orderId} opened for ₹${input.amountInRupees} (${input.notes.purpose ?? 'unknown'})`);
        return Promise.resolve({
            orderId,
            amount: input.amountInRupees,
            currency: 'INR',
            keyId: this.keyId,
            receipt: input.receipt,
        });
    }
    simulateCheckout(orderId) {
        if (!this.orders.has(orderId)) {
            throw new Error(`Unknown order "${orderId}" — it was opened before the server restarted. Start the payment again.`);
        }
        const paymentId = `pay_${(0, node_crypto_1.randomBytes)(9).toString('base64url')}`;
        return { orderId, paymentId, signature: this.sign(`${orderId}|${paymentId}`) };
    }
    verifySignature({ orderId, paymentId, signature }) {
        return this.matches(this.sign(`${orderId}|${paymentId}`), signature);
    }
    verifyWebhook(rawBody, signature) {
        return this.matches(this.sign(rawBody), signature);
    }
    sign(payload) {
        return (0, node_crypto_1.createHmac)('sha256', this.keySecret).update(payload).digest('hex');
    }
    matches(expected, received) {
        if (typeof received !== 'string' || expected.length !== received.length)
            return false;
        return (0, node_crypto_1.timingSafeEqual)(Buffer.from(expected), Buffer.from(received));
    }
};
exports.MockPaymentGateway = MockPaymentGateway;
exports.MockPaymentGateway = MockPaymentGateway = MockPaymentGateway_1 = __decorate([
    (0, common_1.Injectable)()
], MockPaymentGateway);
//# sourceMappingURL=mock.gateway.js.map
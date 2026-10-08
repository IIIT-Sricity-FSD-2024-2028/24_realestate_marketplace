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
var RazorpayGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RazorpayGateway = void 0;
const common_1 = require("@nestjs/common");
const node_crypto_1 = require("node:crypto");
const RAZORPAY_ORDERS_URL = 'https://api.razorpay.com/v1/orders';
let RazorpayGateway = RazorpayGateway_1 = class RazorpayGateway {
    keyId;
    keySecret;
    webhookSecret;
    name = 'razorpay';
    logger = new common_1.Logger(RazorpayGateway_1.name);
    constructor(keyId, keySecret, webhookSecret) {
        this.keyId = keyId;
        this.keySecret = keySecret;
        this.webhookSecret = webhookSecret;
    }
    get isLive() {
        return this.keyId.startsWith('rzp_live_');
    }
    async createOrder(input) {
        const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');
        let response;
        try {
            response = await fetch(RAZORPAY_ORDERS_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Basic ${auth}`,
                },
                body: JSON.stringify({
                    amount: input.amountInRupees * 100,
                    currency: 'INR',
                    receipt: input.receipt,
                    notes: input.notes,
                }),
            });
        }
        catch (error) {
            this.logger.error(`Razorpay unreachable: ${error.message}`);
            throw new common_1.InternalServerErrorException('Payment gateway is unreachable. Please try again.');
        }
        if (!response.ok) {
            const detail = await response.text().catch(() => '');
            this.logger.error(`Razorpay order failed (${response.status}): ${detail}`);
            throw new common_1.InternalServerErrorException('Payment gateway rejected the order. Please try again.');
        }
        const order = (await response.json());
        return {
            orderId: order.id,
            amount: Math.round(order.amount / 100),
            currency: order.currency,
            keyId: this.keyId,
            receipt: order.receipt,
        };
    }
    verifySignature({ orderId, paymentId, signature }) {
        return this.matches(this.sign(`${orderId}|${paymentId}`, this.keySecret), signature);
    }
    verifyWebhook(rawBody, signature) {
        if (!this.webhookSecret) {
            this.logger.warn('Webhook received but RAZORPAY_WEBHOOK_SECRET is unset — rejecting.');
            return false;
        }
        return this.matches(this.sign(rawBody, this.webhookSecret), signature);
    }
    sign(payload, secret) {
        return (0, node_crypto_1.createHmac)('sha256', secret).update(payload).digest('hex');
    }
    matches(expected, received) {
        if (typeof received !== 'string' || expected.length !== received.length)
            return false;
        return (0, node_crypto_1.timingSafeEqual)(Buffer.from(expected), Buffer.from(received));
    }
};
exports.RazorpayGateway = RazorpayGateway;
exports.RazorpayGateway = RazorpayGateway = RazorpayGateway_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [String, String, Object])
], RazorpayGateway);
//# sourceMappingURL=razorpay.gateway.js.map
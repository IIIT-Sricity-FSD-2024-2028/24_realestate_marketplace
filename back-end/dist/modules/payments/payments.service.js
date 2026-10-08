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
var PaymentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const node_crypto_1 = require("node:crypto");
const mongoose_2 = require("mongoose");
const payment_schema_js_1 = require("./schemas/payment.schema.js");
const payment_gateway_interface_js_1 = require("./gateway/payment-gateway.interface.js");
const billing_enum_js_1 = require("../../shared/enums/billing.enum.js");
const reference_id_helper_js_1 = require("../../shared/helpers/reference-id.helper.js");
const ist_time_helper_js_1 = require("../../shared/helpers/ist-time.helper.js");
const RECEIPT_PREFIX = {
    [billing_enum_js_1.PaymentPurpose.SUBSCRIPTION]: 'SUB',
    [billing_enum_js_1.PaymentPurpose.FEATURED_LISTING]: 'FTR',
    [billing_enum_js_1.PaymentPurpose.COMMISSION]: 'COM',
};
function isPopulated(ref) {
    return !!ref && typeof ref === 'object' && '_id' in ref;
}
let PaymentsService = PaymentsService_1 = class PaymentsService {
    paymentModel;
    gateway;
    logger = new common_1.Logger(PaymentsService_1.name);
    constructor(paymentModel, gateway) {
        this.paymentModel = paymentModel;
        this.gateway = gateway;
    }
    get gatewayName() {
        return this.gateway.name;
    }
    get isLive() {
        return this.gateway.isLive;
    }
    toResponse(p) {
        const payer = p.userId;
        return {
            id: p._id.toString(),
            userId: (0, reference_id_helper_js_1.referenceId)(payer),
            purpose: p.purpose,
            description: p.description,
            baseAmount: p.baseAmount,
            taxAmount: p.taxAmount,
            amount: p.amount,
            currency: p.currency,
            status: p.status,
            receipt: p.receipt,
            gateway: p.gateway,
            gatewayOrderId: p.gatewayOrderId,
            gatewayPaymentId: p.gatewayPaymentId ?? null,
            metadata: p.metadata ?? {},
            failureReason: p.failureReason ?? null,
            paidAt: p.paidAt ? (0, ist_time_helper_js_1.istTimestamp)(p.paidAt) : null,
            ...(isPopulated(payer) && {
                payerName: payer.name,
                payerEmail: payer.email,
            }),
            createdAt: (0, ist_time_helper_js_1.istTimestamp)(p.createdAt ?? new Date()),
            updatedAt: (0, ist_time_helper_js_1.istTimestamp)(p.updatedAt ?? new Date()),
        };
    }
    receiptFor(purpose) {
        return `TRU-${RECEIPT_PREFIX[purpose]}-${(0, node_crypto_1.randomBytes)(3).toString('hex').toUpperCase()}`;
    }
    async openOrder(input) {
        const total = input.baseAmount + input.taxAmount;
        if (total <= 0) {
            throw new common_1.BadRequestException('Nothing to pay — this item is free.');
        }
        const receipt = this.receiptFor(input.purpose);
        const order = await this.gateway.createOrder({
            amountInRupees: total,
            receipt,
            notes: {
                purpose: input.purpose,
                userId: input.userId,
                description: input.description,
            },
        });
        const payment = await this.paymentModel.create({
            userId: new mongoose_2.Types.ObjectId(input.userId),
            purpose: input.purpose,
            baseAmount: input.baseAmount,
            taxAmount: input.taxAmount,
            amount: total,
            currency: order.currency,
            status: billing_enum_js_1.PaymentStatus.CREATED,
            gateway: this.gateway.name,
            gatewayOrderId: order.orderId,
            receipt,
            description: input.description,
            metadata: input.metadata ?? {},
        });
        return {
            payment,
            checkout: {
                orderId: order.orderId,
                paymentId: payment._id.toString(),
                amount: total,
                baseAmount: input.baseAmount,
                taxAmount: input.taxAmount,
                currency: order.currency,
                keyId: order.keyId,
                gateway: this.gateway.name,
                isLive: this.gateway.isLive,
                description: input.description,
                receipt,
            },
        };
    }
    async verifyAndCapture(dto, userId) {
        const payment = await this.paymentModel.findOne({ gatewayOrderId: dto.orderId });
        if (!payment) {
            throw new common_1.NotFoundException(`No payment found for order "${dto.orderId}"`);
        }
        if ((0, reference_id_helper_js_1.referenceId)(payment.userId) !== userId) {
            throw new common_1.BadRequestException('This payment belongs to a different account');
        }
        if (payment.status === billing_enum_js_1.PaymentStatus.PAID) {
            throw new common_1.BadRequestException('This payment has already been completed');
        }
        const valid = this.gateway.verifySignature({
            orderId: dto.orderId,
            paymentId: dto.paymentId,
            signature: dto.signature,
        });
        if (!valid) {
            payment.status = billing_enum_js_1.PaymentStatus.FAILED;
            payment.failureReason = 'Signature verification failed';
            await payment.save();
            this.logger.warn(`Rejected payment ${payment.receipt}: bad signature on order ${dto.orderId}`);
            throw new common_1.BadRequestException('Payment could not be verified. You have not been charged.');
        }
        payment.status = billing_enum_js_1.PaymentStatus.PAID;
        payment.gatewayPaymentId = dto.paymentId;
        payment.gatewaySignature = dto.signature;
        payment.paidAt = new Date();
        payment.failureReason = null;
        await payment.save();
        this.logger.log(`Payment ${payment.receipt} captured — ₹${payment.amount} (${payment.purpose})`);
        return payment;
    }
    async markFailed(orderId, userId, reason) {
        const payment = await this.paymentModel.findOne({ gatewayOrderId: orderId });
        if (!payment)
            throw new common_1.NotFoundException(`No payment found for order "${orderId}"`);
        if ((0, reference_id_helper_js_1.referenceId)(payment.userId) !== userId) {
            throw new common_1.BadRequestException('This payment belongs to a different account');
        }
        if (payment.status === billing_enum_js_1.PaymentStatus.PAID) {
            throw new common_1.BadRequestException('A completed payment cannot be marked failed');
        }
        payment.status = billing_enum_js_1.PaymentStatus.FAILED;
        payment.failureReason = reason || 'Cancelled by user';
        await payment.save();
        return this.toResponse(payment);
    }
    simulateCheckout(orderId) {
        if (!this.gateway.simulateCheckout) {
            throw new common_1.BadRequestException('The demo checkout is disabled because a live payment gateway is configured.');
        }
        try {
            return this.gateway.simulateCheckout(orderId);
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    verifyWebhook(rawBody, signature) {
        return this.gateway.verifyWebhook(rawBody, signature);
    }
    async captureFromWebhook(orderId, gatewayPaymentId) {
        const payment = await this.paymentModel.findOne({ gatewayOrderId: orderId });
        if (!payment || payment.status === billing_enum_js_1.PaymentStatus.PAID)
            return null;
        payment.status = billing_enum_js_1.PaymentStatus.PAID;
        payment.gatewayPaymentId = gatewayPaymentId;
        payment.paidAt = new Date();
        await payment.save();
        this.logger.log(`Payment ${payment.receipt} captured via webhook — ₹${payment.amount}`);
        return payment;
    }
    async findByUser(userId, limit = 50) {
        const rows = await this.paymentModel.find({ userId }).sort({ createdAt: -1 }).limit(limit);
        return rows.map((p) => this.toResponse(p));
    }
    async findAll(limit = 100) {
        const rows = await this.paymentModel
            .find()
            .populate('userId', 'name email')
            .sort({ createdAt: -1 })
            .limit(limit);
        return rows.map((p) => this.toResponse(p));
    }
    async findOne(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id))
            throw new common_1.BadRequestException(`"${id}" is not a valid payment ID`);
        const payment = await this.paymentModel.findById(id).populate('userId', 'name email');
        if (!payment)
            throw new common_1.NotFoundException(`Payment with ID "${id}" not found`);
        return this.toResponse(payment);
    }
    async totalsByPurpose() {
        const rows = await this.paymentModel.aggregate([
            { $match: { status: billing_enum_js_1.PaymentStatus.PAID } },
            { $group: { _id: '$purpose', amount: { $sum: '$amount' }, count: { $sum: 1 } } },
        ]);
        return Object.fromEntries(rows.map((r) => [r._id, { amount: r.amount, count: r.count }]));
    }
    async monthlyTotals(months = 6) {
        const since = new Date();
        since.setMonth(since.getMonth() - (months - 1));
        since.setDate(1);
        since.setHours(0, 0, 0, 0);
        const rows = await this.paymentModel.aggregate([
            { $match: { status: billing_enum_js_1.PaymentStatus.PAID, paidAt: { $gte: since } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m', date: '$paidAt', timezone: 'Asia/Kolkata' } },
                    amount: { $sum: '$amount' },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);
        const byMonth = new Map(rows.map((r) => [r._id, r]));
        const series = [];
        for (let i = 0; i < months; i += 1) {
            const d = new Date(since);
            d.setMonth(since.getMonth() + i);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const hit = byMonth.get(key);
            series.push({ month: key, amount: hit?.amount ?? 0, count: hit?.count ?? 0 });
        }
        return series;
    }
    async statusCounts() {
        const rows = await this.paymentModel.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } },
        ]);
        return Object.fromEntries(rows.map((r) => [r._id, r.count]));
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = PaymentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(payment_schema_js_1.Payment.name)),
    __param(1, (0, common_1.Inject)(payment_gateway_interface_js_1.PAYMENT_GATEWAY)),
    __metadata("design:paramtypes", [mongoose_2.Model, Object])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map
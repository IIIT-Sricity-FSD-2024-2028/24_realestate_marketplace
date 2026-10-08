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
exports.CommissionSchema = exports.Commission = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const billing_enum_js_1 = require("../../../shared/enums/billing.enum.js");
let Commission = class Commission {
    purchaseId;
    propertyId;
    partyId;
    side;
    dealValue;
    rateBps;
    baseAmount;
    taxAmount;
    amount;
    status;
    paymentId;
    settledAt;
    waiverReason;
    city;
    createdAt;
    updatedAt;
};
exports.Commission = Commission;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Purchase', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Commission.prototype, "purchaseId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Property', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Commission.prototype, "propertyId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Commission.prototype, "partyId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: billing_enum_js_1.CommissionSide, required: true, index: true }),
    __metadata("design:type", String)
], Commission.prototype, "side", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], Commission.prototype, "dealValue", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], Commission.prototype, "rateBps", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], Commission.prototype, "baseAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], Commission.prototype, "taxAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], Commission.prototype, "amount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: billing_enum_js_1.CommissionStatus, default: billing_enum_js_1.CommissionStatus.ACCRUED, index: true }),
    __metadata("design:type", String)
], Commission.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Payment', default: null }),
    __metadata("design:type", Object)
], Commission.prototype, "paymentId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null }),
    __metadata("design:type", Object)
], Commission.prototype, "settledAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: null }),
    __metadata("design:type", Object)
], Commission.prototype, "waiverReason", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: null, index: true }),
    __metadata("design:type", Object)
], Commission.prototype, "city", void 0);
exports.Commission = Commission = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'commissions' })
], Commission);
exports.CommissionSchema = mongoose_1.SchemaFactory.createForClass(Commission);
exports.CommissionSchema.index({ purchaseId: 1, side: 1 }, { unique: true });
exports.CommissionSchema.index({ partyId: 1, status: 1 });
//# sourceMappingURL=commission.schema.js.map
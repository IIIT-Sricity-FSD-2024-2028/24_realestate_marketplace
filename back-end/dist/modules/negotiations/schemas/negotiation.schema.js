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
exports.NegotiationSchema = exports.Negotiation = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const negotiation_enum_js_1 = require("../../../shared/enums/negotiation.enum.js");
let Negotiation = class Negotiation {
    propertyId;
    buyerId;
    offerAmount;
    counterAmount;
    message;
    paymentMode;
    status;
    rejectionReason;
    createdAt;
    updatedAt;
};
exports.Negotiation = Negotiation;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Property', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Negotiation.prototype, "propertyId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Negotiation.prototype, "buyerId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 1 }),
    __metadata("design:type", Number)
], Negotiation.prototype, "offerAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: null }),
    __metadata("design:type", Object)
], Negotiation.prototype, "counterAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: null }),
    __metadata("design:type", Object)
], Negotiation.prototype, "message", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: null }),
    __metadata("design:type", Object)
], Negotiation.prototype, "paymentMode", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: negotiation_enum_js_1.NegotiationStatus, default: negotiation_enum_js_1.NegotiationStatus.PENDING, index: true }),
    __metadata("design:type", String)
], Negotiation.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: null }),
    __metadata("design:type", Object)
], Negotiation.prototype, "rejectionReason", void 0);
exports.Negotiation = Negotiation = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'negotiations' })
], Negotiation);
exports.NegotiationSchema = mongoose_1.SchemaFactory.createForClass(Negotiation);
exports.NegotiationSchema.index({ buyerId: 1, status: 1 });
//# sourceMappingURL=negotiation.schema.js.map
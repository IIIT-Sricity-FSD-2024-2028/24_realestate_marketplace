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
exports.PurchaseSchema = exports.Purchase = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const purchase_enum_js_1 = require("../../../shared/enums/purchase.enum.js");
let Purchase = class Purchase {
    propertyId;
    buyerId;
    negotiationId;
    agreedPrice;
    dealStep;
    dealStatus;
    createdAt;
    updatedAt;
};
exports.Purchase = Purchase;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Property', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Purchase.prototype, "propertyId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Purchase.prototype, "buyerId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Negotiation', default: null }),
    __metadata("design:type", Object)
], Purchase.prototype, "negotiationId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 1 }),
    __metadata("design:type", Number)
], Purchase.prototype, "agreedPrice", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 1, max: 5, default: 1 }),
    __metadata("design:type", Number)
], Purchase.prototype, "dealStep", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: purchase_enum_js_1.DealStatus, default: purchase_enum_js_1.DealStatus.IN_PROGRESS, index: true }),
    __metadata("design:type", String)
], Purchase.prototype, "dealStatus", void 0);
exports.Purchase = Purchase = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'purchases' })
], Purchase);
exports.PurchaseSchema = mongoose_1.SchemaFactory.createForClass(Purchase);
exports.PurchaseSchema.index({ buyerId: 1, dealStatus: 1 });
//# sourceMappingURL=purchase.schema.js.map
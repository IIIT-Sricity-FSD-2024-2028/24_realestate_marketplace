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
exports.VisitSchema = exports.Visit = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const visit_enum_js_1 = require("../../../shared/enums/visit.enum.js");
let Visit = class Visit {
    propertyId;
    buyerId;
    requestedDate;
    requestedSlot;
    message;
    status;
    cancelReason;
    createdAt;
    updatedAt;
};
exports.Visit = Visit;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Property', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Visit.prototype, "propertyId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Visit.prototype, "buyerId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Visit.prototype, "requestedDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Visit.prototype, "requestedSlot", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: null }),
    __metadata("design:type", Object)
], Visit.prototype, "message", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: visit_enum_js_1.VisitStatus, default: visit_enum_js_1.VisitStatus.PENDING, index: true }),
    __metadata("design:type", String)
], Visit.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: null }),
    __metadata("design:type", Object)
], Visit.prototype, "cancelReason", void 0);
exports.Visit = Visit = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'visits' })
], Visit);
exports.VisitSchema = mongoose_1.SchemaFactory.createForClass(Visit);
exports.VisitSchema.index({ buyerId: 1, status: 1 });
//# sourceMappingURL=visit.schema.js.map
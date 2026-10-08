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
exports.PropertySchema = exports.Property = exports.PropertyDocumentFileSchema = exports.PropertyDocumentFile = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const property_enum_js_1 = require("../../../shared/enums/property.enum.js");
const billing_enum_js_1 = require("../../../shared/enums/billing.enum.js");
let PropertyDocumentFile = class PropertyDocumentFile {
    url;
    originalName;
    uploadedAt;
};
exports.PropertyDocumentFile = PropertyDocumentFile;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], PropertyDocumentFile.prototype, "url", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], PropertyDocumentFile.prototype, "originalName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: Date.now }),
    __metadata("design:type", Date)
], PropertyDocumentFile.prototype, "uploadedAt", void 0);
exports.PropertyDocumentFile = PropertyDocumentFile = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], PropertyDocumentFile);
exports.PropertyDocumentFileSchema = mongoose_1.SchemaFactory.createForClass(PropertyDocumentFile);
let Property = class Property {
    title;
    description;
    type;
    listingType;
    price;
    areaSqft;
    bedrooms;
    bathrooms;
    address;
    city;
    state;
    status;
    images;
    adminId;
    sellerId;
    verificationStatus;
    rejectionReason;
    featuredUntil;
    featuredTier;
    featuredRank;
    documents;
    createdAt;
    updatedAt;
};
exports.Property = Property;
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true, minlength: 10, maxlength: 150 }),
    __metadata("design:type", String)
], Property.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true, minlength: 20 }),
    __metadata("design:type", String)
], Property.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: property_enum_js_1.PropertyType, required: true, index: true }),
    __metadata("design:type", String)
], Property.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: property_enum_js_1.ListingType, required: true, index: true }),
    __metadata("design:type", String)
], Property.prototype, "listingType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 1, index: true }),
    __metadata("design:type", Number)
], Property.prototype, "price", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 1 }),
    __metadata("design:type", Number)
], Property.prototype, "areaSqft", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0, max: 20 }),
    __metadata("design:type", Number)
], Property.prototype, "bedrooms", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 1, max: 20 }),
    __metadata("design:type", Number)
], Property.prototype, "bathrooms", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], Property.prototype, "address", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true, index: true }),
    __metadata("design:type", String)
], Property.prototype, "city", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true, index: true }),
    __metadata("design:type", String)
], Property.prototype, "state", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: property_enum_js_1.PropertyStatus, default: property_enum_js_1.PropertyStatus.AVAILABLE, index: true }),
    __metadata("design:type", String)
], Property.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Property.prototype, "images", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', default: null, index: true }),
    __metadata("design:type", Object)
], Property.prototype, "adminId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', default: null, index: true }),
    __metadata("design:type", Object)
], Property.prototype, "sellerId", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: property_enum_js_1.PropertyVerificationStatus,
        default: property_enum_js_1.PropertyVerificationStatus.VERIFIED,
        index: true,
    }),
    __metadata("design:type", String)
], Property.prototype, "verificationStatus", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: null }),
    __metadata("design:type", Object)
], Property.prototype, "rejectionReason", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null, index: true }),
    __metadata("design:type", Object)
], Property.prototype, "featuredUntil", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: billing_enum_js_1.FeaturedTier, default: null }),
    __metadata("design:type", Object)
], Property.prototype, "featuredTier", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], Property.prototype, "featuredRank", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [exports.PropertyDocumentFileSchema], default: [] }),
    __metadata("design:type", Array)
], Property.prototype, "documents", void 0);
exports.Property = Property = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'properties' })
], Property);
exports.PropertySchema = mongoose_1.SchemaFactory.createForClass(Property);
exports.PropertySchema.index({ city: 1, state: 1, type: 1, status: 1, price: 1 });
exports.PropertySchema.index({ featuredUntil: -1, featuredRank: -1, createdAt: -1 });
//# sourceMappingURL=property.schema.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertyVerificationStatus = exports.ListingType = exports.PropertyStatus = exports.PropertyType = void 0;
var PropertyType;
(function (PropertyType) {
    PropertyType["APARTMENT"] = "apartment";
    PropertyType["VILLA"] = "villa";
    PropertyType["PLOT"] = "plot";
    PropertyType["COMMERCIAL"] = "commercial";
    PropertyType["PENTHOUSE"] = "penthouse";
})(PropertyType || (exports.PropertyType = PropertyType = {}));
var PropertyStatus;
(function (PropertyStatus) {
    PropertyStatus["AVAILABLE"] = "available";
    PropertyStatus["SOLD"] = "sold";
    PropertyStatus["RENTED"] = "rented";
    PropertyStatus["UNDER_OFFER"] = "under_offer";
})(PropertyStatus || (exports.PropertyStatus = PropertyStatus = {}));
var ListingType;
(function (ListingType) {
    ListingType["SALE"] = "sale";
    ListingType["RENT"] = "rent";
})(ListingType || (exports.ListingType = ListingType = {}));
var PropertyVerificationStatus;
(function (PropertyVerificationStatus) {
    PropertyVerificationStatus["PENDING"] = "pending";
    PropertyVerificationStatus["VERIFIED"] = "verified";
    PropertyVerificationStatus["REJECTED"] = "rejected";
})(PropertyVerificationStatus || (exports.PropertyVerificationStatus = PropertyVerificationStatus = {}));
//# sourceMappingURL=property.enum.js.map
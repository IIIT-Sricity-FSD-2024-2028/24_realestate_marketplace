"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommissionStatus = exports.CommissionSide = exports.PaymentStatus = exports.PaymentPurpose = exports.FeaturedTier = exports.SubscriptionStatus = exports.PlanTier = void 0;
var PlanTier;
(function (PlanTier) {
    PlanTier["FREE"] = "free";
    PlanTier["SILVER"] = "silver";
    PlanTier["GOLD"] = "gold";
})(PlanTier || (exports.PlanTier = PlanTier = {}));
var SubscriptionStatus;
(function (SubscriptionStatus) {
    SubscriptionStatus["ACTIVE"] = "active";
    SubscriptionStatus["EXPIRED"] = "expired";
    SubscriptionStatus["CANCELLED"] = "cancelled";
})(SubscriptionStatus || (exports.SubscriptionStatus = SubscriptionStatus = {}));
var FeaturedTier;
(function (FeaturedTier) {
    FeaturedTier["SPOTLIGHT"] = "spotlight";
    FeaturedTier["PREMIUM"] = "premium";
})(FeaturedTier || (exports.FeaturedTier = FeaturedTier = {}));
var PaymentPurpose;
(function (PaymentPurpose) {
    PaymentPurpose["SUBSCRIPTION"] = "subscription";
    PaymentPurpose["FEATURED_LISTING"] = "featured_listing";
    PaymentPurpose["COMMISSION"] = "commission";
})(PaymentPurpose || (exports.PaymentPurpose = PaymentPurpose = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["CREATED"] = "created";
    PaymentStatus["PAID"] = "paid";
    PaymentStatus["FAILED"] = "failed";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var CommissionSide;
(function (CommissionSide) {
    CommissionSide["BUYER"] = "buyer";
    CommissionSide["SELLER"] = "seller";
})(CommissionSide || (exports.CommissionSide = CommissionSide = {}));
var CommissionStatus;
(function (CommissionStatus) {
    CommissionStatus["ACCRUED"] = "accrued";
    CommissionStatus["PAID"] = "paid";
    CommissionStatus["WAIVED"] = "waived";
})(CommissionStatus || (exports.CommissionStatus = CommissionStatus = {}));
//# sourceMappingURL=billing.enum.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEAL_STEPS = exports.DealStatus = void 0;
var DealStatus;
(function (DealStatus) {
    DealStatus["IN_PROGRESS"] = "in_progress";
    DealStatus["COMPLETED"] = "completed";
    DealStatus["CANCELLED"] = "cancelled";
})(DealStatus || (exports.DealStatus = DealStatus = {}));
exports.DEAL_STEPS = [
    'Offer Accepted',
    'Document Verification',
    'Token Payment',
    'Full Payment',
    'Registration',
];
//# sourceMappingURL=purchase.enum.js.map
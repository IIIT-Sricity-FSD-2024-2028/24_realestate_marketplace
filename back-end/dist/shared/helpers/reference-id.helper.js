"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.referenceId = referenceId;
const mongoose_1 = require("mongoose");
function referenceId(value) {
    if (value === null || value === undefined)
        return null;
    if (typeof value === 'string')
        return value;
    if (value instanceof mongoose_1.Types.ObjectId)
        return value.toString();
    if (typeof value === 'object' && '_id' in value) {
        return referenceId(value._id);
    }
    return null;
}
//# sourceMappingURL=reference-id.helper.js.map
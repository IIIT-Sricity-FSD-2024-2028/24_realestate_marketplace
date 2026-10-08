"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.backfillObjectIdStrings = backfillObjectIdStrings;
const mongoose_1 = require("mongoose");
async function backfillObjectIdStrings(model, fields, logger) {
    try {
        const query = { $or: fields.map((f) => ({ [f]: { $type: 'string' } })) };
        const docs = await model.find(query).select(fields.join(' ')).lean();
        if (docs.length === 0)
            return;
        const ops = docs.map((doc) => {
            const set = {};
            for (const field of fields) {
                const value = doc[field];
                if (typeof value === 'string' && mongoose_1.Types.ObjectId.isValid(value)) {
                    set[field] = new mongoose_1.Types.ObjectId(value);
                }
            }
            return {
                updateOne: {
                    filter: { _id: doc._id },
                    update: { $set: set },
                },
            };
        });
        await model.bulkWrite(ops);
        logger.log(`Backfilled ${ops.length} document(s) with string-stored ObjectId fields (${fields.join(', ')}).`);
    }
    catch (error) {
        logger.warn(`Failed to backfill ObjectId-string fields (${fields.join(', ')}): ${error.message}`);
    }
}
//# sourceMappingURL=objectid-backfill.helper.js.map
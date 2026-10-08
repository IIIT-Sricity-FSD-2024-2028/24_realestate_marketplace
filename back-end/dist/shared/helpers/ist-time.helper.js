"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IST_TIME_ZONE = exports.IST_OFFSET_MINUTES = void 0;
exports.istTimestamp = istTimestamp;
exports.istDateStamp = istDateStamp;
exports.istDisplay = istDisplay;
exports.IST_OFFSET_MINUTES = 330;
exports.IST_TIME_ZONE = 'Asia/Kolkata';
const IST_OFFSET_SUFFIX = '+05:30';
function shiftToIst(date) {
    return new Date(date.getTime() + exports.IST_OFFSET_MINUTES * 60_000);
}
const pad = (value, width = 2) => String(value).padStart(width, '0');
function istTimestamp(date = new Date()) {
    const ist = shiftToIst(date);
    return (`${ist.getUTCFullYear()}-${pad(ist.getUTCMonth() + 1)}-${pad(ist.getUTCDate())}` +
        `T${pad(ist.getUTCHours())}:${pad(ist.getUTCMinutes())}:${pad(ist.getUTCSeconds())}` +
        `.${pad(ist.getUTCMilliseconds(), 3)}${IST_OFFSET_SUFFIX}`);
}
function istDateStamp(date = new Date()) {
    const ist = shiftToIst(date);
    return `${ist.getUTCFullYear()}-${pad(ist.getUTCMonth() + 1)}-${pad(ist.getUTCDate())}`;
}
function istDisplay(date = new Date()) {
    return date.toLocaleString('en-IN', {
        timeZone: exports.IST_TIME_ZONE,
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    });
}
//# sourceMappingURL=ist-time.helper.js.map
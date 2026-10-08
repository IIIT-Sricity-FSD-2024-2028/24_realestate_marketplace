"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LOG_CHANNELS = void 0;
exports.isLogChannel = isLogChannel;
exports.LOG_CHANNELS = ['http', 'error', 'app', 'audit'];
function isLogChannel(value) {
    return exports.LOG_CHANNELS.includes(value);
}
//# sourceMappingURL=log-channels.js.map
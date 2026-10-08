"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorResponse = exports.successResponse = void 0;
const successResponse = (data, message = 'Success') => ({
    success: true,
    data,
    message,
});
exports.successResponse = successResponse;
const errorResponse = (message = 'Something went wrong') => ({
    success: false,
    data: null,
    message,
});
exports.errorResponse = errorResponse;
//# sourceMappingURL=response.helper.js.map
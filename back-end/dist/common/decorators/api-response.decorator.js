"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiSuccessResponse = ApiSuccessResponse;
exports.ApiNotFound = ApiNotFound;
exports.ApiValidationError = ApiValidationError;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
function ApiSuccessResponse(model, statusCode = 200, isArray = false) {
    const dataSchema = isArray
        ? { type: 'array', items: { $ref: (0, swagger_1.getSchemaPath)(model) } }
        : { $ref: (0, swagger_1.getSchemaPath)(model) };
    const schema = {
        properties: {
            success: { type: 'boolean', example: true },
            statusCode: { type: 'number', example: statusCode },
            message: { type: 'string', example: 'Request successful' },
            data: dataSchema,
        },
    };
    const decorator = statusCode === 201
        ? (0, swagger_1.ApiCreatedResponse)({ schema })
        : (0, swagger_1.ApiOkResponse)({ schema });
    return (0, common_1.applyDecorators)(decorator);
}
function ApiNotFound(resource = 'Resource') {
    return (0, swagger_1.ApiNotFoundResponse)({
        schema: {
            properties: {
                success: { type: 'boolean', example: false },
                statusCode: { type: 'number', example: 404 },
                message: { type: 'string', example: `${resource} not found` },
                timestamp: { type: 'string', example: '2025-01-01T05:30:00.000+05:30' },
                path: { type: 'string', example: '/api/v1/resource/123' },
            },
        },
    });
}
function ApiValidationError() {
    return (0, swagger_1.ApiUnprocessableEntityResponse)({
        schema: {
            properties: {
                success: { type: 'boolean', example: false },
                statusCode: { type: 'number', example: 400 },
                message: { type: 'string', example: 'Validation failed' },
                errors: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['email must be an email', 'price must be a positive number'],
                },
            },
        },
    });
}
//# sourceMappingURL=api-response.decorator.js.map
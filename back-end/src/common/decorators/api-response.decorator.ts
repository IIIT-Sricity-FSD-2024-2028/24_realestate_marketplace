import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiUnprocessableEntityResponse,
  getSchemaPath,
} from '@nestjs/swagger';

/** Wraps a DTO type in the standard success envelope for Swagger docs */
export function ApiSuccessResponse<TModel extends Type>(
  model: TModel,
  statusCode: 200 | 201 = 200,
  isArray = false,
) {
  const dataSchema = isArray
    ? { type: 'array', items: { $ref: getSchemaPath(model) } }
    : { $ref: getSchemaPath(model) };

  const schema = {
    properties: {
      success: { type: 'boolean', example: true },
      statusCode: { type: 'number', example: statusCode },
      message: { type: 'string', example: 'Request successful' },
      data: dataSchema,
    },
  };

  const decorator =
    statusCode === 201
      ? ApiCreatedResponse({ schema })
      : ApiOkResponse({ schema });

  return applyDecorators(decorator);
}

/** Adds standard 404 Not Found response to Swagger docs */
export function ApiNotFound(resource = 'Resource') {
  return ApiNotFoundResponse({
    schema: {
      properties: {
        success: { type: 'boolean', example: false },
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: `${resource} not found` },
        timestamp: { type: 'string', example: '2025-01-01T00:00:00.000Z' },
        path: { type: 'string', example: '/api/v1/resource/123' },
      },
    },
  });
}

/** Adds standard 422 Unprocessable Entity response to Swagger docs */
export function ApiValidationError() {
  return ApiUnprocessableEntityResponse({
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

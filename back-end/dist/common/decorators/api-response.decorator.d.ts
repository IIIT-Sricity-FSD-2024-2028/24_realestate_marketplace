import { Type } from '@nestjs/common';
export declare function ApiSuccessResponse<TModel extends Type>(model: TModel, statusCode?: 200 | 201, isArray?: boolean): <TFunction extends Function, Y>(target: TFunction | object, propertyKey?: string | symbol, descriptor?: TypedPropertyDescriptor<Y>) => void;
export declare function ApiNotFound(resource?: string): MethodDecorator & ClassDecorator;
export declare function ApiValidationError(): MethodDecorator & ClassDecorator;

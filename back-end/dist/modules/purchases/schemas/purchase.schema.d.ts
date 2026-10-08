import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { DealStatus } from '../../../shared/enums/purchase.enum.js';
export type PurchaseDocument = HydratedDocument<Purchase>;
export declare class Purchase {
    propertyId: Types.ObjectId;
    buyerId: Types.ObjectId;
    negotiationId: Types.ObjectId | null;
    agreedPrice: number;
    dealStep: number;
    dealStatus: DealStatus;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare const PurchaseSchema: MongooseSchema<Purchase, import("mongoose").Model<Purchase, any, any, any, any, any, Purchase>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Purchase, import("mongoose").Document<unknown, {}, Purchase, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Purchase & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    propertyId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Purchase, import("mongoose").Document<unknown, {}, Purchase, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Purchase & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    buyerId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Purchase, import("mongoose").Document<unknown, {}, Purchase, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Purchase & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    negotiationId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId | null, Purchase, import("mongoose").Document<unknown, {}, Purchase, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Purchase & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    agreedPrice?: import("mongoose").SchemaDefinitionProperty<number, Purchase, import("mongoose").Document<unknown, {}, Purchase, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Purchase & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    dealStep?: import("mongoose").SchemaDefinitionProperty<number, Purchase, import("mongoose").Document<unknown, {}, Purchase, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Purchase & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    dealStatus?: import("mongoose").SchemaDefinitionProperty<DealStatus, Purchase, import("mongoose").Document<unknown, {}, Purchase, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Purchase & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    createdAt?: import("mongoose").SchemaDefinitionProperty<Date | undefined, Purchase, import("mongoose").Document<unknown, {}, Purchase, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Purchase & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    updatedAt?: import("mongoose").SchemaDefinitionProperty<Date | undefined, Purchase, import("mongoose").Document<unknown, {}, Purchase, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Purchase & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, Purchase>;

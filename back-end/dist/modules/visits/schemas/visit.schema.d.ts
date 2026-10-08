import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { VisitStatus } from '../../../shared/enums/visit.enum.js';
export type VisitDocument = HydratedDocument<Visit>;
export declare class Visit {
    propertyId: Types.ObjectId;
    buyerId: Types.ObjectId;
    requestedDate: string;
    requestedSlot: string;
    message: string | null;
    status: VisitStatus;
    cancelReason: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare const VisitSchema: MongooseSchema<Visit, import("mongoose").Model<Visit, any, any, any, any, any, Visit>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Visit, import("mongoose").Document<unknown, {}, Visit, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Visit & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    propertyId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Visit, import("mongoose").Document<unknown, {}, Visit, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Visit & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    buyerId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Visit, import("mongoose").Document<unknown, {}, Visit, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Visit & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    requestedDate?: import("mongoose").SchemaDefinitionProperty<string, Visit, import("mongoose").Document<unknown, {}, Visit, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Visit & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    requestedSlot?: import("mongoose").SchemaDefinitionProperty<string, Visit, import("mongoose").Document<unknown, {}, Visit, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Visit & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    message?: import("mongoose").SchemaDefinitionProperty<string | null, Visit, import("mongoose").Document<unknown, {}, Visit, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Visit & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<VisitStatus, Visit, import("mongoose").Document<unknown, {}, Visit, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Visit & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    cancelReason?: import("mongoose").SchemaDefinitionProperty<string | null, Visit, import("mongoose").Document<unknown, {}, Visit, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Visit & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    createdAt?: import("mongoose").SchemaDefinitionProperty<Date | undefined, Visit, import("mongoose").Document<unknown, {}, Visit, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Visit & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    updatedAt?: import("mongoose").SchemaDefinitionProperty<Date | undefined, Visit, import("mongoose").Document<unknown, {}, Visit, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Visit & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, Visit>;

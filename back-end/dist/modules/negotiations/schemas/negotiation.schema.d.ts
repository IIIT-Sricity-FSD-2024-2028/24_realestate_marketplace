import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { NegotiationStatus } from '../../../shared/enums/negotiation.enum.js';
export type NegotiationDocument = HydratedDocument<Negotiation>;
export declare class Negotiation {
    propertyId: Types.ObjectId;
    buyerId: Types.ObjectId;
    offerAmount: number;
    counterAmount: number | null;
    message: string | null;
    paymentMode: string | null;
    status: NegotiationStatus;
    rejectionReason: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare const NegotiationSchema: MongooseSchema<Negotiation, import("mongoose").Model<Negotiation, any, any, any, any, any, Negotiation>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Negotiation, import("mongoose").Document<unknown, {}, Negotiation, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Negotiation & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    propertyId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Negotiation, import("mongoose").Document<unknown, {}, Negotiation, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Negotiation & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    buyerId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Negotiation, import("mongoose").Document<unknown, {}, Negotiation, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Negotiation & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    offerAmount?: import("mongoose").SchemaDefinitionProperty<number, Negotiation, import("mongoose").Document<unknown, {}, Negotiation, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Negotiation & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    counterAmount?: import("mongoose").SchemaDefinitionProperty<number | null, Negotiation, import("mongoose").Document<unknown, {}, Negotiation, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Negotiation & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    message?: import("mongoose").SchemaDefinitionProperty<string | null, Negotiation, import("mongoose").Document<unknown, {}, Negotiation, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Negotiation & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    paymentMode?: import("mongoose").SchemaDefinitionProperty<string | null, Negotiation, import("mongoose").Document<unknown, {}, Negotiation, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Negotiation & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<NegotiationStatus, Negotiation, import("mongoose").Document<unknown, {}, Negotiation, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Negotiation & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    rejectionReason?: import("mongoose").SchemaDefinitionProperty<string | null, Negotiation, import("mongoose").Document<unknown, {}, Negotiation, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Negotiation & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    createdAt?: import("mongoose").SchemaDefinitionProperty<Date | undefined, Negotiation, import("mongoose").Document<unknown, {}, Negotiation, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Negotiation & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    updatedAt?: import("mongoose").SchemaDefinitionProperty<Date | undefined, Negotiation, import("mongoose").Document<unknown, {}, Negotiation, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Negotiation & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, Negotiation>;

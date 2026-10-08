import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { CommissionSide, CommissionStatus } from '../../../shared/enums/billing.enum.js';
export type CommissionDocument = HydratedDocument<Commission>;
export declare class Commission {
    purchaseId: Types.ObjectId;
    propertyId: Types.ObjectId;
    partyId: Types.ObjectId;
    side: CommissionSide;
    dealValue: number;
    rateBps: number;
    baseAmount: number;
    taxAmount: number;
    amount: number;
    status: CommissionStatus;
    paymentId: Types.ObjectId | null;
    settledAt: Date | null;
    waiverReason: string | null;
    city: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare const CommissionSchema: MongooseSchema<Commission, import("mongoose").Model<Commission, any, any, any, any, any, Commission>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Commission, import("mongoose").Document<unknown, {}, Commission, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Commission & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    purchaseId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Commission, import("mongoose").Document<unknown, {}, Commission, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Commission & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    propertyId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Commission, import("mongoose").Document<unknown, {}, Commission, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Commission & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    partyId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Commission, import("mongoose").Document<unknown, {}, Commission, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Commission & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    side?: import("mongoose").SchemaDefinitionProperty<CommissionSide, Commission, import("mongoose").Document<unknown, {}, Commission, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Commission & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    dealValue?: import("mongoose").SchemaDefinitionProperty<number, Commission, import("mongoose").Document<unknown, {}, Commission, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Commission & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    rateBps?: import("mongoose").SchemaDefinitionProperty<number, Commission, import("mongoose").Document<unknown, {}, Commission, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Commission & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    baseAmount?: import("mongoose").SchemaDefinitionProperty<number, Commission, import("mongoose").Document<unknown, {}, Commission, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Commission & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    taxAmount?: import("mongoose").SchemaDefinitionProperty<number, Commission, import("mongoose").Document<unknown, {}, Commission, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Commission & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    amount?: import("mongoose").SchemaDefinitionProperty<number, Commission, import("mongoose").Document<unknown, {}, Commission, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Commission & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<CommissionStatus, Commission, import("mongoose").Document<unknown, {}, Commission, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Commission & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    paymentId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId | null, Commission, import("mongoose").Document<unknown, {}, Commission, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Commission & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    settledAt?: import("mongoose").SchemaDefinitionProperty<Date | null, Commission, import("mongoose").Document<unknown, {}, Commission, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Commission & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    waiverReason?: import("mongoose").SchemaDefinitionProperty<string | null, Commission, import("mongoose").Document<unknown, {}, Commission, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Commission & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    city?: import("mongoose").SchemaDefinitionProperty<string | null, Commission, import("mongoose").Document<unknown, {}, Commission, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Commission & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    createdAt?: import("mongoose").SchemaDefinitionProperty<Date | undefined, Commission, import("mongoose").Document<unknown, {}, Commission, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Commission & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    updatedAt?: import("mongoose").SchemaDefinitionProperty<Date | undefined, Commission, import("mongoose").Document<unknown, {}, Commission, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Commission & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, Commission>;

import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { PropertyType, PropertyStatus, ListingType, PropertyVerificationStatus } from '../../../shared/enums/property.enum.js';
import { FeaturedTier } from '../../../shared/enums/billing.enum.js';
export type PropertyDocument = HydratedDocument<Property>;
export declare class PropertyDocumentFile {
    url: string;
    originalName: string;
    uploadedAt: Date;
}
export declare const PropertyDocumentFileSchema: MongooseSchema<PropertyDocumentFile, import("mongoose").Model<PropertyDocumentFile, any, any, any, any, any, PropertyDocumentFile>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, PropertyDocumentFile, import("mongoose").Document<unknown, {}, PropertyDocumentFile, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<PropertyDocumentFile & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    url?: import("mongoose").SchemaDefinitionProperty<string, PropertyDocumentFile, import("mongoose").Document<unknown, {}, PropertyDocumentFile, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PropertyDocumentFile & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    originalName?: import("mongoose").SchemaDefinitionProperty<string, PropertyDocumentFile, import("mongoose").Document<unknown, {}, PropertyDocumentFile, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PropertyDocumentFile & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    uploadedAt?: import("mongoose").SchemaDefinitionProperty<Date, PropertyDocumentFile, import("mongoose").Document<unknown, {}, PropertyDocumentFile, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PropertyDocumentFile & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, PropertyDocumentFile>;
export declare class Property {
    title: string;
    description: string;
    type: PropertyType;
    listingType: ListingType;
    price: number;
    areaSqft: number;
    bedrooms: number;
    bathrooms: number;
    address: string;
    city: string;
    state: string;
    status: PropertyStatus;
    images: string[];
    adminId: Types.ObjectId | null;
    sellerId: Types.ObjectId | null;
    verificationStatus: PropertyVerificationStatus;
    rejectionReason: string | null;
    featuredUntil: Date | null;
    featuredTier: FeaturedTier | null;
    featuredRank: number;
    documents: PropertyDocumentFile[];
    createdAt?: Date;
    updatedAt?: Date;
}
export declare const PropertySchema: MongooseSchema<Property, import("mongoose").Model<Property, any, any, any, any, any, Property>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Property, import("mongoose").Document<unknown, {}, Property, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Property & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    title?: import("mongoose").SchemaDefinitionProperty<string, Property, import("mongoose").Document<unknown, {}, Property, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Property & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    description?: import("mongoose").SchemaDefinitionProperty<string, Property, import("mongoose").Document<unknown, {}, Property, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Property & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    type?: import("mongoose").SchemaDefinitionProperty<PropertyType, Property, import("mongoose").Document<unknown, {}, Property, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Property & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    listingType?: import("mongoose").SchemaDefinitionProperty<ListingType, Property, import("mongoose").Document<unknown, {}, Property, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Property & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    price?: import("mongoose").SchemaDefinitionProperty<number, Property, import("mongoose").Document<unknown, {}, Property, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Property & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    areaSqft?: import("mongoose").SchemaDefinitionProperty<number, Property, import("mongoose").Document<unknown, {}, Property, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Property & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    bedrooms?: import("mongoose").SchemaDefinitionProperty<number, Property, import("mongoose").Document<unknown, {}, Property, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Property & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    bathrooms?: import("mongoose").SchemaDefinitionProperty<number, Property, import("mongoose").Document<unknown, {}, Property, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Property & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    address?: import("mongoose").SchemaDefinitionProperty<string, Property, import("mongoose").Document<unknown, {}, Property, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Property & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    city?: import("mongoose").SchemaDefinitionProperty<string, Property, import("mongoose").Document<unknown, {}, Property, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Property & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    state?: import("mongoose").SchemaDefinitionProperty<string, Property, import("mongoose").Document<unknown, {}, Property, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Property & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<PropertyStatus, Property, import("mongoose").Document<unknown, {}, Property, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Property & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    images?: import("mongoose").SchemaDefinitionProperty<string[], Property, import("mongoose").Document<unknown, {}, Property, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Property & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    adminId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId | null, Property, import("mongoose").Document<unknown, {}, Property, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Property & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    sellerId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId | null, Property, import("mongoose").Document<unknown, {}, Property, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Property & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    verificationStatus?: import("mongoose").SchemaDefinitionProperty<PropertyVerificationStatus, Property, import("mongoose").Document<unknown, {}, Property, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Property & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    rejectionReason?: import("mongoose").SchemaDefinitionProperty<string | null, Property, import("mongoose").Document<unknown, {}, Property, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Property & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    featuredUntil?: import("mongoose").SchemaDefinitionProperty<Date | null, Property, import("mongoose").Document<unknown, {}, Property, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Property & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    featuredTier?: import("mongoose").SchemaDefinitionProperty<FeaturedTier | null, Property, import("mongoose").Document<unknown, {}, Property, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Property & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    featuredRank?: import("mongoose").SchemaDefinitionProperty<number, Property, import("mongoose").Document<unknown, {}, Property, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Property & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    documents?: import("mongoose").SchemaDefinitionProperty<PropertyDocumentFile[], Property, import("mongoose").Document<unknown, {}, Property, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Property & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    createdAt?: import("mongoose").SchemaDefinitionProperty<Date | undefined, Property, import("mongoose").Document<unknown, {}, Property, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Property & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    updatedAt?: import("mongoose").SchemaDefinitionProperty<Date | undefined, Property, import("mongoose").Document<unknown, {}, Property, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Property & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, Property>;

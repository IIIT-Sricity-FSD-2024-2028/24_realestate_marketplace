import { PropertyType, PropertyStatus, ListingType, PropertyVerificationStatus } from '../../../shared/enums/property.enum.js';
import { FeaturedTier } from '../../../shared/enums/billing.enum.js';
export declare class PropertyDocumentFileDto {
    url: string;
    originalName: string;
    uploadedAt: string;
}
export declare class PropertyResponseDto {
    id: string;
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
    adminId: string | null;
    sellerId: string | null;
    verificationStatus: PropertyVerificationStatus;
    rejectionReason: string | null;
    isFeatured: boolean;
    featuredTier: FeaturedTier | null;
    featuredUntil: string | null;
    documents?: PropertyDocumentFileDto[];
    sellerName?: string;
    sellerEmail?: string;
    sellerPhone?: string | null;
    sellerSince?: string | null;
    createdAt: string;
    updatedAt: string;
}

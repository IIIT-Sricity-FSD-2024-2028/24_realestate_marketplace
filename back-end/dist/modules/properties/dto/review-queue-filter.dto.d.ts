import { PropertyVerificationStatus } from '../../../shared/enums/property.enum.js';
export declare class ReviewQueueFilterDto {
    verificationStatus?: PropertyVerificationStatus;
    page?: number;
    limit?: number;
}

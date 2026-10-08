import { NegotiationStatus } from '../../../shared/enums/negotiation.enum.js';
export declare class NegotiationFilterDto {
    status?: NegotiationStatus;
    page?: number;
    limit?: number;
}

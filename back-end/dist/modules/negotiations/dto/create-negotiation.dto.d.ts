export declare class CreateNegotiationDto {
    propertyId: string;
    offerAmount: number;
    message?: string;
    paymentMode?: string;
}
export declare class CounterNegotiationDto {
    counterAmount: number;
}
export declare class RejectNegotiationDto {
    reason?: string;
}

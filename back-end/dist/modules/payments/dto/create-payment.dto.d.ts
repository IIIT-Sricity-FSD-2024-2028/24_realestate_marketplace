export declare class VerifyPaymentDto {
    orderId: string;
    paymentId: string;
    signature: string;
}
export declare class FailPaymentDto {
    orderId: string;
    reason: string;
}

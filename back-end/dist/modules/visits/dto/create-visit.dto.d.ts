export declare class CreateVisitDto {
    propertyId: string;
    requestedDate: string;
    requestedSlot: string;
    message?: string;
}
export declare class RescheduleVisitDto {
    requestedDate: string;
    requestedSlot: string;
}
export declare class CancelVisitDto {
    reason?: string;
}

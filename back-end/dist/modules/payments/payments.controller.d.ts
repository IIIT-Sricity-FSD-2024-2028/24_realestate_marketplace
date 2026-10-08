import type { Request } from 'express';
import { PaymentsService } from './payments.service.js';
import { PaymentResponseDto } from './dto/payment-response.dto.js';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface.js';
type RawBodyRequest = Request & {
    rawBody?: Buffer;
};
interface RazorpayWebhookBody {
    event?: string;
    payload?: {
        payment?: {
            entity?: {
                id?: string;
                order_id?: string;
            };
        };
    };
}
export declare class PaymentsController {
    private readonly service;
    constructor(service: PaymentsService);
    findMine(user: AuthenticatedUser): Promise<{
        message: string;
        data: PaymentResponseDto[];
    }>;
    findAll(limit?: string): Promise<{
        message: string;
        data: PaymentResponseDto[];
    }>;
    findOne(id: string, user: AuthenticatedUser): Promise<{
        message: string;
        data: PaymentResponseDto;
    }>;
    webhook(req: RawBodyRequest, signature: string, body: RazorpayWebhookBody): Promise<{
        message: string;
        data: null;
    }>;
}
export {};

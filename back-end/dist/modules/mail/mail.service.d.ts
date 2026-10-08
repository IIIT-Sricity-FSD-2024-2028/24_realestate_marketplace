import { ConfigService } from '@nestjs/config';
export declare class MailService {
    private readonly configService;
    private readonly logger;
    private readonly transporter;
    constructor(configService: ConfigService);
    sendNewPasswordEmail(to: string, name: string, password: string, accountType: string | null): Promise<void>;
}

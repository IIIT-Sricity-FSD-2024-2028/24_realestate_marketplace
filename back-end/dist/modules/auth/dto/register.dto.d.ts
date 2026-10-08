import { UserType } from '../../users/schemas/user.schema.js';
export declare class RegisterDto {
    name: string;
    email: string;
    password: string;
    userType?: UserType;
    phone?: string;
}

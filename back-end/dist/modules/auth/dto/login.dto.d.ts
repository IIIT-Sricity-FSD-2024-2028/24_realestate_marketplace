import { UserType } from '../../users/schemas/user.schema.js';
export declare class LoginDto {
    email: string;
    password: string;
    userType?: UserType;
}

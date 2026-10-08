import { Role } from '../../../common/enums/role.enum.js';
import { UserType } from '../schemas/user.schema.js';
export declare class CreateUserDto {
    name: string;
    email: string;
    password: string;
    role: Role;
    userType?: UserType;
    phone?: string;
    city?: string;
    state?: string;
}

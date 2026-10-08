import { Role } from '../../../common/enums/role.enum.js';
import { UserType } from '../schemas/user.schema.js';
export declare class UpdateUserDto {
    name?: string;
    email?: string;
    role?: Role;
    userType?: UserType;
    phone?: string;
    city?: string;
    state?: string;
    isBlocked?: boolean;
}

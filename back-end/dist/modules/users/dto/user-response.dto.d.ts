import { Role } from '../../../common/enums/role.enum.js';
import { UserType } from '../schemas/user.schema.js';
export declare class UserResponseDto {
    id: string;
    name: string;
    email: string;
    role: Role;
    userType: UserType | null;
    phone: string | null;
    city: string | null;
    state: string | null;
    isBlocked: boolean;
    createdAt: string;
    updatedAt: string;
}

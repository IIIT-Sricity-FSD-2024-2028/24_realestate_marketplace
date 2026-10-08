import { Role } from '../../../common/enums/role.enum.js';
import { UserType } from '../../users/schemas/user.schema.js';
export interface AuthenticatedUser {
    id: string;
    email: string;
    name: string;
    role: Role;
    userType: UserType | null;
    city: string | null;
}
export interface JwtPayload {
    sub: string;
    email: string;
    role: Role;
}

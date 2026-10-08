import { Role } from '../../../common/enums/role.enum.js';
import { UserType } from '../../users/schemas/user.schema.js';

/** Shape of `request.user` after JwtAuthGuard runs. */
export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  userType: UserType | null;
  /**
   * For an admin, the one city they run (see ServiceCity) — every admin queue
   * is scoped to it. Null for buyers/sellers/superuser, where it carries no
   * authorization meaning.
   */
  city: string | null;
}

/** JWT payload signed at login time. */
export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
}

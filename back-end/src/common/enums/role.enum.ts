export enum Role {
  ADMIN = 'admin',
  USER = 'user',
  /** Top-level system role. Automatically satisfies any @ApiRole(...) check — see RolesGuard. */
  SUPERUSER = 'superuser',
}

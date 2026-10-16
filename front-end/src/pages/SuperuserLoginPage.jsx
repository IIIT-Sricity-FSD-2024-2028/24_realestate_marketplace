/**
 * SuperuserLoginPage.jsx  (was: superuser-login.html)
 * Purpose: Login page for the platform superuser.
 * Inputs:  none.
 * Outputs: StaffLoginForm configured for the superuser role → /superuser on success.
 * API calls: POST /auth/login (inside StaffLoginForm).
 */
import StaffLoginForm from '../components/auth/StaffLoginForm.jsx';

export default function SuperuserLoginPage() {
  return (
    <StaffLoginForm role="superuser" title="truEstate Superuser" subtitle="System administration login" icon="layers" emailPlaceholder="superuser@gmail.com" />
  );
}

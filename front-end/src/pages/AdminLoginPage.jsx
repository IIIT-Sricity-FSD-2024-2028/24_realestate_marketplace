/**
 * AdminLoginPage.jsx  (was: admin-login.html)
 * Purpose: Login page for city admins.
 * Inputs:  none.
 * Outputs: StaffLoginForm configured for the admin role → /admin on success.
 * API calls: POST /auth/login (inside StaffLoginForm).
 */
import StaffLoginForm from '../components/auth/StaffLoginForm.jsx';

export default function AdminLoginPage() {
  return <StaffLoginForm role="admin" title="truEstate Admin" subtitle="Admin workspace login" icon="home" emailPlaceholder="adminhyd@gmail.com" />;
}

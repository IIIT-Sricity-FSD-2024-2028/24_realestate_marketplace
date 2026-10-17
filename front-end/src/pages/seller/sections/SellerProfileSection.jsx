/**
 * SellerProfileSection.jsx
 * Purpose: Seller "My Profile" — summary card, personal details form and
 *          password change.
 * Inputs (props): account – useAccountProfile('sellerProfile') result
 * Outputs: the profile page.
 * API calls: GET /auth/me (inside useAccountProfile), PATCH /auth/change-password,
 *            POST /auth/forgot-password (through ChangePasswordCard).
 */
import { PageHeader } from '../../../components/common/ui.jsx';
import { ChangePasswordCard, PersonalInfoForm, ProfileSummary } from '../../../components/profile/ProfileSections.jsx';

export default function SellerProfileSection({ account }) {
  return (
    <>
      <PageHeader title="My Profile" subtitle="View and manage your personal information" />
      <div className="content">
        <ProfileSummary fullName={account.fullName} email={account.profile.email} accountLabel="Seller Account" account={account.account} />
        <PersonalInfoForm profile={account.profile} onSave={account.save} />
        <ChangePasswordCard idPrefix="seller" userType="seller" />
      </div>
    </>
  );
}

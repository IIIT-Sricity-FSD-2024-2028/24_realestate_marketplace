import { useSellerProfile as useSellerDetails } from '../context/SellerProfileContext.jsx';

export default function PageHeader({
  title: pageHeading,
  subtitle: pageDescription,
  action: headerAction,
  showAvatar: shouldDisplayAvatar = true,
}) {
  const { initials: profileInitials } = useSellerDetails();

  return (
    <div className="page-header">
      <div>
        <h1 className="page-title">{pageHeading}</h1>
        {pageDescription && (
          <p className="page-subtitle">{pageDescription}</p>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {headerAction}
        {shouldDisplayAvatar && (
          <div className="user-avatar">{profileInitials}</div>
        )}
      </div>
    </div>
  );
}
import { useSellerProfile } from '../context/SellerProfileContext.jsx';

export default function PageHeader({ title, subtitle, action, showAvatar = true }) {
  const { initials } = useSellerProfile();

  return (
    <div className="page-header">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {action}
        {showAvatar && <div className="user-avatar">{initials}</div>}
      </div>
    </div>
  );
}

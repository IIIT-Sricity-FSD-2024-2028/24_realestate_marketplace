import PageHeader from '../components/PageHeader.jsx';
import { BellIcon, SoldIcon, ChatIcon, PropertyIcon } from '../components/Icons.jsx';

export default function Notifications() {
  const notifications = [
    {
      id: 1,
      title: 'Listing Approved',
      message: 'Your property listing in Hyderabad has been verified and approved by the city administrator. It is now live in marketplace search results.',
      time: 'Just now',
      type: 'success',
      icon: <SoldIcon size={20} />,
      iconBg: 'rgba(29,185,84,0.2)',
      iconColor: '#1DB954',
    },
    {
      id: 2,
      title: 'New Buyer Offer Received',
      message: 'A buyer submitted a new purchase offer on your property. You can review the offer, accept, counter, or reject it from the Negotiations hub.',
      time: '2 hours ago',
      type: 'offer',
      icon: <ChatIcon size={20} />,
      iconBg: 'rgba(59,130,246,0.2)',
      iconColor: '#3b82f6',
    },
    {
      id: 3,
      title: 'Site Visit Scheduled',
      message: 'A buyer has booked a verified physical site visit to inspect your listing. The city admin desk will assist with coordinating access.',
      time: 'Yesterday',
      type: 'visit',
      icon: <PropertyIcon size={20} />,
      iconBg: 'rgba(249,115,22,0.2)',
      iconColor: '#f97316',
    },
    {
      id: 4,
      title: 'Subscription Tier Active',
      message: 'Your seller account plan is active. Enjoy listing quota benefits, search result priority, and dedicated verification assistance.',
      time: '3 days ago',
      type: 'billing',
      icon: <BellIcon size={20} />,
      iconBg: 'rgba(29,185,84,0.2)',
      iconColor: '#1DB954',
    },
  ];

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle="Stay updated on buyer offers, verification progress, and deal activities"
      />

      <div className="content-section" style={{ maxWidth: '800px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {notifications.map((n) => (
            <div
              key={n.id}
              className="card"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1.25rem',
                padding: '1.25rem 1.5rem',
                marginBottom: 0,
                transition: 'transform 0.2s, border-color 0.2s',
              }}
            >
              <div
                style={{
                  width: '2.75rem',
                  height: '2.75rem',
                  borderRadius: '9999px',
                  background: n.iconBg,
                  color: n.iconColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {n.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.25rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#fff' }}>{n.title}</h3>
                  <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{n.time}</span>
                </div>
                <p style={{ color: '#9ca3af', fontSize: '0.875rem', lineHeight: 1.5 }}>
                  {n.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

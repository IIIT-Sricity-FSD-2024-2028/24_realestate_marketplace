import { useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import { NotificationsIcon, VisitIcon, ChatIcon, OffersIcon } from '../components/Icons.jsx';
import { useToast } from '../context/ToastContext.jsx';

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    title: 'Site Visit Scheduled',
    message: 'Your site visit for Modern Downtown Apartment is scheduled for tomorrow at 10:00 AM.',
    time: '2 hours ago',
    read: false,
    type: 'visit',
    color: '#1DB954',
  },
  {
    id: 2,
    title: 'Offer Submitted',
    message: 'Your offer for Luxury Villa has been submitted successfully and is under seller review.',
    time: '5 hours ago',
    read: false,
    type: 'offer',
    color: '#1DB954',
  },
  {
    id: 3,
    title: 'Price Drop Alert',
    message: 'Price reduced by ₹5,00,000 on Spacious Family Home in your shortlist.',
    time: '1 day ago',
    read: false,
    type: 'alert',
    color: '#f97316',
  },
  {
    id: 4,
    title: 'Visit Confirmed',
    message: 'Your site visit request has been confirmed by the property owner and city desk.',
    time: '2 days ago',
    read: true,
    type: 'visit',
    color: '#1DB954',
  },
  {
    id: 5,
    title: 'Legal Verification Updated',
    message: 'Clear title and DTCP approval documents verified for Royal Palm Villa.',
    time: '3 days ago',
    read: true,
    type: 'system',
    color: '#3b82f6',
  },
];

export default function NotificationsPage() {
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [activeFilter, setActiveFilter] = useState('all');

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('All notifications marked as read');
  };

  const clearAll = () => {
    setNotifications([]);
    showToast('All notifications cleared');
  };

  const toggleRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  const filtered = notifications.filter((n) => {
    if (activeFilter === 'unread') return !n.read;
    if (activeFilter === 'visit') return n.type === 'visit';
    if (activeFilter === 'offer') return n.type === 'offer';
    return true;
  });

  const getIcon = (type, color) => {
    if (type === 'visit') {
      return <VisitIcon style={{ width: '1.25rem', height: '1.25rem', color }} />;
    }
    if (type === 'offer') {
      return <ChatIcon style={{ width: '1.25rem', height: '1.25rem', color }} />;
    }
    if (type === 'alert') {
      return <OffersIcon style={{ width: '1.25rem', height: '1.25rem', color }} />;
    }
    return <NotificationsIcon style={{ width: '1.25rem', height: '1.25rem', color }} />;
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <NotificationsIcon style={{ width: '2rem', height: '2rem', color: '#1DB954' }} />
          <div>
            <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              Notifications
              {unreadCount > 0 && (
                <span
                  style={{
                    background: '#1DB954',
                    color: '#000',
                    fontSize: '0.75rem',
                    padding: '0.125rem 0.5rem',
                    borderRadius: '9999px',
                    fontWeight: 700,
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </h1>
            <p className="page-subtitle" style={{ margin: 0 }}>
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
        </div>

        {notifications.length > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {unreadCount > 0 && (
              <button
                type="button"
                className="btn-secondary"
                onClick={markAllAsRead}
                style={{ fontSize: '0.8125rem', padding: '0.5rem 0.875rem' }}
              >
                Mark all as read
              </button>
            )}
            <button
              type="button"
              className="btn-secondary"
              onClick={clearAll}
              style={{ fontSize: '0.8125rem', padding: '0.5rem 0.875rem' }}
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[
          { key: 'all', label: 'All' },
          { key: 'unread', label: `Unread (${unreadCount})` },
          { key: 'visit', label: 'Site Visits' },
          { key: 'offer', label: 'Offers & Negotiations' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveFilter(tab.key)}
            className="filter-chip"
            style={{
              padding: '0.375rem 0.875rem',
              borderRadius: '9999px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: activeFilter === tab.key ? '1px solid #1DB954' : '1px solid rgba(255,255,255,0.1)',
              background: activeFilter === tab.key ? 'rgba(29, 185, 84, 0.15)' : '#1a1a1a',
              color: activeFilter === tab.key ? '#1DB954' : '#9ca3af',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="content-section">
        {filtered.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
            <NotificationsIcon style={{ width: '3rem', height: '3rem', color: '#444', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              No notifications found
            </h3>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
              You don't have any notifications under this filter.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filtered.map((n) => (
              <div
                key={n.id}
                className="card"
                onClick={() => toggleRead(n.id)}
                style={{
                  borderLeft: `3px solid ${n.color}`,
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  background: n.read ? '#181818' : '#1e1e1e',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  padding: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: '2.75rem',
                      height: '2.75rem',
                      borderRadius: '0.75rem',
                      background: `${n.color}22`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {getIcon(n.type, n.color)}
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 600, fontSize: '0.9375rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {n.title}
                      {!n.read && (
                        <span style={{ color: '#1DB954', fontSize: '0.75rem' }}>●</span>
                      )}
                    </h3>
                    <p style={{ color: '#9ca3af', fontSize: '0.875rem', lineHeight: 1.5, margin: 0 }}>
                      {n.message}
                    </p>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>{n.time}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

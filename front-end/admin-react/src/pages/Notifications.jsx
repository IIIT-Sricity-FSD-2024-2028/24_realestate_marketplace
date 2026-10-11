import PageHeader from '../components/PageHeader.jsx';

/**
 * Notifications (was data-section="notifications").
 * The old page had these five cards written directly into the HTML and never
 * called an API for them, so they are carried over unchanged as static content.
 */
const NOTIFICATIONS = [
  {
    icon: '📅', accent: '#f97316', title: 'New Visit Request — John Doe', time: 'Today, 10:15 AM',
    body: <>Requested a site visit for <strong>Modern Downtown Apartment, Banjara Hills</strong> on Mar 29 at 2:00 PM</>,
    badge: '⏳ Pending',
  },
  {
    icon: '📝', accent: '#8b5cf6', title: 'New Buyer Request — Sneha Mehta', time: 'Today, 9:42 AM',
    body: <>Looking for a <strong>2 BHK / Villa in Jubilee Hills</strong>, budget ₹90L–1.2 Cr. Investment purpose.</>,
    badge: 'New Request',
  },
  {
    icon: '🏠', accent: '#1DB954', title: 'Deal Step Updated — Luxury Villa with Garden', time: 'Yesterday, 4:30 PM',
    body: <>Token Payment confirmed by buyer <strong>Priya Sharma</strong>. Deal now at Step 3 of 5.</>,
    badge: '⭐ In Progress',
  },
  {
    icon: '💰', accent: '#1DB954', title: 'Commission Credited', time: 'Mar 26, 2026 · 2:10 PM',
    body: <><strong style={{ color: '#1DB954' }}>₹1,84,000</strong> commission received for <strong>Cozy Studio Apartment</strong> deal closure.</>,
    badge: '✅ Credited',
  },
  {
    icon: '📋', accent: '#3b82f6', title: 'RERA Compliance Reminder', time: 'Mar 25, 2026 · System',
    body: <>Your RERA certificate <strong>ADMIN-2024-HYD-1234</strong> is valid. Next renewal due <strong>Dec 2026</strong>.</>,
    badge: 'Info',
  },
];

/** Hex colour → rgba() with the given alpha, for the tinted badges. */
const tint = (hex, alpha) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
};

export default function Notifications() {
  return (
    <>
      <PageHeader title="Notifications" subtitle="Your latest updates & activity alerts" />
      <div className="page-body">
        {NOTIFICATIONS.map((n) => (
          <div key={n.title} className="card notification" style={{ borderLeftColor: n.accent }}>
            <div className="notification__icon">{n.icon}</div>
            <div className="notification__text">
              <h3>{n.title}</h3>
              <p className="muted small-plus">{n.body}</p>
              <p className="notification__time">{n.time}</p>
            </div>
            <span className="notification__badge" style={{ background: tint(n.accent, 0.12), color: n.accent }}>{n.badge}</span>
          </div>
        ))}
      </div>
    </>
  );
}

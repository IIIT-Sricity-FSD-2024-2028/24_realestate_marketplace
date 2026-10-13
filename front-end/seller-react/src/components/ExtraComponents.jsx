export function SectionHeading({ title, description, action }) {
  return (
    <div className="section-heading" style={styles.sectionHeading}>
      <div>
        <h2 style={styles.heading}>{title}</h2>
        {description && <p style={styles.description}>{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function StatusBadge({ status }) {
  const label = String(status ?? 'unknown');
  const color = statusColors[label.toLowerCase()] ?? statusColors.default;

  return (
    <span
      className="status-badge"
      style={{ ...styles.badge, color: color.text, backgroundColor: color.background }}
    >
      {label}
    </span>
  );
}

export function EmptyState({ title, message, action }) {
  return (
    <div className="empty-state" style={styles.emptyState}>
      <h3 style={styles.emptyTitle}>{title}</h3>
      {message && <p style={styles.description}>{message}</p>}
      {action && <div style={styles.action}>{action}</div>}
    </div>
  );
}

const statusColors = {
  active: { text: '#18794e', background: '#e8f5ee' },
  completed: { text: '#18794e', background: '#e8f5ee' },
  pending: { text: '#946200', background: '#fff4d6' },
  rejected: { text: '#b42318', background: '#feeceb' },
  default: { text: '#475467', background: '#f2f4f7' },
};

const styles = {
  sectionHeading: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '1rem',
    marginBottom: '1.25rem',
  },
  heading: { margin: 0, fontSize: '1.25rem' },
  description: { margin: '0.4rem 0 0', color: '#667085', lineHeight: 1.5 },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    borderRadius: '999px',
    padding: '0.25rem 0.65rem',
    fontSize: '0.8rem',
    fontWeight: 600,
    textTransform: 'capitalize',
  },
  emptyState: {
    padding: '2rem',
    textAlign: 'center',
    border: '1px dashed #d0d5dd',
    borderRadius: '0.75rem',
  },
  emptyTitle: { margin: 0, fontSize: '1.05rem' },
  action: { marginTop: '1rem' },
};

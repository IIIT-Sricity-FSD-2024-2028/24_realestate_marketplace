import { useNavigate } from 'react-router-dom';
import Modal from './Modal.jsx';

export default function QuotaUpgradeModal({ message, planName, onClose }) {
  const navigate = useNavigate();

  function handleGoToBilling() {
    onClose();
    navigate('/billing');
  }

  return (
    <Modal onClose={onClose} maxWidth="420px">
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            width: '3.5rem',
            height: '3.5rem',
            borderRadius: '1rem',
            background: 'rgba(245,158,11,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.75rem',
            margin: '0 auto 1.25rem',
          }}
        >
          🔒
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '0.75rem' }}>
          You have used every slot on your plan
        </h2>
        <p style={{ color: '#9ca3af', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1rem' }}>
          {message || 'You have reached the maximum number of properties allowed under your current plan.'}
        </p>
        <p style={{ color: '#6b7280', fontSize: '0.8rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
          Your details are preserved — upgrade to a higher tier or delete an old listing you no longer need.
        </p>
        <button
          className="btn-primary"
          onClick={handleGoToBilling}
          style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', fontSize: '0.95rem' }}
        >
          See plans {planName ? `— you are on ${planName}` : ''}
        </button>
        <button
          type="button"
          onClick={onClose}
          style={{
            width: '100%',
            background: 'none',
            border: 'none',
            color: '#6b7280',
            padding: '0.75rem',
            marginTop: '0.5rem',
            cursor: 'pointer',
            fontSize: '0.825rem',
          }}
        >
          Not now
        </button>
      </div>
    </Modal>
  );
}

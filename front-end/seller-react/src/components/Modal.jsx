import { useEffect } from 'react';

export default function Modal({ title, children, onClose, maxWidth = '520px' }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="modal-overlay show"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="modal-box" style={{ maxWidth }}>
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Close modal"
        >
          ✕
        </button>
        {title && <h2 className="modal-title">{title}</h2>}
        {children}
      </div>
    </div>
  );
}

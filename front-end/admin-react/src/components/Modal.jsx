import { useEffect } from 'react';

/**
 * Reusable modal dialog: dark backdrop + centred card.
 * - Clicking the backdrop or pressing Escape calls onClose.
 * - `showClose` adds the ✕ button in the corner.
 * - `maxWidth` matches the width each old modal used.
 */
export default function Modal({ open, onClose, title, maxWidth = '26rem', showClose = false, children }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" style={{ maxWidth }} role="dialog" aria-modal="true" aria-label={typeof title === 'string' ? title : undefined}>
        {showClose && (
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        )}
        {title && <h3 className="modal-title">{title}</h3>}
        {children}
      </div>
    </div>
  );
}

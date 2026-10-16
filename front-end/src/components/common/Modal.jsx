/**
 * Modal.jsx
 * Purpose: Accessible pop-up dialog used by every modal in the app
 *          (replaces the many hand-built overlay <div>s of the old pages).
 * Inputs (props):
 *   open        – show or hide the dialog
 *   onClose     – called on ✕, Escape key or a click on the dark backdrop
 *   title       – heading text (also the dialog's accessible name)
 *   size        – 'sm' | 'md' | 'lg' | 'xl' (max width)
 *   hideClose   – hide the ✕ button (for flows that must finish)
 *   children    – dialog body
 * Outputs: a portal rendered into <body>, or nothing when closed.
 * API calls: none.
 */
import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import './Modal.css';

export default function Modal({ open, onClose, title, size = 'md', hideClose = false, className = '', children }) {
  const titleId = useId(); // links the heading to the dialog for screen readers
  const boxRef = useRef(null);
  // Keep the latest onClose in a ref so the effect below runs only when the
  // dialog opens/closes — not on every re-render (which would steal focus).
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return undefined;
    const previouslyFocused = document.activeElement; // restore focus on close
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden'; // stop the page scrolling behind

    // Move keyboard focus into the dialog (first field/button).
    const focusable = boxRef.current?.querySelector('input, select, textarea, button:not([data-modal-close]), a[href], [tabindex]:not([tabindex="-1"])');
    (focusable || boxRef.current)?.focus();

    // Escape closes the dialog.
    const onKey = (event) => {
      if (event.key !== 'Escape' || !onCloseRef.current) return;
      // With stacked dialogs only the top-most one (last in the DOM) closes.
      const boxes = document.querySelectorAll('.modal-box');
      if (boxes[boxes.length - 1] === boxRef.current) onCloseRef.current();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
      if (previouslyFocused && previouslyFocused.focus) previouslyFocused.focus();
    };
  }, [open]);

  if (!open) return null; // closed → render nothing

  return createPortal(
    <div
      className="modal-backdrop"
      // Only a click on the backdrop itself (not inside the box) closes it.
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && onClose) onClose();
      }}
    >
      <div
        ref={boxRef}
        className={'modal-box modal-' + size + ' ' + className}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
      >
        {!hideClose && onClose && (
          <button type="button" className="modal-close" data-modal-close onClick={onClose} aria-label="Close dialog">
            ✕
          </button>
        )}
        {title && (
          <h2 id={titleId} className="modal-title">
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>,
    document.body,
  );
}

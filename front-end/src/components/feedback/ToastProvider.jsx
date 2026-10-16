/**
 * ToastProvider.jsx
 * Purpose: App-wide toast notifications (replaces showToast() in app.js).
 * Inputs (props): children — the whole app.
 * Outputs: provides useToast() → showToast(message, type) to any component;
 *          renders the stack of toasts in the bottom-right corner.
 * API calls: none.
 */
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

const ToastContext = createContext(null);

// How long a toast stays on screen (same 3 s as the original).
const TOAST_MS = 3000;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]); // [{ id, message, type }]
  const nextId = useRef(1); // unique key for each toast

  /** Shows a message; type 'error' paints it red, anything else green. */
  const showToast = useCallback((message, type = 'success') => {
    const id = nextId.current++;
    setToasts((list) => [...list, { id, message: String(message), type }]);
    // Remove it automatically after a few seconds.
    window.setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), TOAST_MS);
  }, []);

  // Stable object so consumers don't re-render on every toast.
  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* aria-live lets screen readers announce each new message. */}
      <div className="toast-stack" role="status" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={'toast ' + (toast.type === 'error' ? 'toast-error' : 'toast-success')}>
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/** Hook: const { showToast } = useToast(); */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

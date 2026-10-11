import { createContext, useCallback, useContext, useState } from 'react';

/**
 * App-wide toast notifications (replaces the global showToast() from app.js).
 * Any component calls `const showToast = useToast(); showToast('Saved')` or
 * `showToast('Failed', 'error')`. Toasts stack bottom-right and fade after 3s.
 */
const ToastContext = createContext(() => {});

let nextId = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = nextId++;
    setToasts((list) => [...list, { id, message, type }]);
    setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 3300);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className="toast-stack" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={'toast' + (t.type === 'error' ? ' toast--error' : '')}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

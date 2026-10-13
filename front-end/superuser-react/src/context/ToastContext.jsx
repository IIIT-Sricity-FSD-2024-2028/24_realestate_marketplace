import { createContext, useCallback, useContext, useState } from 'react';

const ToastContext = createContext(() => {});

let nextId = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = nextId++;
    setToasts((list) => [...list, { id, message, type }]);
    setTimeout(() => {
      setToasts((list) => list.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = (id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className="toast-stack" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={'toast' + (t.type === 'error' ? ' toast--error' : t.type === 'warning' ? ' toast--warning' : '')}
            onClick={() => removeToast(t.id)}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

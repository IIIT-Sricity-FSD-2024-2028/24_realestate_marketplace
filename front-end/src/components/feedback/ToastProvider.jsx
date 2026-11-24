/** Redux-backed toast host and compatibility hook. */
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toastAdded, toastRemoved } from '../../store/slices/uiSlice.js';

const TOAST_MS = 3000;

export function ToastHost() {
  const toasts = useSelector((state) => state.ui.toasts);
  return (
    <div className="toast-stack" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={'toast ' + (toast.type === 'error' ? 'toast-error' : 'toast-success')}>
          {toast.message}
        </div>
      ))}
    </div>
  );
}

export function useToast() {
  const dispatch = useDispatch();
  const showToast = useCallback(
    (message, type = 'success') => {
      const action = toastAdded(message, type);
      dispatch(action);
      window.setTimeout(() => dispatch(toastRemoved(action.payload.id)), TOAST_MS);
    },
    [dispatch],
  );
  return { showToast };
}

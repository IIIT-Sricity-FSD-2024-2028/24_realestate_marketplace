/**
 * DialogProvider.jsx
 * Purpose: Promise-based confirm/prompt dialogs styled like the app
 *          (replaces window.confirm / window.prompt from the old pages).
 * Inputs (props): children — the whole app.
 * Outputs: useDialog() → { confirm(options), prompt(options) }
 *          confirm resolves true/false; prompt resolves the text or null.
 * API calls: none.
 */
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import Modal from '../common/Modal.jsx';

const DialogContext = createContext(null);

export function DialogProvider({ children }) {
  // The dialog currently on screen (null = none) plus its resolver.
  const [dialog, setDialog] = useState(null);
  const [text, setText] = useState(''); // prompt input value

  /** Opens a yes/no question. */
  const confirm = useCallback(
    (options) =>
      new Promise((resolve) => {
        const opts = typeof options === 'string' ? { message: options } : options;
        setDialog({ kind: 'confirm', ...opts, resolve });
      }),
    [],
  );

  /** Opens a question with a text box (e.g. rejection reason). */
  const prompt = useCallback(
    (options) =>
      new Promise((resolve) => {
        setText(options.defaultValue || '');
        setDialog({ kind: 'prompt', ...options, resolve });
      }),
    [],
  );

  /** Closes the dialog and hands the answer back to the caller. */
  const finish = (answer) => {
    if (dialog) dialog.resolve(answer);
    setDialog(null);
  };

  const value = useMemo(() => ({ confirm, prompt }), [confirm, prompt]);
  const isPrompt = dialog && dialog.kind === 'prompt';

  return (
    <DialogContext.Provider value={value}>
      {children}
      <Modal open={!!dialog} onClose={() => finish(isPrompt ? null : false)} title={dialog?.title || 'Please confirm'} size="sm">
        {dialog && (
          <form
            onSubmit={(event) => {
              event.preventDefault(); // stay on the page
              finish(isPrompt ? text : true);
            }}
          >
            <p className="dialog-message">{dialog.message}</p>
            {isPrompt && (
              <div className="form-group">
                <label className="form-label" htmlFor="dialog-input">
                  {dialog.label || 'Your answer'}
                </label>
                <input
                  id="dialog-input"
                  className="form-control"
                  type={dialog.inputType || 'text'}
                  value={text}
                  placeholder={dialog.placeholder || ''}
                  onChange={(event) => setText(event.target.value)}
                />
              </div>
            )}
            <div className="dialog-actions">
              <button type="button" className="btn btn-secondary" onClick={() => finish(isPrompt ? null : false)}>
                {dialog.cancelText || 'Cancel'}
              </button>
              <button type="submit" className={'btn ' + (dialog.danger ? 'btn-danger-solid' : 'btn-primary')}>
                {dialog.confirmText || 'OK'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </DialogContext.Provider>
  );
}

/** Hook: const { confirm, prompt } = useDialog(); */
export function useDialog() {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error('useDialog must be used inside <DialogProvider>');
  return ctx;
}

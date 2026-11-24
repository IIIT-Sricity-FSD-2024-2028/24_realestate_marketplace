/** Promise-based dialogs rendered from serializable Redux UI state. */
import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Modal from '../common/Modal.jsx';
import { dialogClosed, dialogOpened } from '../../store/slices/uiSlice.js';

let nextDialogId = 1;
const resolvers = new Map();

export function DialogHost() {
  const dispatch = useDispatch();
  const dialog = useSelector((state) => state.ui.dialog);
  const [text, setText] = useState('');
  const isPrompt = dialog?.kind === 'prompt';
  const finish = (answer) => {
    if (dialog) resolvers.get(dialog.id)?.(answer);
    if (dialog) resolvers.delete(dialog.id);
    dispatch(dialogClosed());
    setText('');
  };
  return (
    <Modal open={!!dialog} onClose={() => finish(isPrompt ? null : false)} title={dialog?.title || 'Please confirm'} size="sm">
      {dialog && (
        <form
          onSubmit={(event) => {
            event.preventDefault();
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
  );
}

export function useDialog() {
  const dispatch = useDispatch();
  const open = useCallback(
    (kind, options) =>
      new Promise((resolve) => {
        const id = nextDialogId++;
        resolvers.set(id, resolve);
        dispatch(dialogOpened({ id, kind, ...(typeof options === 'string' ? { message: options } : options) }));
      }),
    [dispatch],
  );
  return { confirm: useCallback((options) => open('confirm', options), [open]), prompt: useCallback((options) => open('prompt', options), [open]) };
}

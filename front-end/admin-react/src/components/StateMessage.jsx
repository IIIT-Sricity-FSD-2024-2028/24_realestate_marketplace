/**
 * Centred status text for a list: "Loading…", an empty-state sentence, or an
 * API error in red. `fullRow` spans every column when placed inside a CSS grid.
 */
export default function StateMessage({ children, error = false, fullRow = false }) {
  return (
    <div className={'state-msg' + (error ? ' state-msg--error' : '') + (fullRow ? ' state-msg--full' : '')}>
      {children}
    </div>
  );
}

/** Convenience wrapper: renders loading/error states of a useAdminData() result. */
export function DataState({ status, error, fallbackError, fullRow }) {
  if (status === 'loading') return <StateMessage fullRow={fullRow}>Loading…</StateMessage>;
  if (status === 'error') {
    return <StateMessage error fullRow={fullRow}>{(error && error.message) || fallbackError}</StateMessage>;
  }
  return null;
}

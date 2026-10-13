/**
 * Status message for tables and lists: Loading, Empty, or Error state.
 */
export default function StateMessage({ children, error = false }) {
  return (
    <div className={'state-msg' + (error ? ' state-msg--error' : '')}>
      {children}
    </div>
  );
}

export function TableRowMessage({ colSpan = 6, children, error = false }) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        style={{
          padding: '2.5rem 1.5rem',
          textAlign: 'center',
          color: error ? '#ef4444' : 'var(--text-secondary)',
          fontSize: '0.875rem',
        }}
      >
        {children}
      </td>
    </tr>
  );
}

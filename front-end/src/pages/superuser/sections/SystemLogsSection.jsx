/** Redux-backed read-only viewer for server log files. */
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { PageHeader, StatusLine } from '../../../components/common/ui.jsx';
import { fetchLogChannels, fetchLogEntries } from '../../../store/actions/apiActions.js';
import { formatBytes, formatLogTime } from '../../../utils/format.js';

const LEVEL_CLASS = { fatal: 'text-danger', error: 'text-danger', warn: 'text-warning' };
export function summariseLogEntry(entry) {
  const parts = [];
  if (entry.statusCode) parts.push(entry.statusCode);
  if (entry.durationMs != null) parts.push(entry.durationMs + 'ms');
  if (entry.event) parts.push(entry.event);
  if (entry.ip) parts.push(entry.ip);
  return parts.join(' · ');
}

export default function SystemLogsSection() {
  const dispatch = useDispatch();
  const channels = useSelector((state) => state.system.channels);
  const result = useSelector((state) => state.system.logResult);
  const loading = useSelector((state) => state.system.loading.entries || state.system.loading.channels);
  const error = useSelector((state) => state.system.error);
  const [filters, setFilters] = useState({ channel: 'http', level: '', lines: '100' });
  const [autoRefresh, setAutoRefresh] = useState(false);
  const refresh = useCallback(() => {
    dispatch(fetchLogChannels());
    dispatch(fetchLogEntries(filters));
  }, [dispatch, filters]);
  useEffect(() => {
    refresh();
  }, [refresh]);
  useEffect(() => {
    if (!autoRefresh) return undefined;
    const timer = window.setInterval(refresh, 5000);
    return () => window.clearInterval(timer);
  }, [autoRefresh, refresh]);
  const setFilter = (field) => (event) => setFilters((current) => ({ ...current, [field]: event.target.value }));
  return (
    <>
      <PageHeader
        title="System Logs"
        subtitle="Written to disk by the logging middleware — one file per channel, per day."
        actions={
          <>
            <label className="checkbox">
              <input type="checkbox" checked={autoRefresh} onChange={(event) => setAutoRefresh(event.target.checked)} /> Auto-refresh
            </label>
            <button type="button" className="btn btn-primary" onClick={refresh}>
              Refresh
            </button>
          </>
        }
      />
      <div className="content">
        <StatusLine error={error} />
        <div className="stats-grid">
          {channels.map((channel) => (
            <div key={channel.channel} className="stat-card">
              <div className="stat-value stat-value-sm">{channel.currentFile}</div>
              <div className="stat-label">
                {channel.channel} — {channel.fileCount} file(s), {formatBytes(channel.totalSizeBytes)}
              </div>
            </div>
          ))}
        </div>
        <div className="table-card">
          <div className="toolbar">
            <label className="sr-only" htmlFor="logs-channel">
              Log channel
            </label>
            <select id="logs-channel" className="form-control" value={filters.channel} onChange={setFilter('channel')}>
              <option value="http">http — one line per request</option>
              <option value="error">error — failures &amp; stack traces</option>
              <option value="audit">audit — logins, writes, uploads</option>
              <option value="app">app — application output</option>
            </select>
            <label className="sr-only" htmlFor="logs-level">
              Level
            </label>
            <select id="logs-level" className="form-control toolbar-select" value={filters.level} onChange={setFilter('level')}>
              <option value="">All levels</option>
              <option value="info">info</option>
              <option value="warn">warn</option>
              <option value="error">error</option>
              <option value="fatal">fatal</option>
            </select>
            <label className="sr-only" htmlFor="logs-lines">
              Number of lines
            </label>
            <select id="logs-lines" className="form-control toolbar-select" value={filters.lines} onChange={setFilter('lines')}>
              <option value="50">Last 50</option>
              <option value="100">Last 100</option>
              <option value="250">Last 250</option>
            </select>
          </div>
          {result.file && (
            <p className="toolbar-note">
              Reading {result.file} — {result.entries.length} entries (newest first)
            </p>
          )}
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Time</th>
                  <th scope="col">Level</th>
                  <th scope="col">Message</th>
                  <th scope="col">Details</th>
                </tr>
              </thead>
              <tbody>
                {loading || error ? (
                  <tr>
                    <td colSpan={4}>
                      <StatusLine loading={loading} error={error} />
                    </td>
                  </tr>
                ) : result.entries.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="table-empty">
                      Nothing logged to this channel yet.
                    </td>
                  </tr>
                ) : (
                  [...result.entries].reverse().map((entry, index) => (
                    <tr key={entry.timestamp + '-' + index}>
                      <td className="nowrap small">{formatLogTime(entry.timestamp)}</td>
                      <td className={'strong small ' + (LEVEL_CLASS[entry.level] || 'text-secondary')}>{String(entry.level || '').toUpperCase()}</td>
                      <td className="mono small break">{entry.message}</td>
                      <td className="small text-secondary">{summariseLogEntry(entry)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

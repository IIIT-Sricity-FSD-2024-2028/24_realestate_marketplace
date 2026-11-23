/**
 * SystemLogsSection.jsx
 * Purpose: Read-only viewer for the log files the backend writes to disk
 *          (logs/{http,error,app,audit}/*.log), with channel/level/line-count
 *          filters and an optional 5-second auto-refresh.
 * Inputs:  Redux store (logsSlice — channels, entries, filters, autoRefresh).
 *          All filter state persists across tab-switches.
 * Outputs: channel summary cards + newest-first log table.
 * API calls (via Redux thunks): GET /logs, GET /logs/:channel?lines=…&level=…
 * Local React state: none — everything is in Redux.
 */
import { useCallback, useEffect } from 'react';
import { PageHeader, StatusLine } from '../../../components/common/ui.jsx';
import { useAppDispatch, useAppSelector } from '../../../store/index.js';
import {
  fetchLogChannels,
  fetchLogEntries,
  selectAutoRefresh,
  selectLogChannels,
  selectLogChannelsError,
  selectLogEntries,
  selectLogEntriesError,
  selectLogEntriesFile,
  selectLogEntriesStatus,
  selectLogFilters,
  setAutoRefresh,
  setLogFilters,
} from '../../../store/slices/logsSlice.js';
import { formatBytes, formatLogTime } from '../../../utils/format.js';

// Colour per log level (unknown levels fall back to grey).
const LEVEL_CLASS = { fatal: 'text-danger', error: 'text-danger', warn: 'text-warning' };

/** Picks the useful fields out of a log entry for the "Details" column. */
export function summariseLogEntry(entry) {
  const parts = [];
  if (entry.statusCode) parts.push(entry.statusCode);
  if (entry.durationMs != null) parts.push(entry.durationMs + 'ms');
  if (entry.event) parts.push(entry.event);
  if (entry.ip) parts.push(entry.ip);
  return parts.join(' · ');
}

export default function SystemLogsSection() {
  const dispatch = useAppDispatch();

  // ── Redux state (all state — including filters — lives in the store) ───
  const channels = useAppSelector(selectLogChannels);
  const channelsError = useAppSelector(selectLogChannelsError);
  const entries = useAppSelector(selectLogEntries);
  const entriesFile = useAppSelector(selectLogEntriesFile);
  const entriesStatus = useAppSelector(selectLogEntriesStatus);
  const entriesError = useAppSelector(selectLogEntriesError);
  const filters = useAppSelector(selectLogFilters);       // { channel, level, lines }
  const autoRefresh = useAppSelector(selectAutoRefresh);  // boolean

  const refresh = useCallback(() => {
    dispatch(fetchLogChannels());
    dispatch(fetchLogEntries({ channel: filters.channel, lines: filters.lines, level: filters.level }));
  }, [dispatch, filters]);

  // Load on open and whenever filters change (entriesStatus resets to 'idle' on filter change).
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Optional 5-second auto-refresh (stops when unticked or the section unmounts).
  useEffect(() => {
    if (!autoRefresh) return undefined;
    const timer = window.setInterval(refresh, 5000);
    return () => window.clearInterval(timer);
  }, [autoRefresh, refresh]);

  /** Update a single filter field in Redux (triggers re-fetch via useEffect). */
  const setFilter = (field) => (event) => {
    dispatch(setLogFilters({ [field]: event.target.value }));
  };

  const entriesLoading = entriesStatus === 'loading' || entriesStatus === 'idle';

  return (
    <>
      <PageHeader
        title="System Logs"
        subtitle="Written to disk by the logging middleware — one file per channel, per day."
        actions={
          <>
            <label className="checkbox">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => dispatch(setAutoRefresh(e.target.checked))}
              />{' '}
              Auto-refresh
            </label>
            <button type="button" className="btn btn-primary" onClick={refresh}>
              Refresh
            </button>
          </>
        }
      />
      <div className="content">
        <StatusLine error={channelsError} />
        <div className="stats-grid">
          {channels.map((c) => (
            <div key={c.channel} className="stat-card">
              <div className="stat-value stat-value-sm">{c.currentFile}</div>
              <div className="stat-label">
                {c.channel} — {c.fileCount} file(s), {formatBytes(c.totalSizeBytes)}
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
          {entriesFile && (
            <p className="toolbar-note">
              Reading {entriesFile} — {entries.length} entries (newest first)
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
                {entriesLoading || entriesError ? (
                  <tr>
                    <td colSpan={4}>
                      <StatusLine loading={entriesLoading} error={entriesError} />
                    </td>
                  </tr>
                ) : entries.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="table-empty">
                      Nothing logged to this channel yet.
                    </td>
                  </tr>
                ) : (
                  // The API returns oldest→newest; show newest first.
                  [...entries].reverse().map((entry, i) => (
                    <tr key={entry.timestamp + '-' + i}>
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

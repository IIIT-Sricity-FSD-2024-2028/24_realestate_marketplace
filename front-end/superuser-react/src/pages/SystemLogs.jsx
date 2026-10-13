import { useCallback, useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import Icon from '../components/Icons.jsx';
import { TableRowMessage } from '../components/StateMessage.jsx';
import { getLogChannels, getLogEntries } from '../api/superuserApi.js';
import { formatBytes, formatLogTime } from '../utils/format.js';

const LEVEL_COLOURS = {
  fatal: '#ef4444',
  error: '#ef4444',
  warn: '#f59e0b',
  info: 'var(--text-secondary)',
  debug: 'var(--text-secondary)',
};

function summariseLogEntry(entry) {
  const parts = [];
  if (entry.statusCode) parts.push(`Status: ${entry.statusCode}`);
  if (entry.durationMs != null) parts.push(`${entry.durationMs}ms`);
  if (entry.event) parts.push(entry.event);
  if (entry.ip) parts.push(entry.ip);
  return parts.join(' · ');
}

export default function SystemLogs() {
  const [channels, setChannels] = useState([]);
  const [channel, setChannel] = useState('http');
  const [level, setLevel] = useState('');
  const [lines, setLines] = useState('100');
  const [autoRefresh, setAutoRefresh] = useState(false);

  const [loading, setLoading] = useState(true);
  const [fileLabel, setFileLabel] = useState('');
  const [entries, setEntries] = useState([]);
  const [error, setError] = useState('');

  const loadChannels = useCallback(async () => {
    try {
      const res = await getLogChannels();
      setChannels(res.data || []);
    } catch {
      /* channel list fallback */
    }
  }, []);

  const loadEntries = useCallback(async () => {
    setError('');
    try {
      const res = await getLogEntries(channel, { lines, level });
      const { file, entries: list } = res.data || { file: '', entries: [] };
      setFileLabel(`Reading ${file} — ${list.length} entries (newest first)`);
      setEntries(list ? list.slice().reverse() : []);
    } catch (err) {
      setError(err.message || 'Failed to load log entries');
    } finally {
      setLoading(false);
    }
  }, [channel, lines, level]);

  const refreshAll = useCallback(() => {
    loadChannels();
    loadEntries();
  }, [loadChannels, loadEntries]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  useEffect(() => {
    if (!autoRefresh) return undefined;
    const timer = setInterval(() => {
      loadEntries();
    }, 5000);
    return () => clearInterval(timer);
  }, [autoRefresh, loadEntries]);

  return (
    <div className="section active">
      <PageHeader
        title="System Logs"
        subtitle="Written to disk by the logging middleware — one file per channel, per day."
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
              />
              <span>Auto-refresh</span>
            </label>
            <button
              type="button"
              className="btn btn-primary"
              onClick={refreshAll}
            >
              <Icon name="refresh" size="1rem" />
              <span>Refresh</span>
            </button>
          </div>
        }
      />

      <div className="section-body">
        {/* Channel Overview Cards */}
        <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
          {channels.map((ch) => (
            <div
              key={ch.channel}
              className={'stat-card log-card' + (channel === ch.channel ? ' log-card--active' : '')}
              onClick={() => setChannel(ch.channel)}
              style={{ cursor: 'pointer' }}
            >
              <div className="stat-value" style={{ fontSize: '1.15rem' }}>
                {ch.currentFile}
              </div>
              <div className="stat-label">
                <strong>{ch.channel}</strong> — {ch.fileCount} file(s), {formatBytes(ch.totalSizeBytes)}
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="form-alert-error" style={{ marginBottom: '1.5rem' }}>
            {error}
          </div>
        )}

        <div className="table-container">
          <div className="table-filter-bar">
            <div className="search-bar">
              <select
                className="select-field"
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
              >
                <option value="http">http — one line per request</option>
                <option value="error">error — failures & stack traces</option>
                <option value="audit">audit — logins, writes, uploads</option>
                <option value="app">app — application output</option>
              </select>

              <select
                className="select-field"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
              >
                <option value="">All levels</option>
                <option value="info">info</option>
                <option value="warn">warn</option>
                <option value="error">error</option>
                <option value="fatal">fatal</option>
              </select>

              <select
                className="select-field"
                value={lines}
                onChange={(e) => setLines(e.target.value)}
              >
                <option value="50">Last 50</option>
                <option value="100">Last 100</option>
                <option value="250">Last 250</option>
              </select>
            </div>
            {fileLabel && <div className="file-label-text">{fileLabel}</div>}
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '12rem' }}>Time</th>
                <th style={{ width: '6rem' }}>Level</th>
                <th>Message</th>
                <th style={{ width: '12rem' }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <TableRowMessage colSpan={4}>Loading log entries…</TableRowMessage>
              )}

              {!loading && entries.length === 0 && (
                <TableRowMessage colSpan={4}>Nothing logged to this channel yet.</TableRowMessage>
              )}

              {!loading &&
                entries.map((entry, idx) => {
                  const lvlColor = LEVEL_COLOURS[entry.level] || 'var(--text-secondary)';
                  return (
                    <tr key={entry.timestamp ? `${entry.timestamp}-${idx}` : idx}>
                      <td className="log-time-cell">
                        {formatLogTime(entry.timestamp)}
                      </td>
                      <td>
                        <span
                          className="log-level-badge"
                          style={{ color: lvlColor, borderColor: lvlColor }}
                        >
                          {(entry.level || 'INFO').toUpperCase()}
                        </span>
                      </td>
                      <td className="log-msg-cell">
                        {entry.message}
                      </td>
                      <td className="muted small">
                        {summariseLogEntry(entry) || '—'}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

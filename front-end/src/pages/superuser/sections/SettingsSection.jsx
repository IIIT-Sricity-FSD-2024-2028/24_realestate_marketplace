/**
 * SettingsSection.jsx
 * Purpose: "System Configurations" form. The backend has no settings
 *          endpoint, so — exactly as on the old page — saving only validates
 *          and confirms; nothing is persisted (the toast says so honestly).
 * Inputs:  none.
 * Outputs: settings tabs + form with validation.
 * API calls: none.
 */
import { useState } from 'react';
import { PageHeader } from '../../../components/common/ui.jsx';
import { FormField, TextInput } from '../../../components/forms/FormControls.jsx';
import { useToast } from '../../../components/feedback/ToastProvider.jsx';
import { isPositiveNumber } from '../../../utils/validation.js';
import './SettingsSection.css';

const TABS = ['General Constants', 'Database Configs', 'Security Policies', 'API Keys'];

export default function SettingsSection() {
  const { showToast } = useToast();
  const [tab, setTab] = useState(TABS[0]);
  const [form, setForm] = useState({ platformName: 'truEstate', maintenance: 'false', uploadSize: '25' });
  const [errors, setErrors] = useState({});

  const set = (field) => (value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const save = () => {
    // Old tvValidateSettings: both fields required, size must be a positive number.
    const found = {};
    if (!form.platformName.trim()) found.platformName = 'Platform Name is required';
    if (!isPositiveNumber(form.uploadSize)) found.uploadSize = 'Upload Size must be a valid positive number';
    setErrors(found);
    if (Object.keys(found).length) {
      showToast('Platform Name and Upload Size are required.', 'error');
      return;
    }
    showToast('Settings saved (demo only — not persisted to the backend)');
  };

  return (
    <>
      <PageHeader
        title="System Configurations"
        subtitle="Manage application-wide environment variables and rules."
        actions={
          <button type="button" className="btn btn-primary" onClick={save}>
            Save Settings
          </button>
        }
      />
      <div className="content">
        <div className="settings-grid">
          <div className="settings-nav" role="tablist" aria-label="Settings categories">
            {TABS.map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={tab === t}
                className={'settings-nav-item' + (tab === t ? ' active' : '')}
                onClick={() => setTab(t)}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="panel" role="tabpanel">
            <h2 className="panel-title">{tab === TABS[0] ? 'General Application Constants' : tab}</h2>
            {tab === TABS[0] ? (
              <form
                noValidate
                onSubmit={(e) => {
                  e.preventDefault();
                  save();
                }}
              >
                <FormField id="set-name" label="Platform Name" required error={errors.platformName}>
                  <TextInput id="set-name" value={form.platformName} onValueChange={set('platformName')} error={errors.platformName} />
                </FormField>
                <FormField id="set-maintenance" label="Maintenance Mode">
                  <select id="set-maintenance" className="form-control" value={form.maintenance} onChange={(e) => set('maintenance')(e.target.value)}>
                    <option value="false">Disabled - Full Operations</option>
                    <option value="true">Enabled - Rejecting Login Traffic</option>
                  </select>
                </FormField>
                <FormField
                  id="set-upload"
                  label="Max Property Upload Size (MB)"
                  required
                  error={errors.uploadSize}
                  hint="The server's real limit is MAX_UPLOAD_FILE_MB in back-end/.env."
                >
                  <TextInput
                    id="set-upload"
                    restrict="number"
                    inputMode="numeric"
                    value={form.uploadSize}
                    onValueChange={set('uploadSize')}
                    error={errors.uploadSize}
                  />
                </FormField>
              </form>
            ) : (
              <p className="text-secondary">
                These values are configured in <code>back-end/.env</code> on the server and are not editable from the browser.
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

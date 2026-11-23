/**
 * SettingsSection.jsx
 * Purpose: "System Configurations" form. The backend has no settings
 *          endpoint, so — exactly as on the old page — saving only validates
 *          and confirms; nothing is persisted to the server (the toast says
 *          so honestly). All form state is now held in Redux so that tab
 *          selections and entered values survive navigation between sections.
 * Inputs:  Redux store (settingsSlice).
 * Outputs: settings tabs + form with validation.
 * API calls: none.
 */
import { PageHeader } from '../../../components/common/ui.jsx';
import { FormField, TextInput } from '../../../components/forms/FormControls.jsx';
import { useToast } from '../../../components/feedback/ToastProvider.jsx';
import { isPositiveNumber } from '../../../utils/validation.js';
import { useAppDispatch, useAppSelector } from '../../../store/index.js';
import {
  TABS,
  clearErrors,
  selectSettingsErrors,
  selectSettingsForm,
  selectSettingsTab,
  setActiveTab,
  setErrors,
  setField,
} from '../../../store/slices/settingsSlice.js';
import './SettingsSection.css';

export default function SettingsSection() {
  const { showToast } = useToast();
  const dispatch = useAppDispatch();

  // ── Redux state (all settings state lives in the store) ────────────────
  const tab = useAppSelector(selectSettingsTab);
  const form = useAppSelector(selectSettingsForm);
  const errors = useAppSelector(selectSettingsErrors);

  /** Update a form field value in Redux (clears that field's error too). */
  const set = (field) => (value) => {
    dispatch(setField({ field, value }));
  };

  const save = () => {
    // Old tvValidateSettings: both fields required, size must be a positive number.
    const found = {};
    if (!form.platformName.trim()) found.platformName = 'Platform Name is required';
    if (!isPositiveNumber(form.uploadSize)) found.uploadSize = 'Upload Size must be a valid positive number';
    dispatch(setErrors(found));
    if (Object.keys(found).length) {
      showToast('Platform Name and Upload Size are required.', 'error');
      return;
    }
    dispatch(clearErrors());
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
                onClick={() => dispatch(setActiveTab(t))}
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

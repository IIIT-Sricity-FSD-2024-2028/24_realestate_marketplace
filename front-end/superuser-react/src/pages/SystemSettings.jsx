import { useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import FormField from '../components/FormField.jsx';
import { useToast } from '../context/ToastContext.jsx';

const TABS = [
  'General Constants',
  'Database Configs',
  'Security Policies',
  'API Keys',
];

export default function SystemSettings() {
  const showToast = useToast();
  const [activeTab, setActiveTab] = useState(0);

  const [settings, setSettings] = useState({
    platformName: 'truEstate',
    maintenanceMode: 'false',
    maxUploadSize: '25',
    defaultCurrency: 'INR (₹)',
    dbHost: '127.0.0.1:5432',
    dbPoolSize: '20',
    dbLogging: 'true',
    jwtExpiryMinutes: '1440',
    corsOrigins: 'http://localhost:3000, http://127.0.0.1:3001',
    passwordMinLength: '8',
    paymentMode: 'sandbox',
    razorpayKeyId: 'rzp_test_truestate_live_demo',
  });

  const updateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    try {
      localStorage.setItem('truEstate_superuser_settings', JSON.stringify(settings));
    } catch {
      /* safe */
    }
    showToast('System settings saved successfully');
  };

  return (
    <div className="section active">
      <PageHeader
        title="System Configurations"
        subtitle="Manage application-wide environment variables and rules."
        actions={
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
          >
            Save Settings
          </button>
        }
      />

      <div className="section-body">
        <div className="settings-grid">
          <div className="settings-nav">
            {TABS.map((tab, idx) => (
              <button
                key={tab}
                type="button"
                className={'settings-nav-item' + (activeTab === idx ? ' active' : '')}
                onClick={() => setActiveTab(idx)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="settings-panel">
            <h2 className="settings-panel-title">{TABS[activeTab]}</h2>

            <form onSubmit={handleSave}>
              {activeTab === 0 && (
                <div className="settings-form-group">
                  <FormField
                    label="Platform Name"
                    value={settings.platformName}
                    onChange={(e) => updateSetting('platformName', e.target.value)}
                  />

                  <FormField
                    label="Maintenance Mode"
                    as="select"
                    value={settings.maintenanceMode}
                    onChange={(e) => updateSetting('maintenanceMode', e.target.value)}
                  >
                    <option value="false">Disabled - Full Operations</option>
                    <option value="true">Enabled - Rejecting Public Traffic</option>
                  </FormField>

                  <FormField
                    label="Max Property Upload Size (MB)"
                    type="number"
                    value={settings.maxUploadSize}
                    onChange={(e) => updateSetting('maxUploadSize', e.target.value)}
                  />

                  <FormField
                    label="Default Catalog Currency"
                    value={settings.defaultCurrency}
                    disabled
                  />
                </div>
              )}

              {activeTab === 1 && (
                <div className="settings-form-group">
                  <FormField
                    label="Database Host Endpoint"
                    value={settings.dbHost}
                    onChange={(e) => updateSetting('dbHost', e.target.value)}
                  />

                  <FormField
                    label="Connection Pool Limit"
                    type="number"
                    value={settings.dbPoolSize}
                    onChange={(e) => updateSetting('dbPoolSize', e.target.value)}
                  />

                  <FormField
                    label="Query Logging & Slow Query Monitor"
                    as="select"
                    value={settings.dbLogging}
                    onChange={(e) => updateSetting('dbLogging', e.target.value)}
                  >
                    <option value="true">Enabled (Logged to logs/app)</option>
                    <option value="false">Disabled</option>
                  </FormField>
                </div>
              )}

              {activeTab === 2 && (
                <div className="settings-form-group">
                  <FormField
                    label="JWT Token Expiry (Minutes)"
                    type="number"
                    value={settings.jwtExpiryMinutes}
                    onChange={(e) => updateSetting('jwtExpiryMinutes', e.target.value)}
                  />

                  <FormField
                    label="Minimum Password Complexity"
                    type="number"
                    value={settings.passwordMinLength}
                    onChange={(e) => updateSetting('passwordMinLength', e.target.value)}
                  />

                  <FormField
                    label="Allowed CORS Origins"
                    value={settings.corsOrigins}
                    onChange={(e) => updateSetting('corsOrigins', e.target.value)}
                  />
                </div>
              )}

              {activeTab === 3 && (
                <div className="settings-form-group">
                  <FormField
                    label="Payment Gateway Environment"
                    as="select"
                    value={settings.paymentMode}
                    onChange={(e) => updateSetting('paymentMode', e.target.value)}
                  >
                    <option value="sandbox">Sandbox / Mock Verification</option>
                    <option value="production">Production Gateway</option>
                  </FormField>

                  <FormField
                    label="Public API Key ID"
                    value={settings.razorpayKeyId}
                    onChange={(e) => updateSetting('razorpayKeyId', e.target.value)}
                  />
                </div>
              )}

              <div style={{ marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

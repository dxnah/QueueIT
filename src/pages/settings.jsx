// Settings.jsx

import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import '../styles/dashboard.css';
import '../styles/settings.css';

// ── helpers ───────────────────────────────────────────────────────────────────
const LS = {
  get: (key, fallback) => {
    try {
      const v = localStorage.getItem(key);
      return v !== null ? JSON.parse(v) : fallback;
    } catch { return fallback; }
  },
  set: (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  },
};

// Dispatch a StorageEvent so other tabs / usePolling hooks react immediately.
const broadcastStorage = (key, value) => {
  window.dispatchEvent(
    new StorageEvent('storage', { key, newValue: JSON.stringify(value) })
  );
};

// Dispatch a named CustomEvent for "Refresh Now" listeners.
const dispatchForceRefresh = () =>
  window.dispatchEvent(new CustomEvent('forceRefresh'));

// ── Settings ─────────────────────────────────────────────────────────────────
const Settings = () => {
  const [saveMessage,  setSaveMessage]  = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDirty,      setIsDirty]      = useState(false);

  // ── Dark mode (instant, no Save needed) ───────────────────────────────────
  const [darkMode, setDarkMode] = useState(() => LS.get('darkMode', false));

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
    LS.set('darkMode', darkMode);
    broadcastStorage('darkMode', darkMode);
  }, [darkMode]);

  // ── Other settings (require Save) ─────────────────────────────────────────
  const [settings, setSettings] = useState(() => ({
    notifications:   LS.get('notifications',   true),
    emailAlerts:     LS.get('emailAlerts',     false),
    smsAlerts:       LS.get('smsAlerts',       false),
    autoRefresh:     LS.get('autoRefresh',     true),
    refreshInterval: LS.get('refreshInterval', 30),
    // notification channels
    notifyLowStock:  LS.get('notifyLowStock',  true),
    notifyExpiry:    LS.get('notifyExpiry',    true),
    notifyOrders:    LS.get('notifyOrders',    false),
  }));

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    setIsDirty(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
    setIsDirty(true);
  };

  // ── Save ─────────────────────────────────────────────────────────────────
  const handleSave = (e) => {
    e.preventDefault();

    // Persist every key
    Object.entries(settings).forEach(([k, v]) => {
      LS.set(k, v);
      broadcastStorage(k, v);
    });

    setIsDirty(false);
    flash('✅ Settings saved successfully!');
  };

  // ── Refresh Now ──────────────────────────────────────────────────────────
  const handleRefreshNow = () => {
    setIsRefreshing(true);
    dispatchForceRefresh();          // other pages listen for this
    broadcastStorage('forceRefresh', Date.now());
    setTimeout(() => {
      setIsRefreshing(false);
      flash('🔄 Dashboard data refreshed!');
    }, 1200);
  };

  const flash = (msg, ms = 3000) => {
    setSaveMessage(msg);
    setTimeout(() => setSaveMessage(''), ms);
  };

  // ── UI helpers ─────────────────────────────────────────────────────────────
  const Toggle = ({ checked, onChange, disabled = false }) => (
    <label className="toggle-switch" style={{ opacity: disabled ? 0.4 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}>
      <input type="checkbox" checked={checked} onChange={onChange} disabled={disabled} />
      <span className={`toggle-slider ${checked && !disabled ? 'active' : ''}`} />
    </label>
  );

  const Row = ({ title, desc, children, indent = false }) => (
    <div className="settings-toggle-row" style={indent ? { paddingLeft: '20px', borderLeft: '2px solid #e0f7f4', marginLeft: '8px' } : {}}>
      <div className="settings-toggle-info">
        <h4 className="settings-toggle-title">{title}</h4>
        <p className="settings-toggle-description">{desc}</p>
      </div>
      {children}
    </div>
  );

  const notificationsOn = settings.notifications;

  return (
    <section className={`dashboard-container${darkMode ? ' dark-mode' : ''}`}>
      <Sidebar />

      <section className="main-wrapper">
        <TopBar />

        <main className="main-content">
          <h2 className="dashboard-heading" style={{ marginTop: '-20px' }}>⚙️ System Settings</h2>
          <p className="dashboard-subheading">Configure system preferences</p>

          {saveMessage && <div className="alert alert-success">{saveMessage}</div>}

          {isDirty && (
            <div className="alert" style={{ background: '#fff8e1', color: '#f57f17', border: '1px solid #ffe082', padding: '10px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', fontWeight: '600' }}>
              ⚠️ You have unsaved changes. Click <strong>Save Settings</strong> to apply them.
            </div>
          )}

          <form onSubmit={handleSave}>

            {/* ── Notifications ───────────────────────────────────────────── */}
            <section className="settings-card">
              <h3 className="section-title">🔔 Notifications</h3>

              <Row title="Enable Notifications" desc="Master switch for all alert types">
                <Toggle
                  checked={settings.notifications}
                  onChange={() => handleToggle('notifications')}
                />
              </Row>

              {/* Alert channels — only visible when notifications are on */}
              {notificationsOn && (
                <div style={{ marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <Row
                    title="Email Alerts"
                    desc="Send email notifications for critical alerts"
                    indent>
                    <Toggle
                      checked={settings.emailAlerts}
                      onChange={() => handleToggle('emailAlerts')}
                    />
                  </Row>

                  <Row
                    title="SMS Alerts"
                    desc="Send SMS notifications for critical stock alerts"
                    indent>
                    <Toggle
                      checked={settings.smsAlerts}
                      onChange={() => handleToggle('smsAlerts')}
                    />
                  </Row>
                </div>
              )}

              {/* Notification triggers */}
              <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #f0f0f0' }}>
                <p style={{ fontSize: '12px', fontWeight: '700', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 10px 0' }}>
                  Notify me when…
                </p>

                <Row
                  title="Low Stock Alert"
                  desc="Trigger when a vaccine batch falls below 100 doses"
                  indent>
                  <Toggle
                    checked={settings.notifyLowStock}
                    onChange={() => handleToggle('notifyLowStock')}
                    disabled={!notificationsOn}
                  />
                </Row>

                <Row
                  title="Expiry Warning"
                  desc="Trigger when a batch expires within 90 days"
                  indent>
                  <Toggle
                    checked={settings.notifyExpiry}
                    onChange={() => handleToggle('notifyExpiry')}
                    disabled={!notificationsOn}
                  />
                </Row>

                <Row
                  title="Order Status Change"
                  desc="Trigger when a vaccine order is updated"
                  indent>
                  <Toggle
                    checked={settings.notifyOrders}
                    onChange={() => handleToggle('notifyOrders')}
                    disabled={!notificationsOn}
                  />
                </Row>
              </div>

              {/* Live status summary */}
              <div style={{ marginTop: '14px', padding: '10px 14px', borderRadius: '8px', background: notificationsOn ? '#e8f5e9' : '#f5f5f5', fontSize: '12px', color: notificationsOn ? '#2e7d32' : '#aaa', fontWeight: '600', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span>{notificationsOn ? '✅' : '🔕'}</span>
                <span>
                  {notificationsOn
                    ? `Alerts active via: ${[settings.emailAlerts && 'Email', settings.smsAlerts && 'SMS'].filter(Boolean).join(', ') || 'in-app only'}`
                    : 'All notifications are disabled'}
                </span>
              </div>
            </section>

            {/* ── Auto Refresh ────────────────────────────────────────────── */}
            <section className="settings-card">
              <h3 className="section-title">🔄 Auto Refresh</h3>

              <Row title="Auto Refresh Dashboard" desc="Automatically poll for updated vaccine data">
                <Toggle
                  checked={settings.autoRefresh}
                  onChange={() => handleToggle('autoRefresh')}
                />
              </Row>

              {settings.autoRefresh && (
                <div className="settings-input-container" style={{ marginTop: '14px' }}>
                  <label htmlFor="refreshInterval" className="settings-input-label">
                    Refresh Interval (seconds)
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="number"
                      id="refreshInterval"
                      name="refreshInterval"
                      value={settings.refreshInterval}
                      onChange={handleChange}
                      min="10"
                      max="300"
                      className="settings-input-field"
                      style={{ maxWidth: '120px' }}
                    />
                    {/* Quick presets */}
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {[15, 30, 60, 120].map(s => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => { setSettings(p => ({ ...p, refreshInterval: s })); setIsDirty(true); }}
                          style={{
                            padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                            border: `1.5px solid ${Number(settings.refreshInterval) === s ? '#26a69a' : '#e0e0e0'}`,
                            background: Number(settings.refreshInterval) === s ? '#e0f7f4' : 'white',
                            color: Number(settings.refreshInterval) === s ? '#26a69a' : '#888',
                          }}>
                          {s}s
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="settings-helper-text">
                    ⏱️ Dashboard will refresh every <strong>{settings.refreshInterval}s</strong>
                    {' '}· next refresh in <strong>{settings.refreshInterval}s</strong> after saving
                  </p>
                </div>
              )}

              {!settings.autoRefresh && (
                <div style={{ marginTop: '10px', padding: '10px 14px', borderRadius: '8px', background: '#fff8e1', fontSize: '12px', color: '#f57f17', fontWeight: '600' }}>
                  ⚠️ Auto-refresh is off. Data will only update when you refresh the page manually.
                </div>
              )}

              <div className="settings-refresh-now" style={{ marginTop: '16px' }}>
                <button
                  type="button"
                  className={`btn-refresh-now${isRefreshing ? ' refreshing' : ''}`}
                  onClick={handleRefreshNow}
                  disabled={isRefreshing}>
                  <span className="refresh-icon">🔃</span>
                  {isRefreshing ? 'Refreshing...' : 'Refresh Now'}
                </button>
                <p className="settings-helper-text">Manually trigger an immediate data refresh across all pages</p>
              </div>
            </section>

            {/* ── Appearance ──────────────────────────────────────────────── */}
            <section className="settings-card">
              <h3 className="section-title">🎨 Appearance</h3>

              <Row
                title={darkMode ? '🌙 Dark Mode' : '☀️ Light Mode'}
                desc={darkMode ? 'Currently using dark theme — toggle to switch to light' : 'Currently using light theme — toggle to switch to dark'}>
                <Toggle
                  checked={darkMode}
                  onChange={() => setDarkMode(prev => !prev)}
                />
              </Row>

              <p style={{ fontSize: '12px', color: '#aaa', margin: '10px 0 0 0', fontStyle: 'italic' }}>
                💡 Dark mode applies instantly and does not require saving.
              </p>
            </section>

            {/* ── Danger Zone ─────────────────────────────────────────────── */}
            <section className="settings-card" style={{ borderLeft: '4px solid #ef9a9a' }}>
              <h3 className="section-title" style={{ color: '#c62828' }}>⚠️ Reset</h3>
              <p style={{ fontSize: '13px', color: '#888', marginBottom: '14px' }}>
                Reset all settings to their factory defaults. This cannot be undone.
              </p>
              <button
                type="button"
                style={{ padding: '9px 20px', borderRadius: '8px', border: '1.5px solid #e53935', background: 'white', color: '#e53935', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#e53935'; e.currentTarget.style.color = 'white'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#e53935'; }}
                onClick={() => {
                  if (!window.confirm('Reset all settings to defaults?')) return;
                  const defaults = {
                    notifications: true, emailAlerts: false, smsAlerts: false,
                    autoRefresh: true, refreshInterval: 30,
                    notifyLowStock: true, notifyExpiry: true, notifyOrders: false,
                  };
                  setSettings(defaults);
                  setDarkMode(false);
                  Object.entries(defaults).forEach(([k, v]) => { LS.set(k, v); broadcastStorage(k, v); });
                  LS.set('darkMode', false);
                  broadcastStorage('darkMode', false);
                  setIsDirty(false);
                  flash('🔁 Settings reset to defaults.');
                }}>
                🔁 Reset to Defaults
              </button>
            </section>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', opacity: isDirty ? 1 : 0.6, transition: 'opacity 0.2s' }}>
              💾 Save Settings
            </button>

          </form>
        </main>
      </section>
    </section>
  );
};

export default Settings;
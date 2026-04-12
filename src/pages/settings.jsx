// Settings.jsx

import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import '../styles/dashboard.css';
import '../styles/settings.css';

const Settings = () => {
  const [saveMessage, setSaveMessage] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const [settings, setSettings] = useState({
    notifications:   true,
    emailAlerts:     false,
    smsAlerts:       false,
    autoRefresh:     true,
    refreshInterval: 30,
  });

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSaveMessage('✅ Settings saved successfully!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleRefreshNow = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setSaveMessage('🔄 Dashboard data refreshed!');
      setTimeout(() => setSaveMessage(''), 3000);
    }, 1500);
  };

  return (
<section className={`dashboard-container${darkMode ? ' dark-mode' : ''}`}>
  <Sidebar />

  <section className="main-wrapper">

    <TopBar />

    <main className="main-content">

          <h2 className="dashboard-heading" style={{ marginTop: '-20px' }}>⚙️ System Settings</h2>
          <p className="dashboard-subheading">Configure system preferences</p>

          {saveMessage && (
            <div className="alert alert-success">{saveMessage}</div>
          )}

          <form onSubmit={handleSave}>

            {/* ── Notifications ── */}
            <section className="settings-card">
              <h3 className="section-title">🔔 Notifications</h3>

              <div className="settings-toggle-row">
                <div className="settings-toggle-info">
                  <h4 className="settings-toggle-title">Enable Notifications</h4>
                  <p className="settings-toggle-description">Receive alerts for stock updates</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.notifications}
                    onChange={() => handleToggle('notifications')}
                  />
                  <span className={`toggle-slider ${settings.notifications ? 'active' : ''}`} />
                </label>
              </div>

              <div className="settings-toggle-row">
                <div className="settings-toggle-info">
                  <h4 className="settings-toggle-title">Email Alerts</h4>
                  <p className="settings-toggle-description">Send email notifications for critical alerts</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.emailAlerts}
                    onChange={() => handleToggle('emailAlerts')}
                    disabled={!settings.notifications}
                  />
                  <span className={`toggle-slider ${settings.emailAlerts && settings.notifications ? 'active' : ''}`} />
                </label>
              </div>

              <div className="settings-toggle-row">
                <div className="settings-toggle-info">
                  <h4 className="settings-toggle-title">SMS Alerts</h4>
                  <p className="settings-toggle-description">Send SMS notifications for critical stock alerts</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.smsAlerts}
                    onChange={() => handleToggle('smsAlerts')}
                    disabled={!settings.notifications}
                  />
                  <span className={`toggle-slider ${settings.smsAlerts && settings.notifications ? 'active' : ''}`} />
                </label>
              </div>
            </section>

            {/* ── Auto Refresh ── */}
            <section className="settings-card">
              <h3 className="section-title">🔄 Auto Refresh</h3>

              <div className="settings-toggle-row">
                <div className="settings-toggle-info">
                  <h4 className="settings-toggle-title">Auto Refresh Dashboard</h4>
                  <p className="settings-toggle-description">Automatically refresh vaccine data</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.autoRefresh}
                    onChange={() => handleToggle('autoRefresh')}
                  />
                  <span className={`toggle-slider ${settings.autoRefresh ? 'active' : ''}`} />
                </label>
              </div>

              {settings.autoRefresh && (
                <div className="settings-input-container" style={{ marginTop: '12px' }}>
                  <label htmlFor="refreshInterval" className="settings-input-label">
                    Refresh Interval (seconds)
                  </label>
                  <input
                    type="number"
                    id="refreshInterval"
                    name="refreshInterval"
                    value={settings.refreshInterval}
                    onChange={handleChange}
                    min="10"
                    max="300"
                    className="settings-input-field"
                    style={{ maxWidth: '200px' }}
                  />
                  <p className="settings-helper-text">
                    ⏱️ Dashboard will refresh every {settings.refreshInterval} seconds
                  </p>
                </div>
              )}

              <div className="settings-refresh-now">
                <button
                  type="button"
                  className={`btn-refresh-now${isRefreshing ? ' refreshing' : ''}`}
                  onClick={handleRefreshNow}
                  disabled={isRefreshing}>
                  <span className="refresh-icon">🔃</span>
                  {isRefreshing ? 'Refreshing...' : 'Refresh Now'}
                </button>
                <p className="settings-helper-text">Manually trigger an immediate data refresh</p>
              </div>
            </section>

            {/* ── Appearance ── */}
            <section className="settings-card">
              <h3 className="section-title">🎨 Appearance</h3>

              <div className="settings-toggle-row">
                <div className="settings-toggle-info">
                  <h4 className="settings-toggle-title">
                    {darkMode ? '🌙 Dark Mode' : '☀️ Light Mode'}
                  </h4>
                  <p className="settings-toggle-description">
                    {darkMode ? 'Currently using dark theme' : 'Currently using light theme'}
                  </p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={darkMode}
                    onChange={() => setDarkMode(prev => !prev)}
                  />
                  <span className={`toggle-slider ${darkMode ? 'active' : ''}`} />
                </label>
              </div>
            </section>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              💾 Save Settings
            </button>

          </form>
        </main>
      </section>
    </section>
  );
};

export default Settings;
// settings.jsx

import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import '../styles/dashboard.css';
import '../styles/settings.css';
import { authData } from '../data/dashboardData';

const Settings = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    const stored = localStorage.getItem('lastLogin');
    if (!stored) {
      localStorage.setItem('lastLogin', new Date().toISOString());
    }
  }, []);

  const lastLoginRaw = localStorage.getItem('lastLogin');
  const lastLoginDisplay = lastLoginRaw
    ? new Date(lastLoginRaw).toLocaleString('en-PH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : 'N/A';

  const [settings, setSettings] = useState({
    notifications: true,
    emailAlerts: false,
    smsAlerts: false,
    autoRefresh: true,
    refreshInterval: 30,
    language: 'en',
    adminUsername: localStorage.getItem('adminUsername') || authData.defaultUsername,
    adminPassword: localStorage.getItem('adminPassword') || authData.defaultPassword,
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

    // Save to localStorage
    localStorage.setItem('adminUsername', settings.adminUsername);
    localStorage.setItem('adminPassword', settings.adminPassword);
    setSaveMessage('✅ Settings saved successfully!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  // Manual Refresh Now handler
  const handleRefreshNow = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setSaveMessage('🔄 Dashboard data refreshed!');
      setTimeout(() => setSaveMessage(''), 3000);
    }, 1500);
  };

  // ── Eye SVG icons ──
  const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );

  const EyeOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8
               a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8
               a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );

  return (
    <section className={`dashboard-container${darkMode ? ' dark-mode' : ''}`}>

      <button
        type="button"
        className="mobile-menu-toggle"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
        ☰
      </button>

      <Sidebar
        isMobileMenuOpen={isMobileMenuOpen}
        onMenuClose={() => setIsMobileMenuOpen(false)}
      />

      {isMobileMenuOpen && (
        <div className="overlay" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      <main className="main-content">

        <h2 className="dashboard-heading">⚙️ Admin Settings</h2>
        <p className="dashboard-subheading">Configure system preferences</p>

        {saveMessage && (
          <div className="alert alert-success">{saveMessage}</div>
        )}

        <form onSubmit={handleSave}>

          {/* ── Admin Profile ── */}
          <div className="settings-card">
            <h3 className="section-title">👤 Admin Profile</h3>

            {/* Last Login Info */}
            <div className="settings-last-login">
              <span className="last-login-icon">🕐</span>
              <div className="last-login-text">
                <span className="last-login-label">Last Login</span>
                <span className="last-login-value">{lastLoginDisplay}</span>
              </div>
            </div>

            <div className="settings-input-container">
              <label htmlFor="adminUsername" className="settings-input-label">Username</label>
              <input
                type="text"
                id="adminUsername"
                name="adminUsername"
                value={settings.adminUsername}
                onChange={handleChange}
                className="settings-input-field"
                placeholder="Enter new username"
              />
            </div>

            <div className="settings-input-container">
              <label htmlFor="adminPassword" className="settings-input-label">Password</label>

              {/* Password field with eye toggle */}
              <div className="password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="adminPassword"
                  name="adminPassword"
                  value={settings.adminPassword}
                  onChange={handleChange}
                  className="settings-input-field"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(prev => !prev)}
                  title={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <div className="settings-input-container">
              <label htmlFor="language" className="settings-input-label">Language</label>
              <select
                id="language"
                name="language"
                value={settings.language}
                onChange={handleChange}
                className="settings-select">
                <option value="en">English</option>
                <option value="fil">Filipino</option>
              </select>
            </div>
          </div>

          {/* ── Notifications ── */}
          <div className="settings-card">
            <h3 className="section-title">🔔 Notifications</h3>

            <div className="settings-toggle-row">
              <div className="settings-toggle-info">
                <h4 className="settings-toggle-title">Enable Notifications</h4>
                <p className="settings-toggle-description">
                  Receive alerts for stock updates
                </p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={() => handleToggle('notifications')}
                />
                <span className={`toggle-slider ${settings.notifications ? 'active' : ''}`}></span>
              </label>
            </div>

            <div className="settings-toggle-row">
              <div className="settings-toggle-info">
                <h4 className="settings-toggle-title">Email Alerts</h4>
                <p className="settings-toggle-description">
                  Send email notifications for critical alerts
                </p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.emailAlerts}
                  onChange={() => handleToggle('emailAlerts')}
                  disabled={!settings.notifications}
                />
                <span className={`toggle-slider ${settings.emailAlerts && settings.notifications ? 'active' : ''}`}></span>
              </label>
            </div>

            <div className="settings-toggle-row">
              <div className="settings-toggle-info">
                <h4 className="settings-toggle-title">SMS Alerts</h4>
                <p className="settings-toggle-description">
                  Send SMS notifications for critical stock alerts
                </p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.smsAlerts}
                  onChange={() => handleToggle('smsAlerts')}
                  disabled={!settings.notifications}
                />
                <span className={`toggle-slider ${settings.smsAlerts && settings.notifications ? 'active' : ''}`}></span>
              </label>
            </div>
          </div>

          {/* ── Auto Refresh ── */}
          <div className="settings-card">
            <h3 className="section-title">🔄 Auto Refresh</h3>

            <div className="settings-toggle-row">
              <div className="settings-toggle-info">
                <h4 className="settings-toggle-title">Auto Refresh Dashboard</h4>
                <p className="settings-toggle-description">
                  Automatically refresh vaccine data
                </p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.autoRefresh}
                  onChange={() => handleToggle('autoRefresh')}
                />
                <span className={`toggle-slider ${settings.autoRefresh ? 'active' : ''}`}></span>
              </label>
            </div>

            {settings.autoRefresh && (
              <div className="settings-input-container">
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
                />
                <p className="settings-helper-text">
                  ⏱️ Dashboard will refresh every {settings.refreshInterval} seconds
                </p>
              </div>
            )}

            {/* Manual Refresh Now button */}
            <div className="settings-refresh-now">
              <button
                type="button"
                className={`btn-refresh-now${isRefreshing ? ' refreshing' : ''}`}
                onClick={handleRefreshNow}
                disabled={isRefreshing}>
                <span className="refresh-icon">🔃</span>
                {isRefreshing ? 'Refreshing...' : 'Refresh Now'}
              </button>
              <p className="settings-helper-text">
                Manually trigger an immediate data refresh
              </p>
            </div>
          </div>

          {/* ── Appearance ── */}
          <div className="settings-card">
            <h3 className="section-title">🎨 Appearance</h3>

            <div className="settings-toggle-row">
              <div className="settings-toggle-info">
                <h4 className="settings-toggle-title">
                  {darkMode ? '🌙 Dark Mode' : '☀️ Light Mode'}
                </h4>
                <p className="settings-toggle-description">
                  {darkMode
                    ? 'Currently using dark theme'
                    : 'Currently using light theme'}
                </p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={darkMode}
                  onChange={() => setDarkMode(prev => !prev)}
                />
                <span className={`toggle-slider ${darkMode ? 'active' : ''}`}></span>
              </label>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            💾 Save Settings
          </button>

        </form>
      </main>
    </section>
  );
};

export default Settings;
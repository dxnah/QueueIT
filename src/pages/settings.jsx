// Settings.jsx

import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import '../styles/dashboard.css';
import '../styles/settings.css';
import { authData } from '../data/dashboardData';

const Settings = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [saveMessage, setSaveMessage]           = useState('');
  const [showPassword, setShowPassword]         = useState(false);

  const [settings, setSettings] = useState({
    notifications:   true,
    emailAlerts:     false,
    autoRefresh:     true,
    refreshInterval: 30,
    language:        'en',
    adminUsername:   localStorage.getItem('adminUsername') || authData.defaultUsername,
    adminPassword:   localStorage.getItem('adminPassword') || authData.defaultPassword,
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
    localStorage.setItem('adminUsername', settings.adminUsername);
    localStorage.setItem('adminPassword', settings.adminPassword);
    setSaveMessage('✅ Settings saved successfully!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  // ── Eye SVG icons ──
  const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">                               {/* ✅ aria-hidden */}
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );

  const EyeOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">                               {/* ✅ aria-hidden */}
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8
               a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8
               a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );

  return (
    <div className="dashboard-container">

      <button
        type="button"
        className="mobile-menu-toggle"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle navigation menu"
        aria-expanded={isMobileMenuOpen}>
        ☰
      </button>

      <Sidebar
        isMobileMenuOpen={isMobileMenuOpen}
        onMenuClose={() => setIsMobileMenuOpen(false)}
      />

      {isMobileMenuOpen && (
        <div
          className="overlay"
          onClick={() => setIsMobileMenuOpen(false)}
          role="presentation"
        />
      )}

      <main className="main-content">
        <header>
          <h1 className="dashboard-heading">⚙️ Admin Settings</h1>
          <p className="dashboard-subheading">Configure system preferences</p>
        </header>

        {saveMessage && (
          <p className="alert alert-success" role="status">{saveMessage}</p>
        )}

        <form onSubmit={handleSave}>

          {/* ── Admin Profile ── */}
          <section className="settings-card" aria-label="Admin profile settings">
            <h2 className="section-title">👤 Admin Profile</h2>

            <div className="settings-input-container">
              <label htmlFor="settings-username" className="settings-input-label">
                Username
              </label>
              <input
                type="text"
                id="settings-username"
                name="adminUsername"
                value={settings.adminUsername}
                onChange={handleChange}
                className="settings-input-field"
                placeholder="Enter new username"
                autoComplete="username"
              />
            </div>

            <div className="settings-input-container">
              <label htmlFor="settings-password" className="settings-input-label">
                Password
              </label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="settings-password"
                  name="adminPassword"
                  value={settings.adminPassword}
                  onChange={handleChange}
                  className="settings-input-field"
                  placeholder="Enter new password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(prev => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <div className="settings-input-container">
              <label htmlFor="settings-language" className="settings-input-label">
                Language
              </label>
              <select
                id="settings-language"
                name="language"
                value={settings.language}
                onChange={handleChange}
                className="settings-select">
                <option value="en">English</option>
                <option value="fil">Filipino</option>
              </select>
            </div>
          </section>

          {/* ── Notifications ── */}
          <section className="settings-card" aria-label="Notification settings">
            <h2 className="section-title">🔔 Notifications</h2>

            <div className="settings-toggle-row">
              <div className="settings-toggle-info">
                <h3 className="settings-toggle-title">Enable Notifications</h3>
                <p className="settings-toggle-description">
                  Receive alerts for stock updates
                </p>
              </div>
              <label className="toggle-switch" aria-label="Enable notifications">
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
                <h3 className="settings-toggle-title">Email Alerts</h3>
                <p className="settings-toggle-description">
                  Send email notifications for critical alerts
                </p>
              </div>
              <label className="toggle-switch" aria-label="Enable email alerts">
                <input
                  type="checkbox"
                  checked={settings.emailAlerts}
                  onChange={() => handleToggle('emailAlerts')}
                  disabled={!settings.notifications}
                />
                <span className={`toggle-slider ${settings.emailAlerts && settings.notifications ? 'active' : ''}`}></span>
              </label>
            </div>
          </section>

          {/* ── Auto Refresh ── */}
          <section className="settings-card" aria-label="Auto refresh settings">
            <h2 className="section-title">🔄 Auto Refresh</h2>

            <div className="settings-toggle-row">
              <div className="settings-toggle-info">
                <h3 className="settings-toggle-title">Auto Refresh Dashboard</h3>
                <p className="settings-toggle-description">
                  Automatically refresh vaccine data
                </p>
              </div>
              <label className="toggle-switch" aria-label="Enable auto refresh">
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
                <label htmlFor="settings-interval" className="settings-input-label">
                  Refresh Interval (seconds)
                </label>
                <input
                  type="number"
                  id="settings-interval"
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
          </section>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            💾 Save Settings
          </button>

        </form>
      </main>
    </div>
  );
};

export default Settings;
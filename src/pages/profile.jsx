// pages/Profile.jsx

import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import '../styles/dashboard.css';
import '../styles/profile.css';
import { authData } from '../data/dashboardData';

const Profile = () => {
  const [saveMessage, setSaveMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // ── Read the timestamp stamped at login time ────────────────────────────────
  const lastLoginRaw = localStorage.getItem('lastLogin');
  const lastLoginDisplay = lastLoginRaw
    ? new Date(lastLoginRaw).toLocaleString('en-PH', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      })
    : 'N/A';

  const [form, setForm] = useState({
    username: localStorage.getItem('adminUsername') || authData?.defaultUsername || 'Admin',
    password: localStorage.getItem('adminPassword') || authData?.defaultPassword || '',
    language: localStorage.getItem('adminLanguage') || 'en',
    email:    localStorage.getItem('adminEmail')    || authData?.defaultEmail    || '',
    role:     'System Administrator',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('adminUsername', form.username);
    localStorage.setItem('adminPassword', form.password);
    localStorage.setItem('adminLanguage', form.language);
    localStorage.setItem('adminEmail',    form.email);
    setSaveMessage('saved');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );

  const EyeOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );

  return (
    <section className="dashboard-container">
      <Sidebar />
      <section className="main-wrapper">
        <TopBar />
        <main className="main-content">

          <header>
            <h1 className="dashboard-heading">👤 Admin Profile</h1>
            <p className="dashboard-subheading">Manage your account information</p>
          </header>

          <div className="profile-layout">

            {/* ── LEFT: Avatar card ── */}
            <aside className="profile-avatar-card">
              {/* Decorative banner */}
              <div className="profile-banner">
                <div className="profile-banner-pattern" />
              </div>

              <div className="profile-avatar-wrap">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(form.username)}&background=26a69a&color=fff&size=160&bold=true`}
                  alt="avatar"
                  className="profile-avatar-img"
                />
                <span className="profile-avatar-crown">👑</span>
              </div>

              <h2 className="profile-avatar-name">{form.username}</h2>
              <span className="profile-avatar-role-pill">System Administrator</span>
              <p className="profile-avatar-email">{form.email}</p>

              <div className="profile-pills-row">
                <div className="profile-pill">
                  <span className="profile-pill-dot" style={{ background: '#4caf50' }} />
                  Active
                </div>
                <div className="profile-pill">
                  {form.language === 'fil' ? 'PH' : 'US'}
                  &nbsp;{form.language === 'fil' ? 'Filipino' : 'English'}
                </div>
              </div>

              <div className="profile-login-box">
                <div className="profile-login-icon">🕐</div>
                <div>
                  <p className="profile-login-label">Last Login</p>
                  <p className="profile-login-value">{lastLoginDisplay}</p>
                </div>
              </div>
            </aside>

            {/* ── RIGHT ── */}
            <div className="profile-right">

              {/* Account details card */}
              <div className="profile-card">
                <div className="profile-card-header">
                  <div className="profile-card-header-icon">✏️</div>
                  <div>
                    <h3 className="profile-card-title">Account Details</h3>
                    <p className="profile-card-sub">You can edit your profile anytime</p>
                  </div>
                  {saveMessage === 'saved' && (
                    <div className="profile-saved-pill">✅ Saved!</div>
                  )}
                </div>

                <form onSubmit={handleSave} className="profile-form">

                  {/* Row: Username + Email */}
                  <div className="profile-form-row">
                    <div className="profile-field-group">
                      <label className="profile-field-label">Username</label>
                      <div className="profile-input-wrap">
                        <span className="profile-input-icon">👤</span>
                        <input
                          type="text"
                          name="username"
                          value={form.username}
                          onChange={handleChange}
                          required
                          className="profile-field-input"
                          placeholder="Enter username"
                        />
                      </div>
                    </div>

                    <div className="profile-field-group">
                      <label className="profile-field-label">Email Address</label>
                      <div className="profile-input-wrap">
                        <span className="profile-input-icon">✉️</span>
                        <input
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          className="profile-field-input"
                          placeholder="Enter email"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Row: Role (read-only) + Language */}
                  <div className="profile-form-row">
                    <div className="profile-field-group">
                      <label className="profile-field-label">Role</label>
                      <div className="profile-input-wrap profile-input-readonly">
                        <span className="profile-input-icon">🏷️</span>
                        <span className="profile-field-static">{form.role}</span>
                        <span className="profile-readonly-badge">Read-only</span>
                      </div>
                    </div>

                    <div className="profile-field-group">
                      <label className="profile-field-label">Language</label>
                      <div className="profile-input-wrap">
                        <span className="profile-input-icon">🌐</span>
                        <select
                          name="language"
                          value={form.language}
                          onChange={handleChange}
                          className="profile-field-input profile-field-select">
                          <option value="en">US English</option>
                          <option value="fil">PH Filipino</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Password full-width */}
                  <div className="profile-form-row profile-form-row--single">
                    <div className="profile-field-group">
                      <label className="profile-field-label">Password</label>
                      <div className="profile-input-wrap">
                        <span className="profile-input-icon">🔒</span>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={form.password}
                          onChange={handleChange}
                          className="profile-field-input"
                          placeholder="Enter password"
                        />
                        <button
                          type="button"
                          className="profile-eye-btn"
                          onClick={() => setShowPassword(p => !p)}>
                          {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Save */}
                  <button type="submit" className="profile-save-btn">
                    💾 Save Settings
                  </button>

                </form>
              </div>

              {/* Security card */}
              <div className="profile-card profile-security-card">
                <div className="profile-card-header" style={{ marginBottom: '16px' }}>
                  <div className="profile-card-header-icon">🔒</div>
                  <div>
                    <h3 className="profile-card-title">Security</h3>
                    <p className="profile-card-sub">Account security information</p>
                  </div>
                </div>

                <div className="profile-security-grid">
                  <div className="profile-security-item">
                    <div className="profile-security-icon-wrap" style={{ background: '#e8f5e9' }}>🛡️</div>
                    <div>
                      <p className="profile-security-title">Account Status</p>
                      <p className="profile-security-value" style={{ color: '#26a69a' }}>Active &amp; Secure</p>
                    </div>
                  </div>

                  <div className="profile-security-item">
                    <div className="profile-security-icon-wrap" style={{ background: '#fff8e1' }}>🔑</div>
                    <div>
                      <p className="profile-security-title">Password</p>
                      <p className="profile-security-value">Last changed this session</p>
                    </div>
                  </div>

                  <div className="profile-security-item">
                    <div className="profile-security-icon-wrap" style={{ background: '#e3f2fd' }}>📍</div>
                    <div>
                      <p className="profile-security-title">Last Login</p>
                      <p className="profile-security-value">{lastLoginDisplay}</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </main>
      </section>
    </section>
  );
};

export default Profile;
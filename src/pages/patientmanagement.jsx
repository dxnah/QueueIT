// src/pages/patientmanagement.jsx

import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import { patientAPI } from '../services/api';
import '../styles/dashboard.css';
import '../styles/patientmanagement.css';

// ── Helpers ──────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  '#26a69a','#5c6bc0','#ef5350','#ab47bc',
  '#26c6da','#66bb6a','#ffa726','#ec407a',
];

const getAvatarColor = (id) => AVATAR_COLORS[(id - 1) % AVATAR_COLORS.length];

const getInitials = (name = '') => {
  const parts = name.trim().split(' ');
  return parts.length >= 2
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    : name.slice(0, 2).toUpperCase();
};

const formatLastLogin = (iso) => {
  if (!iso) return 'Never';
  return new Date(iso).toLocaleString('en-PH', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

// ── Patient Detail Panel ──────────────────────────────────────────────────────

const PatientDetailPanel = ({ user, onClose }) => {
  const [activeTab, setActiveTab] = useState('register');
  const [registerForm, setRegisterForm] = useState({
    first_name:    user.name ? user.name.split(' ')[0] : '',
    last_name:     user.name ? user.name.split(' ').slice(1).join(' ') : '',
    email:         user.email || '',
    phone:         user.phone || '',
    date_of_birth: '',
    address:       '',
    gender:        '',
    notes:         '',
  });
  const [formSaved, setFormSaved] = useState(false);

  // ── Not connected to backend yet — will be replaced with API calls ──
  const history   = [];
  const schedules = [];

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    // TODO: POST to /api/patients/
    setFormSaved(true);
    setTimeout(() => setFormSaved(false), 3000);
  };

  const tabs = [
    { key: 'register', label: '📋 Register' },
    { key: 'history',  label: `💉 History (${history.length})` },
    { key: 'schedule', label: `📅 Schedule (${schedules.length})` },
  ];

  return (
    <div className="pm-panel-overlay" onClick={onClose}>
      <div className="pm-panel" onClick={e => e.stopPropagation()}>

        <div className="pm-panel-header">
          <div className="pm-panel-avatar" style={{ background: getAvatarColor(user.id) }}>
            {getInitials(user.name)}
          </div>
          <div className="pm-panel-header-info">
            <h3 className="pm-panel-name">{user.name}</h3>
            <p className="pm-panel-email">{user.username ? `@${user.username}` : user.email}</p>
          </div>
          <button className="pm-panel-close" onClick={onClose}>✕</button>
        </div>

        <div className="pm-tabs">
          {tabs.map(t => (
            <button key={t.key}
              className={`pm-tab ${activeTab === t.key ? 'pm-tab--active' : ''}`}
              onClick={() => setActiveTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="pm-panel-body">

          {/* ── Register Tab ── */}
          {activeTab === 'register' && (
            <div>
              <p className="pm-section-note">
                Register this patient in the backend system. Fields are pre-filled from existing data.
              </p>
              {formSaved && (
                <div className="alert alert-success">✅ Patient registered successfully!</div>
              )}
              <form onSubmit={handleRegisterSubmit}>
                <div className="pm-form-grid">
                  <div className="pm-form-field">
                    <label className="pm-form-label">First Name</label>
                    <input className="pm-form-input" type="text" required
                      value={registerForm.first_name}
                      onChange={e => setRegisterForm(p => ({ ...p, first_name: e.target.value }))}
                      placeholder="First name" />
                  </div>
                  <div className="pm-form-field">
                    <label className="pm-form-label">Last Name</label>
                    <input className="pm-form-input" type="text" required
                      value={registerForm.last_name}
                      onChange={e => setRegisterForm(p => ({ ...p, last_name: e.target.value }))}
                      placeholder="Last name" />
                  </div>
                </div>
                <div className="pm-form-grid">
                  <div className="pm-form-field">
                    <label className="pm-form-label">Email</label>
                    <input className="pm-form-input" type="email"
                      value={registerForm.email}
                      onChange={e => setRegisterForm(p => ({ ...p, email: e.target.value }))}
                      placeholder="email@example.com" />
                  </div>
                  <div className="pm-form-field">
                    <label className="pm-form-label">Phone</label>
                    <input className="pm-form-input" type="text"
                      value={registerForm.phone}
                      onChange={e => setRegisterForm(p => ({ ...p, phone: e.target.value }))}
                      placeholder="+63 9XX XXX XXXX" />
                  </div>
                </div>
                <div className="pm-form-grid">
                  <div className="pm-form-field">
                    <label className="pm-form-label">Date of Birth</label>
                    <input className="pm-form-input" type="date"
                      value={registerForm.date_of_birth}
                      onChange={e => setRegisterForm(p => ({ ...p, date_of_birth: e.target.value }))} />
                  </div>
                  <div className="pm-form-field">
                    <label className="pm-form-label">Gender</label>
                    <select className="pm-form-input pm-form-select"
                      value={registerForm.gender}
                      onChange={e => setRegisterForm(p => ({ ...p, gender: e.target.value }))}>
                      <option value="">— Select —</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="pm-form-field">
                  <label className="pm-form-label">Address</label>
                  <input className="pm-form-input" type="text"
                    value={registerForm.address}
                    onChange={e => setRegisterForm(p => ({ ...p, address: e.target.value }))}
                    placeholder="Full address" />
                </div>
                <div className="pm-form-field">
                  <label className="pm-form-label">Notes</label>
                  <textarea className="pm-form-input pm-form-textarea"
                    value={registerForm.notes}
                    onChange={e => setRegisterForm(p => ({ ...p, notes: e.target.value }))}
                    placeholder="Any medical notes or allergies..." />
                </div>
                <button type="submit" className="pm-form-submit">📋 Register Patient</button>
              </form>
            </div>
          )}

          {/* ── History Tab ── */}
          {activeTab === 'history' && (
            <div>
              <p className="pm-section-note">Vaccination records administered to this patient.</p>
              <div className="pm-empty">
                <div className="pm-empty-icon">💉</div>
                <p>Vaccination history is not yet connected to the backend.</p>
                <p style={{ fontSize:'11px', color:'#ccc', marginTop:'6px' }}>
                  Will be available once the API endpoint is connected.
                </p>
              </div>
            </div>
          )}

          {/* ── Schedule Tab ── */}
          {activeTab === 'schedule' && (
            <div>
              <p className="pm-section-note">Upcoming and past vaccination schedules.</p>
              <div className="pm-empty">
                <div className="pm-empty-icon">📅</div>
                <p>Schedule data is not yet connected to the backend.</p>
                <p style={{ fontSize:'11px', color:'#ccc', marginTop:'6px' }}>
                  Will be available once the API endpoint is connected.
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────

const PatientManagement = () => {
  const [users, setUsers]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [apiError, setApiError]         = useState(null);
  const [saveMessage, setSaveMessage]   = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery]   = useState('');

  const loadPatients = async () => {
    try {
      setLoading(true);
      setApiError(null);
      const data = await patientAPI.getAll();
      setUsers(data);
    } catch (err) {
      setApiError('Could not connect to server. Showing available data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPatients(); }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this patient? This cannot be undone.')) return;
    try {
      await patientAPI.delete(id);
      setUsers(prev => prev.filter(u => u.id !== id));
      setSaveMessage('✅ Patient deleted.');
    } catch {
      setSaveMessage('❌ Delete failed.');
    }
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const totalUsers = users.length;

  const filtered = users.filter(u => {
    const q = searchQuery.toLowerCase();
    return !q
      || (u.name     || '').toLowerCase().includes(q)
      || (u.email    || '').toLowerCase().includes(q)
      || (u.username || '').toLowerCase().includes(q)
      || (u.phone    || '').toLowerCase().includes(q);
  });

  return (
    <section className="dashboard-container">
      <Sidebar />

      {selectedUser && (
        <PatientDetailPanel
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}

      <section className="main-wrapper">
        <TopBar />
        <main className="main-content">

          <header>
            <h1 className="dashboard-heading">🧑‍⚕️ Patient Management</h1>
            <p className="dashboard-subheading">Manage registered patients</p>
          </header>

          <div className="stats-container">
            <div className="stat-box" style={{ borderTopColor:'#26a69a' }}>
              <h3 className="stat-title">Total Patients</h3>
              <p className="stat-number" style={{ color:'#26a69a' }}>{totalUsers}</p>
              <p className="stat-note">👥 Registered accounts</p>
            </div>
          </div>

          {apiError    && <div className="alert" style={{ background:'#fff3e0', color:'#e65100', border:'1px solid #ffcc80' }}>{apiError}</div>}
          {saveMessage && <div className="alert alert-success">{saveMessage}</div>}

          <div className="um-filters">
            <div className="um-search-wrapper">
              <span className="um-search-icon">🔍</span>
              <input
                type="text"
                className="um-search-input"
                placeholder="Search by name, email, username..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="um-search-clear" onClick={() => setSearchQuery('')} type="button">✕</button>
              )}
            </div>
            <span className="um-results-count">
              {filtered.length} of {totalUsers} patient{totalUsers !== 1 ? 's' : ''}
            </span>
          </div>

          {loading ? (
            <div style={{ padding:'40px', textAlign:'center', color:'#aaa' }}>
              <div style={{ fontSize:'32px', marginBottom:'12px' }}>⏳</div>
              Loading patients...
            </div>
          ) : (
            <div className="vaccine-card um-table-card">
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Username</th>
                      <th>Phone</th>
                      <th>Last Login</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length > 0 ? filtered.map(user => {
                      return (
                        <tr key={user.id} className="um-table-row"
                          onClick={() => setSelectedUser(user)}
                          title="Click to view patient details">

                          <td>
                            <div className="um-user-cell">
                              <div className="um-avatar" style={{ background: getAvatarColor(user.id) }}>
                                {getInitials(user.name)}
                              </div>
                              <div>
                                <div className="um-user-name">{user.name}</div>
                                <div className="um-user-email">{user.email}</div>
                              </div>
                            </div>
                          </td>

                          <td>
                            <span className="um-username-badge">@{user.username}</span>
                          </td>

                          <td style={{ fontSize:'13px', color:'#555' }}>
                            {user.phone || '—'}
                          </td>

                          <td>
                            <div style={{ fontSize:'12px', color:'#888' }}>
                              {formatLastLogin(user.last_login)}
                            </div>
                          </td>

                          <td onClick={e => e.stopPropagation()}>
                            <div className="um-actions">
                              <button type="button"
                                onClick={() => setSelectedUser(user)}
                                className="um-btn-view">
                                👁️ View
                              </button>
                              <button type="button"
                                className="um-btn-delete"
                                onClick={e => handleDelete(e, user.id)}>
                                🗑️ Delete
                              </button>
                            </div>
                          </td>

                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan="5" style={{ textAlign:'center', padding:'40px', color:'#aaa' }}>
                          👤 No patients found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </main>
      </section>
    </section>
  );
};

export default PatientManagement;
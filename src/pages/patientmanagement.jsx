// pages/patientmanagement.jsx

import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import { usersData } from '../data/dashboardData';
import '../styles/dashboard.css';
import '../styles/patientmanagement.css';
import { MOCK_VACCINATION_HISTORY, MOCK_SCHEDULES } from '../data/mockHistory';

const AVATAR_COLORS = [
  '#26a69a','#5c6bc0','#ef5350','#ab47bc',
  '#26c6da','#66bb6a','#ffa726','#ec407a',
];

const getAvatarColor = (id) => AVATAR_COLORS[(id - 1) % AVATAR_COLORS.length];

const formatLastLogin = (iso) => {
  if (!iso) return 'Never';
  return new Date(iso).toLocaleString('en-PH', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-PH', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
};


const scheduleStatusStyle = (s) => {
  const map = {
    scheduled:  { bg: '#e3f2fd', color: '#1565c0', border: '#90caf9' },
    completed:  { bg: '#e8f5e9', color: '#2e7d32', border: '#a5d6a7' },
    cancelled:  { bg: '#ffebee', color: '#c62828', border: '#ef9a9a' },
    missed:     { bg: '#fff3e0', color: '#e65100', border: '#ffcc80' },
  };
  return map[s] || map.scheduled;
};

// ── Patient Detail Panel ───────────────────────────────────────────────────────
const PatientDetailPanel = ({ user, onClose }) => {
  const [activeTab, setActiveTab] = useState('register');
  const [registerForm, setRegisterForm] = useState({
    first_name:   user.name.split(' ')[0] || '',
    last_name:    user.name.split(' ').slice(1).join(' ') || '',
    email:        user.email || '',
    phone:        user.phone || '',
    date_of_birth: '',
    address:      '',
    gender:       '',
    notes:        '',
  });
  const [formSaved, setFormSaved] = useState(false);

  const history   = MOCK_VACCINATION_HISTORY[user.id] || [];
  const schedules = MOCK_SCHEDULES[user.id] || [];

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    // TODO: POST to /api/patients/ with registerForm data
    // const res = await fetch('/api/patients/', { method: 'POST', body: JSON.stringify(registerForm) });
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

        {/* Panel Header */}
        <div className="pm-panel-header">
          <div className="pm-panel-avatar" style={{ background: getAvatarColor(user.id) }}>
            {user.avatar}
          </div>
          <div className="pm-panel-header-info">
            <h3 className="pm-panel-name">{user.name}</h3>
            <p className="pm-panel-email">{user.email}</p>
            <span className={`pm-panel-status ${user.status === 'Active' ? 'pm-status-active' : 'pm-status-inactive'}`}>
              {user.status}
            </span>
          </div>
          <button className="pm-panel-close" onClick={onClose}>✕</button>
        </div>

        {/* Tabs */}
        <div className="pm-tabs">
          {tabs.map(t => (
            <button
              key={t.key}
              className={`pm-tab ${activeTab === t.key ? 'pm-tab--active' : ''}`}
              onClick={() => setActiveTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="pm-panel-body">

          {/* ── Register Tab ── */}
          {activeTab === 'register' && (
            <div>
              <p className="pm-section-note">
                Register this patient in the backend system. Fields are pre-filled from existing data.
              </p>
              {formSaved && (
                <div className="alert alert-success" style={{ marginBottom: '14px' }}>
                  ✅ Patient registered successfully!
                </div>
              )}
              <form onSubmit={handleRegisterSubmit} className="pm-register-form">
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
                    <input className="pm-form-input" type="email" required
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
              </form>
            </div>
          )}

          {/* ── History Tab ── */}
          {activeTab === 'history' && (
            <div>
              <p className="pm-section-note">
                Vaccination records administered to this patient.
              </p>
              {history.length === 0 ? (
                <div className="pm-empty">
                  <div className="pm-empty-icon">💉</div>
                  <p>No vaccination history yet.</p>
                </div>
              ) : (
                <div className="pm-history-list">
                  {history.map(record => (
                    <div key={record.id} className="pm-history-card">
                      <div className="pm-history-top">
                        <span className="pm-history-vaccine">{record.vaccine}</span>
                        <span className="pm-history-date">{formatDate(record.date_administered)}</span>
                      </div>
                      <div className="pm-history-meta">
                        <span>👨‍⚕️ {record.administered_by}</span>
                      </div>
                      {record.notes && (
                        <p className="pm-history-notes">{record.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Schedule Tab ── */}
          {activeTab === 'schedule' && (
            <div>
              <p className="pm-section-note">
                Upcoming and past vaccination schedules for this patient.
              </p>
              {schedules.length === 0 ? (
                <div className="pm-empty">
                  <div className="pm-empty-icon">📅</div>
                  <p>No schedules found.</p>
                </div>
              ) : (
                <div className="pm-schedule-list">
                  {schedules.map(sched => {
                    const st = scheduleStatusStyle(sched.status);
                    return (
                      <div key={sched.id} className="pm-schedule-card">
                        <div className="pm-schedule-top">
                          <span className="pm-schedule-vaccine">{sched.vaccine}</span>
                          <span className="pm-schedule-badge"
                            style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}` }}>
                            {sched.status.charAt(0).toUpperCase() + sched.status.slice(1)}
                          </span>
                        </div>
                        <div className="pm-schedule-date">
                          📅 {formatDate(sched.scheduled_date)}
                        </div>
                        {sched.notes && (
                          <p className="pm-schedule-notes">{sched.notes}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
const PatientManagement = () => {
  const [users, setUsers]               = useState(usersData);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery,  setSearchQuery]  = useState('');
  const [saveMessage,  setSaveMessage]  = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  const totalUsers    = users.length;
  const activeUsers   = users.filter(u => u.status === 'Active').length;
  const inactiveUsers = users.filter(u => u.status === 'Inactive').length;

  const filteredUsers = users.filter(u => {
    const matchStatus = filterStatus === 'all' || u.status === filterStatus;
    const q = searchQuery.toLowerCase();
    const matchSearch = !q
      || u.name.toLowerCase().includes(q)
      || u.email.toLowerCase().includes(q)
      || u.username.toLowerCase().includes(q)
      || u.phone.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const handleToggleStatus = (id) => {
    setUsers(prev => prev.map(u =>
      u.id === id
        ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' }
        : u
    ));
    const user = users.find(u => u.id === id);
    const next = user.status === 'Active' ? 'Inactive' : 'Active';
    setSaveMessage(`✅ ${user.name} set to ${next}.`);
    setTimeout(() => setSaveMessage(''), 3000);
  };

  return (
    <section className="dashboard-container">
      <Sidebar />

      {/* Detail Panel */}
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
            <p className="dashboard-subheading">Manage registered patients and their account access</p>
          </header>

          {/* ── Stats ── */}
          <div className="stats-container">
            <div className="stat-box" style={{ borderTopColor: '#26a69a' }}>
              <h3 className="stat-title">Total Patients</h3>
              <p className="stat-number" style={{ color: '#26a69a' }}>{totalUsers}</p>
              <p className="stat-note">👥 Registered accounts</p>
            </div>
            <div className="stat-box" style={{ borderTopColor: '#2e7d32' }}>
              <h3 className="stat-title">Active Patients</h3>
              <p className="stat-number" style={{ color: '#2e7d32' }}>{activeUsers}</p>
              <p className="stat-note">✅ Currently active</p>
            </div>
            <div className="stat-box" style={{ borderTopColor: '#e53935' }}>
              <h3 className="stat-title">Inactive Patients</h3>
              <p className="stat-number" style={{ color: '#e53935' }}>{inactiveUsers}</p>
              <p className="stat-note">⛔ Deactivated accounts</p>
            </div>
          </div>

          {saveMessage && (
            <div className="alert alert-success">{saveMessage}</div>
          )}

          {/* ── Search + Filters ── */}
          <div className="um-filters">
            <div className="um-search-wrapper">
              <span className="um-search-icon">🔍</span>
              <input
                type="text"
                className="um-search-input"
                placeholder="Search by name, email, username, phone..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="um-search-clear" onClick={() => setSearchQuery('')} type="button">
                  ✕
                </button>
              )}
            </div>
            <div className="filter-buttons">
              {[
                { key: 'all',      label: `All (${totalUsers})` },
                { key: 'Active',   label: '✅ Active'           },
                { key: 'Inactive', label: '⛔ Inactive'         },
              ].map(f => (
                <button key={f.key} type="button"
                  className={filterStatus === f.key ? 'filter-btn active' : 'filter-btn'}
                  onClick={() => setFilterStatus(f.key)}>
                  {f.label}
                </button>
              ))}
            </div>
            <span className="um-results-count">
              {filteredUsers.length} of {totalUsers} patient{totalUsers !== 1 ? 's' : ''}
            </span>
          </div>

          {/* ── Table ── */}
          <div className="vaccine-card um-table-card">
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Username</th>
                    <th>Phone</th>
                    <th>Last Login</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length > 0 ? filteredUsers.map(user => (
                    <tr key={user.id}
                      className="um-table-row"
                      onClick={() => setSelectedUser(user)}
                      title="Click to view patient details">

                      <td>
                        <div className="um-user-cell">
                          <div className="um-avatar" style={{ background: getAvatarColor(user.id) }}>
                            {user.avatar}
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

                      <td style={{ fontSize: '13px', color: '#555' }}>{user.phone}</td>

                      <td style={{ fontSize: '12px', color: '#888' }}>
                        {formatLastLogin(user.lastLogin)}
                      </td>

                      <td>
                        <span className={user.status === 'Active' ? 'status-in-stock' : 'status-out-stock'}>
                          {user.status}
                        </span>
                      </td>

                      <td onClick={e => e.stopPropagation()}>
                        <div className="um-actions">
                          <button type="button"
                            className={user.status === 'Active' ? 'um-btn-deactivate' : 'um-btn-activate'}
                            onClick={() => handleToggleStatus(user.id)}>
                            {user.status === 'Active' ? '⛔ Deactivate' : '✅ Activate'}
                          </button>
                        </div>
                      </td>

                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#aaa' }}>
                        👤 No patients found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </main>
      </section>
    </section>
  );
};

export default PatientManagement;
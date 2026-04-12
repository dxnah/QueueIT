import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import { patientAPI } from '../services/api';
import '../styles/dashboard.css';
import '../styles/patientmanagement.css';
import { MOCK_VACCINATION_HISTORY, MOCK_SCHEDULES } from '../data/mockHistory';

// ── Helpers ─────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  '#26a69a','#5c6bc0','#ef5350','#ab47bc',
  '#26c6da','#66bb6a','#ffa726','#ec407a',
];

const getAvatarColor = (id) =>
  AVATAR_COLORS[(id - 1) % AVATAR_COLORS.length];

const getInitials = (name = '') => {
  const parts = name.trim().split(' ');
  return parts.length >= 2
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    : name.slice(0, 2).toUpperCase();
};

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const scheduleStatusStyle = (s) => {
  const map = {
    scheduled: { bg:'#e3f2fd', color:'#1565c0', border:'#90caf9' },
    completed:  { bg:'#e8f5e9', color:'#2e7d32', border:'#a5d6a7' },
    cancelled:  { bg:'#ffebee', color:'#c62828', border:'#ef9a9a' },
    missed:     { bg:'#fff3e0', color:'#e65100', border:'#ffcc80' },
  };
  return map[s] || map.scheduled;
};

// ── Patient Detail Panel ────────────────────────────────────────────────

const PatientDetailPanel = ({ user, onClose }) => {
  const [activeTab, setActiveTab] = useState('register');

  const [registerForm, setRegisterForm] = useState({
    first_name: user.name ? user.name.split(' ')[0] : '',
    last_name: user.name ? user.name.split(' ').slice(1).join(' ') : '',
    email: user.email || '',
    phone: user.phone || '',
    date_of_birth: '',
    address: '',
    gender: '',
    notes: '',
  });

  const [formSaved, setFormSaved] = useState(false);

  const history = MOCK_VACCINATION_HISTORY[user.id] || [];
  const schedules = MOCK_SCHEDULES[user.id] || [];

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setFormSaved(true);
    setTimeout(() => setFormSaved(false), 3000);
  };

  const tabs = [
    { key:'register', label:'📋 Register' },
    { key:'history', label:`💉 History (${history.length})` },
    { key:'schedule', label:`📅 Schedule (${schedules.length})` },
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
            <p className="pm-panel-email">{user.username ? `@${user.username}` : ''}</p>
            <span className={`pm-panel-status ${user.is_active ? 'pm-status-active' : 'pm-status-inactive'}`}>
              {user.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>

          <button className="pm-panel-close" onClick={onClose}>✕</button>
        </div>

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

        <div className="pm-panel-body">

          {activeTab === 'register' && (
            <div>
              <p className="pm-section-note">Fields are pre-filled from existing data.</p>

              {formSaved && (
                <div className="alert alert-success">
                  ✅ Patient registered successfully!
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="pm-register-form">

                <div className="pm-form-grid">
                  <div className="pm-form-field">
                    <label className="pm-form-label">First Name</label>
                    <input
                      className="pm-form-input"
                      value={registerForm.first_name}
                      onChange={e =>
                        setRegisterForm(p => ({ ...p, first_name: e.target.value }))
                      }
                    />
                  </div>

                  <div className="pm-form-field">
                    <label className="pm-form-label">Last Name</label>
                    <input
                      className="pm-form-input"
                      value={registerForm.last_name}
                      onChange={e =>
                        setRegisterForm(p => ({ ...p, last_name: e.target.value }))
                      }
                    />
                  </div>
                </div>

                <button type="submit" className="queue-lookup-btn">
                  💾 Save Patient
                </button>

              </form>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="pm-history-list">
              {history.length === 0 ? (
                <div className="pm-empty">No vaccination history</div>
              ) : (
                history.map(record => (
                  <div key={record.id} className="pm-history-card">
                    <div className="pm-history-top">
                      <span className="pm-history-vaccine">{record.vaccine}</span>
                      <span className="pm-history-date">
                        {formatDate(record.date_administered)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="pm-schedule-list">
              {schedules.length === 0 ? (
                <div className="pm-empty">No schedules found</div>
              ) : (
                schedules.map(sched => {
                  const st = scheduleStatusStyle(sched.status);

                  return (
                    <div key={sched.id} className="pm-schedule-card">
                      <div className="pm-schedule-top">
                        <span className="pm-schedule-vaccine">
                          {sched.vaccine}
                        </span>

                        <span
                          className="pm-schedule-badge"
                          style={{
                            background: st.bg,
                            color: st.color,
                            border: `1px solid ${st.border}`,
                          }}
                        >
                          {sched.status}
                        </span>
                      </div>

                      <div className="pm-schedule-date">
                        {formatDate(sched.scheduled_date)}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

// ── MAIN COMPONENT ───────────────────────────────────────────────────────

const PatientManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [saveMessage, setSaveMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const data = await patientAPI.getAll();
      setUsers(data);
    } catch (err) {
      setApiError('Could not connect to server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const handleToggleStatus = async (id) => {
    const user = users.find(u => u.id === id);
    const newStatus = !user.is_active;

    try {
      await patientAPI.update(id, { is_active: newStatus });

      setUsers(prev =>
        prev.map(u =>
          u.id === id ? { ...u, is_active: newStatus } : u
        )
      );

      setSaveMessage(
        `✅ ${user.name} is now ${newStatus ? 'Active' : 'Inactive'}`
      );
    } catch (err) {
      setSaveMessage('❌ Update failed');
    }

    setTimeout(() => setSaveMessage(''), 3000);
  };

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

          <h1>🧑‍⚕️ Patient Management</h1>

          {apiError && <div className="alert">{apiError}</div>}
          {saveMessage && <div className="alert alert-success">{saveMessage}</div>}

          {loading ? (
            <p>Loading...</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Username</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map(user => (
                  <tr key={user.id} onClick={() => setSelectedUser(user)}>
                    <td>{user.name}</td>
                    <td>@{user.username}</td>
                    <td>{user.is_active ? 'Active' : 'Inactive'}</td>
                    <td onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => handleToggleStatus(user.id)}
                      >
                        Toggle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

        </main>
      </section>
    </section>
  );
};

export default PatientManagement;
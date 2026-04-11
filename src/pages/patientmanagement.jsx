import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import { patientAPI } from '../services/api';
import { mobileRegistrationsData } from '../data/dashboardData';
import '../styles/dashboard.css';
import '../styles/patientmanagement.css';
import { MOCK_VACCINATION_HISTORY, MOCK_SCHEDULES } from '../data/mockHistory';

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
    year:'numeric', month:'short', day:'numeric',
    hour:'2-digit', minute:'2-digit',
  });
};

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-PH', {
    year:'numeric', month:'short', day:'numeric',
  });
};

const scheduleStatusStyle = (s) => {
  const map = {
    scheduled: { bg:'#e3f2fd', color:'#1565c0', border:'#90caf9' },
    completed: { bg:'#e8f5e9', color:'#2e7d32', border:'#a5d6a7' },
    cancelled: { bg:'#ffebee', color:'#c62828', border:'#ef9a9a' },
    missed:    { bg:'#fff3e0', color:'#e65100', border:'#ffcc80' },
  };
  return map[s] || map.scheduled;
};

// ── Patient Detail Panel ───────────────────────────────────────────────────────
const PatientDetailPanel = ({ user, onClose }) => {
  const [activeTab,     setActiveTab]     = useState('register');
  const [registerForm,  setRegisterForm]  = useState({
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

  const history   = MOCK_VACCINATION_HISTORY[user.id] || [];
  const schedules = MOCK_SCHEDULES[user.id]           || [];

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setFormSaved(true);
    setTimeout(() => setFormSaved(false), 3000);
  };

  const tabs = [
    { key:'register', label:'📋 Register' },
    { key:'history',  label:`💉 History (${history.length})` },
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
            <button key={t.key}
              className={`pm-tab ${activeTab === t.key ? 'pm-tab--active' : ''}`}
              onClick={() => setActiveTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="pm-panel-body">

          {activeTab === 'register' && (
            <div>
              <p className="pm-section-note">Fields are pre-filled from existing data.</p>
              {formSaved && <div className="alert alert-success" style={{ marginBottom:'14px' }}>✅ Patient registered successfully!</div>}
              <form onSubmit={handleRegisterSubmit} className="pm-register-form">
                <div className="pm-form-grid">
                  <div className="pm-form-field">
                    <label className="pm-form-label">First Name</label>
                    <input className="pm-form-input" type="text" required value={registerForm.first_name}
                      onChange={e => setRegisterForm(p => ({ ...p, first_name: e.target.value }))} placeholder="First name" />
                  </div>
                  <div className="pm-form-field">
                    <label className="pm-form-label">Last Name</label>
                    <input className="pm-form-input" type="text" required value={registerForm.last_name}
                      onChange={e => setRegisterForm(p => ({ ...p, last_name: e.target.value }))} placeholder="Last name" />
                  </div>
                </div>
                <div className="pm-form-grid">
                  <div className="pm-form-field">
                    <label className="pm-form-label">Phone</label>
                    <input className="pm-form-input" type="text" value={registerForm.phone}
                      onChange={e => setRegisterForm(p => ({ ...p, phone: e.target.value }))} placeholder="+63 9XX XXX XXXX" />
                  </div>
                  <div className="pm-form-field">
                    <label className="pm-form-label">Date of Birth</label>
                    <input className="pm-form-input" type="date" value={registerForm.date_of_birth}
                      onChange={e => setRegisterForm(p => ({ ...p, date_of_birth: e.target.value }))} />
                  </div>
                </div>
                <div className="pm-form-grid">
                  <div className="pm-form-field">
                    <label className="pm-form-label">Gender</label>
                    <select className="pm-form-input pm-form-select" value={registerForm.gender}
                      onChange={e => setRegisterForm(p => ({ ...p, gender: e.target.value }))}>
                      <option value="">— Select —</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="pm-form-field">
                    <label className="pm-form-label">Address</label>
                    <input className="pm-form-input" type="text" value={registerForm.address}
                      onChange={e => setRegisterForm(p => ({ ...p, address: e.target.value }))} placeholder="Full address" />
                  </div>
                </div>
                <div className="pm-form-field">
                  <label className="pm-form-label">Notes</label>
                  <textarea className="pm-form-input pm-form-textarea" value={registerForm.notes}
                    onChange={e => setRegisterForm(p => ({ ...p, notes: e.target.value }))}
                    placeholder="Any medical notes or allergies..." />
                </div>
                <button type="submit" className="queue-lookup-btn" style={{ marginTop:'8px' }}>💾 Save Patient</button>
              </form>
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <p className="pm-section-note">Vaccination records administered to this patient.</p>
              {history.length === 0 ? (
                <div className="pm-empty"><div className="pm-empty-icon">💉</div><p>No vaccination history yet.</p></div>
              ) : (
                <div className="pm-history-list">
                  {history.map(record => (
                    <div key={record.id} className="pm-history-card">
                      <div className="pm-history-top">
                        <span className="pm-history-vaccine">{record.vaccine}</span>
                        <span className="pm-history-date">{formatDate(record.date_administered)}</span>
                      </div>
                      <div className="pm-history-meta"><span>👨‍⚕️ {record.administered_by}</span></div>
                      {record.notes && <p className="pm-history-notes">{record.notes}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'schedule' && (
            <div>
              <p className="pm-section-note">Upcoming and past vaccination schedules.</p>
              {schedules.length === 0 ? (
                <div className="pm-empty"><div className="pm-empty-icon">📅</div><p>No schedules found.</p></div>
              ) : (
                <div className="pm-schedule-list">
                  {schedules.map(sched => {
                    const st = scheduleStatusStyle(sched.status);
                    return (
                      <div key={sched.id} className="pm-schedule-card">
                        <div className="pm-schedule-top">
                          <span className="pm-schedule-vaccine">{sched.vaccine}</span>
                          <span className="pm-schedule-badge"
                            style={{ background:st.bg, color:st.color, border:`1px solid ${st.border}` }}>
                            {sched.status.charAt(0).toUpperCase() + sched.status.slice(1)}
                          </span>
                        </div>
                        <div className="pm-schedule-date">📅 {formatDate(sched.scheduled_date)}</div>
                        {sched.notes && <p className="pm-schedule-notes">{sched.notes}</p>}
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
  const [users,        setUsers]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [apiError,     setApiError]     = useState(null);
  const [saveMessage,  setSaveMessage]  = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [queueSearch,  setQueueSearch]  = useState('');
  const [queueResult,  setQueueResult]  = useState(null);
  const [queueNotFound, setQueueNotFound] = useState(false);
  const [searchQuery,  setSearchQuery]  = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // ── Load patients from Django ────────────────────────────────────────────
  const loadPatients = async () => {
    try {
      setLoading(true);
      setApiError(null);
      const data = await patientAPI.getAll();
      setUsers(data);
    } catch (err) {
      setApiError('Could not connect to server. Check that Django is running on localhost:8000.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPatients(); }, []);

  const totalUsers    = users.length;
  const activeUsers   = users.filter(u => u.is_active).length;
  const inactiveUsers = users.filter(u => !u.is_active).length;

  const handleQueueSearch = () => {
    const q = queueSearch.trim().toUpperCase();
    const found = (mobileRegistrationsData || []).find(r => r.queueNumber === q);
    if (found) { setQueueResult(found); setQueueNotFound(false); }
    else        { setQueueResult(null); setQueueNotFound(true);  }
  };

  const handleToggleStatus = async (id) => {
    const user = users.find(u => u.id === id);
    const newActive = !user.is_active;
    try {
      await patientAPI.update(id, { is_active: newActive });
      setUsers(prev => prev.map(u => u.id === id ? { ...u, is_active: newActive } : u));
      setSaveMessage(`✅ ${user.name} set to ${newActive ? 'Active' : 'Inactive'}.`);
    } catch (err) {
      setSaveMessage(`❌ Error: ${err.message}`);
    }
    setTimeout(() => setSaveMessage(''), 3000);
  };

  // ── Filter + Search ───────────────────────────────────────────────────────
  const filteredUsers = users.filter(u => {
    const matchStatus = filterStatus === 'all'
      ? true
      : filterStatus === 'Active' ? u.is_active : !u.is_active;
    const q = searchQuery.toLowerCase();
    const matchSearch = !q
      || (u.name     || '').toLowerCase().includes(q)
      || (u.username || '').toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  return (
    <section className="dashboard-container">
      <Sidebar />

      {selectedUser && (
        <PatientDetailPanel user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}

      <section className="main-wrapper">
        <TopBar />
        <main className="main-content">

          <header>
            <h1 className="dashboard-heading">🧑‍⚕️ Patient Management</h1>
            <p className="dashboard-subheading">Manage registered patients and their account access</p>
          </header>

          {/* Stats */}
          <div className="stats-container">
            <div className="stat-box" style={{ borderTopColor:'#26a69a' }}>
              <h3 className="stat-title">Total Patients</h3>
              <p className="stat-number" style={{ color:'#26a69a' }}>{totalUsers}</p>
              <p className="stat-note">👥 Registered accounts</p>
            </div>
            <div className="stat-box" style={{ borderTopColor:'#2e7d32' }}>
              <h3 className="stat-title">Active Patients</h3>
              <p className="stat-number" style={{ color:'#2e7d32' }}>{activeUsers}</p>
              <p className="stat-note">✅ Currently active</p>
            </div>
            <div className="stat-box" style={{ borderTopColor:'#e53935' }}>
              <h3 className="stat-title">Inactive Patients</h3>
              <p className="stat-number" style={{ color:'#e53935' }}>{inactiveUsers}</p>
              <p className="stat-note">⛔ Deactivated accounts</p>
            </div>
          </div>

          {apiError && (
            <div className="alert" style={{ background:'#ffebee', color:'#c62828', border:'1px solid #ef9a9a', padding:'12px 16px', borderRadius:'8px', marginBottom:'16px', fontWeight:'600', fontSize:'13px' }}>
              {apiError}
            </div>
          )}
          {saveMessage && <div className="alert alert-success">{saveMessage}</div>}

          {/* Queue Number Lookup */}
          <div className="queue-lookup-section">
            <h3 className="queue-lookup-title">🎫 Queue Number Lookup</h3>
            <div className="queue-lookup-bar">
              <input type="text" className="um-search-input"
                placeholder="Enter queue number (e.g. Q-001)..."
                value={queueSearch}
                onChange={e => { setQueueSearch(e.target.value); setQueueResult(null); setQueueNotFound(false); }}
                onKeyDown={e => e.key === 'Enter' && handleQueueSearch()} />
              <button className="queue-lookup-btn" onClick={handleQueueSearch}>🔍 Search</button>
            </div>
            {queueNotFound && <div className="queue-result-notfound">❌ No patient found for "{queueSearch}"</div>}
            {queueResult && (
              <div className="queue-result-card">
                <div className="queue-result-header">
                  <span className="queue-badge">{queueResult.queueNumber}</span>
                  <span className="queue-result-name">{queueResult.fullName}</span>
                </div>
                <div className="queue-result-grid">
                  <div><span className="qr-label">Age</span><span className="qr-value">{queueResult.age}</span></div>
                  <div><span className="qr-label">Birthdate</span><span className="qr-value">{new Date(queueResult.birthdate).toLocaleDateString('en-PH',{year:'numeric',month:'long',day:'numeric'})}</span></div>
                  <div><span className="qr-label">Address</span><span className="qr-value">{queueResult.address}</span></div>
                  <div><span className="qr-label">Contact</span><span className="qr-value">{queueResult.contactNumber}</span></div>
                  <div><span className="qr-label">Date of Incident</span><span className="qr-value">{new Date(queueResult.dateOfIncident).toLocaleDateString('en-PH',{year:'numeric',month:'long',day:'numeric'})}</span></div>
                  <div><span className="qr-label">Type of Injury</span><span className="qr-value">{queueResult.typeOfInjury}</span></div>
                  <div><span className="qr-label">Animal Involved</span><span className="qr-value">{queueResult.animalInvolved}</span></div>
                  <div><span className="qr-label">Animal Owner</span><span className="qr-value">{queueResult.animalOwner}</span></div>
                  <div><span className="qr-label">Animal Vaccinated</span><span className="qr-value">{queueResult.animalVaccinated}</span></div>
                  <div><span className="qr-label">Body Parts Affected</span><span className="qr-value">{queueResult.bodyPartsAffected}</span></div>
                </div>
              </div>
            )}
          </div>

          {/* Filter + Search bar */}
          <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px', flexWrap:'wrap' }}>
            {['all','Active','Inactive'].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                style={{ padding:'7px 16px', borderRadius:'20px', border:`1.5px solid ${filterStatus===s?'#26a69a':'#e0e0e0'}`, background:filterStatus===s?'#26a69a':'white', color:filterStatus===s?'white':'#555', fontSize:'13px', fontWeight:'600', cursor:'pointer', transition:'all 0.15s' }}>
                {s === 'all' ? `All (${totalUsers})` : `${s} (${s==='Active'?activeUsers:inactiveUsers})`}
              </button>
            ))}
            <input type="text" placeholder="🔍 Search by name or username..."
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              style={{ padding:'8px 14px', borderRadius:'20px', border:'1.5px solid #e0e0e0', fontSize:'13px', outline:'none', minWidth:'220px', flex:'1', maxWidth:'320px' }}
              onFocus={e => e.target.style.borderColor='#26a69a'}
              onBlur={e => e.target.style.borderColor='#e0e0e0'} />
          </div>

          {/* Table */}
          {loading ? (
            <div style={{ textAlign:'center', padding:'60px', color:'#aaa', fontSize:'15px' }}>⏳ Loading patients from server...</div>
          ) : (
            <div className="vaccine-card um-table-card">
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Username</th>
                      <th>Phone</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length > 0 ? filteredUsers.map(user => (
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
                              <div className="um-user-email">@{user.username}</div>
                            </div>
                          </div>
                        </td>
                        <td><span className="um-username-badge">@{user.username}</span></td>
                        <td style={{ fontSize:'13px', color:'#555' }}>{user.phone || '—'}</td>
                        <td>
                          <span className={user.is_active ? 'status-in-stock' : 'status-out-stock'}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td onClick={e => e.stopPropagation()}>
                          <div className="um-actions">
                            <button type="button"
                              className={user.is_active ? 'um-btn-deactivate' : 'um-btn-activate'}
                              onClick={() => handleToggleStatus(user.id)}>
                              {user.is_active ? '⛔ Deactivate' : '✅ Activate'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )) : (
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
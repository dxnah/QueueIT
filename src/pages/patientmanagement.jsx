// pages/patientmanagement.jsx

import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import { usersData } from '../data/dashboardData';
import '../styles/dashboard.css';
import '../styles/patientmanagement.css';

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

const PatientManagement = () => {
  const [users, setUsers]               = useState(usersData);
  const [filterStatus, setFilterStatus] = useState('all');
  const [saveMessage,  setSaveMessage]  = useState('');

  const totalUsers    = users.length;
  const activeUsers   = users.filter(u => u.status === 'Active').length;
  const inactiveUsers = users.filter(u => u.status === 'Inactive').length;

  const filteredUsers = users.filter(u =>
    filterStatus === 'all' || u.status === filterStatus
  );

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

          {/* ── Filters ── */}
          <div className="um-filters">
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
                    <tr key={user.id}>

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

                      <td>
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
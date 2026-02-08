// dashboard

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../images/logoit.png';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Dynamic data - Array of Objects
  const queueData = [
    { id: 1, name: 'Queue A', status: 'Active', patients: 12, avgWaitTime: '15 min' },
    { id: 2, name: 'Queue B', status: 'Active', patients: 8, avgWaitTime: '10 min' },
    { id: 3, name: 'Queue C', status: 'Paused', patients: 5, avgWaitTime: '20 min' },
    { id: 4, name: 'Queue D', status: 'Active', patients: 15, avgWaitTime: '18 min' },
  ];

  const handleLogout = () => {
    navigate('/login');
  };

  const handleNavClick = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.logoContainer}>
          <img src={logo} alt="QueueIT Logo" style={styles.logo} />
        </div>
        <nav style={styles.nav}>
          <button
            style={{
              ...styles.navLink,
              ...(activeTab === 'dashboard' ? styles.navLinkActive : {}),
            }}>
            DASHBOARD
          </button>

          <button
            style={{
              ...styles.navLink,
              ...(activeTab === 'queue' ? styles.navLinkActive : {}),
            }}>
            QUEUE MANAGEMENT
          </button>

          <button
            style={{
              ...styles.navLink,
              ...(activeTab === 'patient' ? styles.navLinkActive : {}),
            }}>
            PATIENT MANAGEMENT
          </button>

          <button
            style={{
              ...styles.navLink,
              ...(activeTab === 'ml' ? styles.navLinkActive : {}),
            }}>
            ML PREDICTIONS
          </button>
            
          <button
            style={{ ...styles.navLink, ...styles.logoutBtn }}
            onClick={handleLogout}> 
            LOGOUT
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        <h2 style={styles.heading}>Dashboard</h2>
        <p style={styles.subheading}>Welcome to your QueueIT Dashboard</p>

        {activeTab === 'dashboard' && (
          <>
            {/* Statistics Cards */}
            <div style={styles.statsContainer}>
              <div style={styles.statBox}>
                <h3 style={styles.statTitle}>Total Patients</h3>
                <p style={styles.statNumber}>
                  {queueData.reduce((sum, q) => sum + q.patients, 0)}
                </p>
              </div>

              <div style={styles.statBox}>
                <h3 style={styles.statTitle}>Active Queues</h3>
                <p style={styles.statNumber}>
                  {queueData.filter(q => q.status === 'Active').length}
                </p>
              </div>

              <div style={styles.statBox}>
                <h3 style={styles.statTitle}>Avg Wait Time</h3>
                <p style={styles.statNumber}>15 min</p>
              </div>

              <div style={styles.statBox}>
                <h3 style={styles.statTitle}>Crowd Level</h3>
                <p style={styles.statNumber}>Medium</p>
              </div>
            </div>

            {/* Queue Status Table */}
            <div style={styles.tableContainer}>
              <h3 style={styles.tableTitle}>Queue Status</h3>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th style={styles.tableCell}>Queue Name</th>
                    <th style={styles.tableCell}>Status</th>
                    <th style={styles.tableCell}>Patients Waiting</th>
                    <th style={styles.tableCell}>Avg Wait Time</th>
                  </tr>
                </thead>
                <tbody>
                  {queueData.map((queue) => (
                    <tr key={queue.id} style={styles.tableRow}>
                      <td style={styles.tableCell}>{queue.name}</td>
                      <td style={styles.tableCell}>
                        <span style={queue.status === 'Active' ? styles.statusActive : styles.statusPaused}>
                          {queue.status}
                        </span>
                      </td>
                      <td style={styles.tableCell}>{queue.patients}</td>
                      <td style={styles.tableCell}>{queue.avgWaitTime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'queue' && (
          <div style={styles.contentBox}>
            <h3>Queue Management</h3>
            <p>Manage your queues here...</p>
          </div>
        )}

        {activeTab === 'patient' && (
          <div style={styles.contentBox}>
            <h3>Patient Management</h3>
            <p>View and manage patient records...</p>
          </div>
        )}

        {activeTab === 'ml' && (
          <div style={styles.contentBox}>
            <h3>ML Predictions</h3>
            <p>View machine learning predictions and insights...</p>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  sidebar: {
    width: '280px',
    background: 'linear-gradient(135deg, #89CBB6 0%, #89CBB6 100%)',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    padding: '0',
    height: '100vh',
    boxShadow: '2px 0 8px rgba(0, 0, 0, 0.1)',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
  },
  logo: {
    width: '100px',
    height: '100px',
    objectFit: 'contain',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    padding: '0',
  },
  navLink: {
    color: 'white',
    padding: '15px 20px',
    marginBottom: '0',
    textAlign: 'left',
    borderRadius: '0',
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '14px',
    fontWeight: '500',
    textTransform: 'uppercase',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    letterSpacing: '0.5px',
  },
  navLinkActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderLeft: '4px solid white',
    paddingLeft: '16px',
  },
  logoutBtn: {
    marginTop: 'auto',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderTop: '1px solid rgba(255, 255, 255, 0.2)',
  },
  mainContent: {
    flex: 1,
    padding: '40px',
    backgroundColor: '#f8f8f8',
    overflowY: 'auto',
  },
  heading: {
    fontSize: '32px',
    marginBottom: '5px',
    color: '#333',
    fontWeight: '600',
  },
  subheading: {
    color: '#666',
    fontSize: '16px',
    marginBottom: '30px',
  },
  statsContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '40px',
    gap: '20px',
  },
  statBox: {
    backgroundColor: '#fff',
    padding: '25px 20px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    flex: 1,
    textAlign: 'center',
    borderTop: '4px solid #26a69a',
  },
  statTitle: {
    fontSize: '14px',
    color: '#666',
    margin: '0 0 10px 0',
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  statNumber: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#26a69a',
    margin: '0',
  },
  tableContainer: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  tableTitle: {
    fontSize: '18px',
    color: '#333',
    margin: '0 0 15px 0',
    fontWeight: '600',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '15px',
  },
  tableHeader: {
    backgroundColor: '#26a69a',
    color: 'white',
  },
  tableCell: {
    padding: '12px',
    textAlign: 'left',
    borderBottom: '1px solid #e0e0e0',
  },
  tableRow: {
    transition: 'background-color 0.2s ease',
  },
  statusActive: {
    color: '#26a69a',
    fontWeight: '600',
  },
  statusPaused: {
    color: '#ff9800',
    fontWeight: '600',
  },
  contentBox: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '30px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
};

export default Dashboard;
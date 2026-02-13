// dashboard 

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../images/logoit.png';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const stats = {
    totalPatients: 40,
    activeQueues: 3,
    todayAppointments: 28,
    avgWaitTime: '18 min',
  };

  const mlPredictions = {
    crowdLevel: 'High',
    predictedVolume: 65,
    peakHour: '9:00 AM - 11:00 AM',
    recommendedStaff: 4,
  };

  const queueData = [
    { id: 1, queueName: 'Queue A', type: 'Walk-in',     patientsWaiting: 12, avgWaitTime: '15 min', status: 'Active' },
    { id: 2, queueName: 'Queue B', type: 'Appointment', patientsWaiting: 8,  avgWaitTime: '10 min', status: 'Active' },
    { id: 3, queueName: 'Queue C', type: 'Walk-in',     patientsWaiting: 5,  avgWaitTime: '20 min', status: 'Paused' },
    { id: 4, queueName: 'Queue D', type: 'Appointment', patientsWaiting: 15, avgWaitTime: '18 min', status: 'Active' },
  ];

  const appointments = [
    { id: 1, time: '9:00 AM',  patientName: 'Juan Dela Cruz', vaccine: 'Anti-Rabies',  status: 'Completed'   },
    { id: 2, time: '9:30 AM',  patientName: 'Maria Santos',   vaccine: 'Anti-Tetanus', status: 'In Progress' },
    { id: 3, time: '10:00 AM', patientName: 'Pedro Reyes',    vaccine: 'Anti-Rabies',  status: 'Pending'     },
    { id: 4, time: '10:30 AM', patientName: 'Ana Garcia',     vaccine: 'Anti-Tetanus', status: 'Pending'     },
    { id: 5, time: '11:00 AM', patientName: 'Carlos Lim',     vaccine: 'Anti-Rabies',  status: 'Pending'     },
  ];

  const getAppointmentStatusStyle = (status) => {
    if (status === 'Completed')   return styles.statusCompleted;
    if (status === 'In Progress') return styles.statusInProgress;
    return styles.statusPending;
  };

  const getCrowdLevelStyle = (level) => {
    if (level === 'High')   return { ...styles.crowdBadge, backgroundColor: '#ffebee', color: '#c62828' };
    if (level === 'Medium') return { ...styles.crowdBadge, backgroundColor: '#fff8e1', color: '#f57f17' };
    return { ...styles.crowdBadge, backgroundColor: '#e8f5e9', color: '#2e7d32' };
  };

  const handleLogout = () => navigate('/login');

  const handleNavClick = (tab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <div style={styles.container}>

      <button
        style={styles.mobileMenuToggle}
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="mobile-menu-toggle">
        ☰
      </button>

      <div
        style={isMobileMenuOpen ? { ...styles.sidebar, ...styles.sidebarOpen } : styles.sidebar}
        className={isMobileMenuOpen ? 'sidebar active' : 'sidebar'}>

        <div style={styles.logoContainer}>
          <img src={logo} alt="QueueIT Logo" style={styles.logo} />
        </div>

        <nav style={styles.nav}>
          <button
            style={{ ...styles.navLink, ...(activeTab === 'dashboard' ? styles.navLinkActive : {}) }}
            onClick={() => handleNavClick('dashboard')}>
            DASHBOARD
          </button>

          <button
            style={{ ...styles.navLink, ...styles.logoutBtn }}
            onClick={handleLogout}>
            LOGOUT
          </button>
        </nav>
      </div>

      {isMobileMenuOpen && (
        <div style={styles.overlay} onClick={() => setIsMobileMenuOpen(false)} />
      )}

      <div style={styles.mainContent} className="main-content">
        <h2 style={styles.heading}>Dashboard</h2>
        <p style={styles.subheading}>Welcome back, Admin</p>

        {activeTab === 'dashboard' && (
          <>

            <div style={styles.statsContainer} className="stats-container">
              <div style={styles.statBox}>
                <h3 style={styles.statTitle}>Total Patients</h3>
                <p style={styles.statNumber}>{stats.totalPatients}</p>
              </div>
              <div style={styles.statBox}>
                <h3 style={styles.statTitle}>Active Queues</h3>
                <p style={styles.statNumber}>{stats.activeQueues}</p>
              </div>
              <div style={styles.statBox}>
                <h3 style={styles.statTitle}>Today's Appointments</h3>
                <p style={styles.statNumber}>{stats.todayAppointments}</p>
              </div>
              <div style={styles.statBox}>
                <h3 style={styles.statTitle}>Avg Wait Time</h3>
                <p style={styles.statNumber}>{stats.avgWaitTime}</p>
              </div>
            </div>

            <div style={styles.middleRow}>

              <div style={styles.mlCard}>
                <h3 style={styles.sectionTitle}>🤖 ML Predictions</h3>

                <div style={styles.mlItem}>
                  <span style={styles.mlLabel}>Crowd Level</span>
                  <span style={getCrowdLevelStyle(mlPredictions.crowdLevel)}>
                    {mlPredictions.crowdLevel}
                  </span>
                </div>

                <div style={styles.mlItem}>
                  <span style={styles.mlLabel}>Predicted Volume</span>
                  <span style={styles.mlValue}>{mlPredictions.predictedVolume} patients</span>
                </div>

                <div style={styles.mlItem}>
                  <span style={styles.mlLabel}>Peak Hour</span>
                  <span style={styles.mlValue}>{mlPredictions.peakHour}</span>
                </div>

                <div style={styles.mlItem}>
                  <span style={styles.mlLabel}>Recommended Staff</span>
                  <span style={styles.mlValue}>{mlPredictions.recommendedStaff} staff</span>
                </div>
              </div>

              <div style={styles.queueCard}>
                <h3 style={styles.sectionTitle}>📋 Queue Status</h3>
                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                    <thead>
                      <tr style={styles.tableHeader}>
                        <th style={styles.tableCell}>Queue</th>
                        <th style={styles.tableCell}>Type</th>
                        <th style={styles.tableCell}>Patients</th>
                        <th style={styles.tableCell}>Wait Time</th>
                        <th style={styles.tableCell}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {queueData.map((queue) => (
                        <tr key={queue.id} style={styles.tableRow}>
                          <td style={styles.tableCell}>{queue.queueName}</td>
                          <td style={styles.tableCell}>{queue.type}</td>
                          <td style={styles.tableCell}>{queue.patientsWaiting}</td>
                          <td style={styles.tableCell}>{queue.avgWaitTime}</td>
                          <td style={styles.tableCell}>
                            <span style={queue.status === 'Active' ? styles.statusActive : styles.statusPaused}>
                              {queue.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            <div style={styles.appointmentsCard}>
              <h3 style={styles.sectionTitle}>📅 Today's Appointments</h3>
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.tableHeader}>
                      <th style={styles.tableCell}>Time</th>
                      <th style={styles.tableCell}>Patient Name</th>
                      <th style={styles.tableCell}>Vaccine</th>
                      <th style={styles.tableCell}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((appt) => (
                      <tr key={appt.id} style={styles.tableRow}>
                        <td style={styles.tableCell}>{appt.time}</td>
                        <td style={styles.tableCell}>{appt.patientName}</td>
                        <td style={styles.tableCell}>{appt.vaccine}</td>
                        <td style={styles.tableCell}>
                          <span style={getAppointmentStatusStyle(appt.status)}>
                            {appt.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
    position: 'relative',
  },
  mobileMenuToggle: {
    display: 'none',
    position: 'fixed',
    top: '15px',
    left: '15px',
    zIndex: 1000,
    backgroundColor: '#26a69a',
    color: 'white',
    border: 'none',
    padding: '10px 15px',
    borderRadius: '5px',
    fontSize: '20px',
    cursor: 'pointer',
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
  },
  sidebar: {
    width: '280px',
    background: 'linear-gradient(180deg, #89CBB6 0%, #5ba99a 100%)',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
  },
  sidebarOpen: { display: 'flex' },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    borderBottom: '1px solid rgba(255,255,255,0.2)',
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
  },
  navLink: {
    color: 'white',
    padding: '15px 20px',
    textAlign: 'left',
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
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderLeft: '4px solid white',
    paddingLeft: '16px',
  },
  logoutBtn: {
    marginTop: 'auto',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderTop: '1px solid rgba(255,255,255,0.2)',
  },
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 998,
  },
  mainContent: {
    flex: 1,
    padding: '40px',
    backgroundColor: '#f8f8f8',
    overflowY: 'auto',
  },
  heading: {
    fontSize: '32px',
    margin: '0 0 5px 0',
    color: '#333',
    fontWeight: '600',
  },
  subheading: {
    fontSize: '14px',
    color: '#888',
    margin: '0 0 30px 0',
  },

  statsContainer: {
    display: 'flex',
    gap: '20px',
    marginBottom: '30px',
    flexWrap: 'wrap',
  },
  statBox: {
    backgroundColor: '#fff',
    padding: '25px 20px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    flex: '1 1 calc(25% - 20px)',
    minWidth: '150px',
    textAlign: 'center',
    borderTop: '4px solid #26a69a',
  },
  statTitle: {
    fontSize: '12px',
    color: '#888',
    margin: '0 0 10px 0',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  statNumber: {
    fontSize: '30px',
    fontWeight: 'bold',
    color: '#26a69a',
    margin: '0',
  },
  middleRow: {
    display: 'flex',
    gap: '20px',
    marginBottom: '30px',
    flexWrap: 'wrap',
  },
  mlCard: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    flex: '0 0 280px',
    minWidth: '250px',
  },
  mlItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #f0f0f0',
  },
  mlLabel: {
    fontSize: '13px',
    color: '#666',
    fontWeight: '500',
  },
  mlValue: {
    fontSize: '13px',
    color: '#333',
    fontWeight: '600',
  },
  crowdBadge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '700',
  },
  queueCard: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    flex: 1,
    minWidth: '300px',
  },
  appointmentsCard: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    marginBottom: '30px',
  },
  sectionTitle: {
    fontSize: '16px',
    color: '#333',
    fontWeight: '600',
    margin: '0 0 15px 0',
  },
  tableWrapper: { overflowX: 'auto' },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '400px',
  },
  tableHeader: {
    backgroundColor: '#26a69a',
    color: 'white',
  },
  tableCell: {
    padding: '11px 12px',
    textAlign: 'left',
    borderBottom: '1px solid #f0f0f0',
    fontSize: '13px',
  },
  tableRow: {
    transition: 'background-color 0.2s',
  },
  statusActive: {
    color: '#26a69a',
    fontWeight: '700',
    fontSize: '13px',
  },
  statusPaused: {
    color: '#ff9800',
    fontWeight: '700',
    fontSize: '13px',
  },
  statusCompleted: {
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
    padding: '3px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
  },
  statusInProgress: {
    backgroundColor: '#e3f2fd',
    color: '#1565c0',
    padding: '3px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
  },
  statusPending: {
    backgroundColor: '#fff8e1',
    color: '#f57f17',
    padding: '3px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
  },
};

const styleSheet = document.createElement('style');
styleSheet.innerText = `
  @media (max-width: 768px) {
    .mobile-menu-toggle { display: block !important; }

    .sidebar {
      position: fixed !important;
      left: -280px !important;
      top: 0 !important;
      height: 100vh !important;
      z-index: 999 !important;
      transition: left 0.3s ease !important;
    }

    .sidebar.active { left: 0 !important; }

    .main-content {
      padding: 70px 20px 20px 20px !important;
    }

    .stats-container {
      flex-direction: column !important;
    }

    .stats-container > div {
      min-width: 100% !important;
    }
  }

  @media (max-width: 480px) {
    .main-content { padding: 60px 15px 15px 15px !important; }
    table { font-size: 12px !important; }
    th, td { padding: 8px !important; }
  }
`;
document.head.appendChild(styleSheet);

export default Dashboard;
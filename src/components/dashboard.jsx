// Dashboard.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../images/logoit.png';
import PredictionCard from './PredictionCard';
import InsightToggle from './InsightToggle';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  //  ML PREDICTIONS 
  const mlPredictions = {
    crowdLevelNormal: 'Normal - Medium',
    crowdLevelPeak:   'High - Above High',
    peakMonths:       'June - August',
    vaccinesAtNormal: 4000,
    vaccinesAtPeak:   6000,
  };

  //  Step 2: PredictionCard Data 
  const predictionCards = [
    { id: 1, label: 'Crowd Level (Normal)',  result: 'Normal - Medium',  confidence: 78, resultColor: '#f57f17' },
    { id: 2, label: 'Crowd Level (Peak)',    result: 'High - Above High', confidence: 91, resultColor: '#c62828' },
    { id: 3, label: 'Vaccine Demand',        result: 'High Demand',       confidence: 85, resultColor: '#c62828' },
    { id: 4, label: 'Stock Risk',            result: 'At Risk',           confidence: 88, resultColor: '#e53935' },
  ];

  //  Step 3: ML Insights Array 
  const mlInsights = [
    { id: 1, label: 'Task Priority',      result: 'Urgent'  },
    { id: 2, label: 'System Health',      result: 'Stable'  },
    { id: 3, label: 'Anomaly Detection',  result: 'None'    },
    { id: 4, label: 'Vaccine Risk Level', result: 'High'    },
    { id: 5, label: 'Restock Priority',   result: 'Urgent'  },
  ];

  //  VACCINE DATA 
  const vaccineData = [
    { id: 1, vaccine: 'Anti-Rabies',  available: 320, minStock: 300, mlRecommended: 200, status: 'In Stock'  },
    { id: 2, vaccine: 'Anti-Tetanus', available: 85,  minStock: 200, mlRecommended: 350, status: 'Low Stock' },
    { id: 3, vaccine: 'Booster',      available: 0,   minStock: 150, mlRecommended: 500, status: 'Out Stock' },
    { id: 4, vaccine: 'Hepatitis B',  available: 2,   minStock: 100, mlRecommended: 300, status: 'Low Stock' },
    { id: 5, vaccine: 'Flu Shot',     available: 150, minStock: 100, mlRecommended: 150, status: 'In Stock'  },
  ];

  //  DYNAMIC CALCULATIONS 
  const totalAvailable  = vaccineData.reduce((sum, v) => sum + v.available, 0);
  const lowStockCount   = vaccineData.filter(v => v.status === 'Low Stock').length;
  const outOfStockCount = vaccineData.filter(v => v.status === 'Out Stock').length;
  const totalToOrder    = vaccineData.reduce((sum, v) => sum + v.mlRecommended, 0);
  const vaccinesToOrder = vaccineData.filter(v =>
    v.status === 'Low Stock' || v.status === 'Out Stock'
  );

  //  DYNAMIC COLOR HELPERS 
  const getAvailableColor   = (total) => total > 500 ? '#26a69a' : total > 100 ? '#f57f17' : '#c62828';
  const getLowStockColor    = (count) => count === 0 ? '#26a69a' : count <= 2 ? '#f57f17' : '#c62828';
  const getOutOfStockColor  = (count) => count === 0 ? '#26a69a' : '#c62828';

  const getAvailableBorder  = (total) => `4px solid ${getAvailableColor(total)}`;
  const getLowStockBorder   = (count) => `4px solid ${getLowStockColor(count)}`;
  const getOutOfStockBorder = (count) => `4px solid ${getOutOfStockColor(count)}`;

  const getAvailableLabel  = (total) => total > 500 ? '✅ Stock is sufficient'     : total > 100 ? '⚠️ Stock is getting low'       : '🚨 Stock is critically low';
  const getLowStockLabel   = (count) => count === 0 ? '✅ All vaccines well stocked' : count <= 2 ? '⚠️ Some vaccines running low'   : '🚨 Many vaccines running low';
  const getOutOfStockLabel = (count) => count === 0 ? '✅ All vaccines available'   : '🚨 Immediate restocking needed';

  //  ORDER URGENCY 
  const getOrderUrgencyStyle = (status) => {
    if (status === 'Out Stock') return styles.urgencyOut;
    if (status === 'Low Stock') return styles.urgencyLow;
    return styles.urgencyOk;
  };
  const getOrderUrgencyLabel = (status) => {
    if (status === 'Out Stock') return '🚨 Urgent';
    if (status === 'Low Stock') return '⚠️ Soon';
    return '✅ OK';
  };

  //  VACCINE TABLE HELPERS 
  const getVaccineStatusStyle = (status) => {
    if (status === 'In Stock')  return styles.statusInStock;
    if (status === 'Low Stock') return styles.statusLowStock;
    return styles.statusOutStock;
  };

  const getCrowdLevelStyle = (level) => {
    if (level === 'High' || level === 'High - Above High')
      return { ...styles.crowdBadge, backgroundColor: '#ffebee', color: '#c62828' };
    if (level === 'Normal - Medium' || level === 'Medium')
      return { ...styles.crowdBadge, backgroundColor: '#fff8e1', color: '#f57f17' };
    return { ...styles.crowdBadge, backgroundColor: '#e8f5e9', color: '#2e7d32' };
  };

  //  HANDLERS 
  const handleLogout   = () => navigate('/login');
  const handleNavClick = (tab) => { setActiveTab(tab); setIsMobileMenuOpen(false); };

  return (
    <div style={styles.container}>

      {/* Hamburger */}
      <button
        style={styles.mobileMenuToggle}
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="mobile-menu-toggle">
        ☰
      </button>

      {/* Sidebar */}
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

      {/* Overlay */}
      {isMobileMenuOpen && (
        <div style={styles.overlay} onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Main Content */}
      <div style={styles.mainContent} className="main-content">

        {/* HEADER */}
        <h2 style={styles.heading}>Dashboard</h2>
        <p style={styles.subheading}>Welcome back, Admin</p>

        {activeTab === 'dashboard' && (
          <>
            {/* ── STATS CARDS ── */}
            <div style={styles.statsContainer} className="stats-container">

              <div style={{ ...styles.statBox, borderTop: getAvailableBorder(totalAvailable) }}>
                <h3 style={styles.statTitle}>Vaccines Available</h3>
                <p style={{ ...styles.statNumber, color: getAvailableColor(totalAvailable) }}>
                  {totalAvailable.toLocaleString()}
                </p>
                <p style={styles.statNote}>{getAvailableLabel(totalAvailable)}</p>
              </div>

              <div style={{ ...styles.statBox, borderTop: '4px solid #e53935' }}>
                <h3 style={styles.statTitle}>Vaccines to Order</h3>
                <p style={{ ...styles.statNumber, color: '#e53935' }}>
                  {totalToOrder.toLocaleString()}
                </p>
                <p style={styles.statNote}>💊 {vaccinesToOrder.length} vaccine types need restocking</p>
              </div>

              <div style={{ ...styles.statBox, borderTop: getLowStockBorder(lowStockCount) }}>
                <h3 style={styles.statTitle}>Low Stock</h3>
                <p style={{ ...styles.statNumber, color: getLowStockColor(lowStockCount) }}>
                  {lowStockCount}
                </p>
                <p style={styles.statNote}>{getLowStockLabel(lowStockCount)}</p>
              </div>

              <div style={{ ...styles.statBox, borderTop: getOutOfStockBorder(outOfStockCount) }}>
                <h3 style={styles.statTitle}>Out of Stock</h3>
                <p style={{ ...styles.statNumber, color: getOutOfStockColor(outOfStockCount) }}>
                  {outOfStockCount}
                </p>
                <p style={styles.statNote}>{getOutOfStockLabel(outOfStockCount)}</p>
              </div>

            </div>

            {/*  Step 2: PredictionCard Components  */}
            <div style={styles.predictionRow}>
              {predictionCards.map((card) => (
                <PredictionCard
                  key={card.id}
                  label={card.label}
                  result={card.result}
                  confidence={card.confidence}
                  resultColor={card.resultColor}
                />
              ))}
            </div>

            {/*  Step 4: InsightToggle Component  */}
            <InsightToggle insights={mlInsights} />

            {/*  MIDDLE ROW: ML + Vaccine Availability  */}
            <div style={styles.middleRow} className="middle-row">

              {/* ML PREDICTIONS */}
              <div style={styles.mlCard}>
                <h3 style={styles.sectionTitle}>🤖 ML Predictions in a Month</h3>

                <div style={styles.mlItem}>
                  <div style={styles.mlLabelGroup}>
                    <span style={styles.mlLabel}>Crowd Level at Normal Operations</span>
                  </div>
                  <span style={getCrowdLevelStyle(mlPredictions.crowdLevelNormal)}>
                    {mlPredictions.crowdLevelNormal}
                  </span>
                </div>

                <div style={styles.mlItem}>
                  <div style={styles.mlLabelGroup}>
                    <span style={styles.mlLabel}>Crowd Level during Peak Months</span>
                  </div>
                  <span style={getCrowdLevelStyle(mlPredictions.crowdLevelPeak)}>
                    {mlPredictions.crowdLevelPeak}
                  </span>
                </div>

                <div style={styles.mlItem}>
                  <span style={styles.mlLabel}>Peak Months</span>
                  <span style={styles.mlValuePeak}>📅 {mlPredictions.peakMonths}</span>
                </div>

                <div style={styles.mlItem}>
                  <div style={styles.mlLabelGroup}>
                    <span style={styles.mlLabel}>Predicted Vaccines at Normal Operation</span>
                  </div>
                  <span style={styles.mlValueNormal}>
                    💉 {mlPredictions.vaccinesAtNormal.toLocaleString()}
                  </span>
                </div>

                <div style={{ ...styles.mlItem, borderBottom: 'none' }}>
                  <div style={styles.mlLabelGroup}>
                    <span style={styles.mlLabel}>Predicted Vaccines during Peak Months</span>
                  </div>
                  <span style={styles.mlValuePeakVaccine}>
                    💉 {mlPredictions.vaccinesAtPeak.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* VACCINE AVAILABILITY */}
              <div style={styles.vaccineCard}>
                <h3 style={styles.sectionTitle}>💉 Vaccine Availability</h3>
                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                    <thead>
                      <tr style={styles.tableHeader}>
                        <th style={styles.tableCell}>Vaccine</th>
                        <th style={styles.tableCell}>Available</th>
                        <th style={styles.tableCell}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vaccineData.map((vaccine) => (
                        <tr key={vaccine.id} style={styles.tableRow}>
                          <td style={styles.tableCell}>{vaccine.vaccine}</td>
                          <td style={styles.tableCell}>{vaccine.available.toLocaleString()}</td>
                          <td style={styles.tableCell}>
                            <span style={getVaccineStatusStyle(vaccine.status)}>
                              {vaccine.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr style={styles.totalRow}>
                        <td style={styles.totalCell}>Total</td>
                        <td style={styles.totalCell}>
                          {vaccineData.reduce((sum, v) => sum + v.available, 0).toLocaleString()}
                        </td>
                        <td style={styles.tableCell}></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

            </div>

            {/*  VACCINES TO ORDER TABLE  */}
            <div style={styles.orderCard}>
              <div style={styles.orderCardHeader}>
                <div>
                  <h3 style={styles.sectionTitle}>📦 Vaccines to Order</h3>
                  <p style={styles.mlSubtitle}>
                    ML recommended restock list — {vaccinesToOrder.length} vaccine/s need ordering
                  </p>
                </div>
                <div style={styles.orderTotalBadge}>
                  Total to Order: <strong>{totalToOrder.toLocaleString()}</strong> doses
                </div>
              </div>

              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.tableHeader}>
                      <th style={styles.tableCell}>Vaccine</th>
                      <th style={styles.tableCell}>Current Stock</th>
                      <th style={styles.tableCell}>Min. Required</th>
                      <th style={styles.tableCell}>ML Recommended Order</th>
                      <th style={styles.tableCell}>Urgency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vaccinesToOrder.map((vaccine) => (
                      <tr key={vaccine.id} style={styles.tableRow}>
                        <td style={{ ...styles.tableCell, fontWeight: '600' }}>
                          {vaccine.vaccine}
                        </td>
                        <td style={styles.tableCell}>
                          <span style={{
                            color: vaccine.available === 0 ? '#c62828' : '#f57f17',
                            fontWeight: '700',
                          }}>
                            {vaccine.available.toLocaleString()}
                          </span>
                        </td>
                        <td style={styles.tableCell}>
                          {vaccine.minStock.toLocaleString()}
                        </td>
                        <td style={styles.tableCell}>
                          <strong style={{ color: '#26a69a', fontSize: '14px' }}>
                            💉 {vaccine.mlRecommended.toLocaleString()} doses
                          </strong>
                        </td>
                        <td style={styles.tableCell}>
                          <span style={getOrderUrgencyStyle(vaccine.status)}>
                            {getOrderUrgencyLabel(vaccine.status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={styles.totalRow}>
                      <td style={styles.totalCell} colSpan={3}>Total Doses to Order</td>
                      <td style={{ ...styles.totalCell, color: '#e53935' }}>
                        💉 {totalToOrder.toLocaleString()} doses
                      </td>
                      <td style={styles.totalCell}></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

          </>
        )}
      </div>
    </div>
  );
};

//  STYLES 
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
  logo: { width: '100px', height: '100px', objectFit: 'contain' },
  nav: { display: 'flex', flexDirection: 'column', flex: 1 },
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
  heading: { fontSize: '32px', margin: '0 0 5px 0', color: '#333', fontWeight: '600' },
  subheading: { fontSize: '14px', color: '#888', margin: '0 0 30px 0' },

  //  Stats Cards 
  statsContainer: {
    display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap',
  },
  statBox: {
    backgroundColor: '#fff',
    padding: '25px 20px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    flex: '1 1 0',
    minWidth: '0',
    textAlign: 'center',
    borderTop: '4px solid #26a69a',
  },
  statTitle: {
    fontSize: '12px', color: '#888', margin: '0 0 10px 0',
    fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px',
  },
  statNumber: { fontSize: '30px', fontWeight: 'bold', color: '#26a69a', margin: '0 0 5px 0' },
  statNote:   { fontSize: '11px', color: '#aaa', margin: '0', fontStyle: 'italic' },

  //  Prediction Cards Row 
  predictionRow: {
    display: 'flex',
    gap: '15px',
    marginBottom: '30px',
    flexWrap: 'wrap',
  },

  //  Middle Row 
  middleRow: {
    display: 'flex',
    gap: '20px',
    marginBottom: '30px',
    flexWrap: 'wrap',
    alignItems: 'stretch',
  },
  mlCard: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    flex: 1,
    minWidth: '280px',
  },
  vaccineCard: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    flex: 1,
    minWidth: '280px',
  },

  //  ML Predictions Content 
  mlSubtitle: {
    fontSize: '11px',
    color: '#999',
    margin: '-5px 0 12px 0',
    fontStyle: 'italic',
  },
  mlItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #f0f0f0',
    gap: '10px',
  },
  mlLabelGroup: {
    flex: 1,
  },
  mlLabel: {
    fontSize: '12px',
    color: '#666',
    fontWeight: '500',
    lineHeight: '1.4',
  },
  mlValue: {
    fontSize: '13px',
    color: '#333',
    fontWeight: '600',
    whiteSpace: 'nowrap',
  },
  mlValueNormal: {
    fontSize: '12px',
    color: '#2e7d32',
    fontWeight: '700',
    backgroundColor: '#e8f5e9',
    padding: '3px 8px',
    borderRadius: '10px',
    whiteSpace: 'nowrap',
  },
  mlValuePeak: {
    fontSize: '12px',
    color: '#c62828',
    fontWeight: '700',
    backgroundColor: '#ffebee',
    padding: '3px 8px',
    borderRadius: '10px',
    whiteSpace: 'nowrap',
  },
  mlValuePeakVaccine: {
    fontSize: '12px',
    color: '#c62828',
    fontWeight: '700',
    backgroundColor: '#ffebee',
    padding: '3px 8px',
    borderRadius: '10px',
    whiteSpace: 'nowrap',
  },
  crowdBadge: {
    padding: '3px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '700',
    whiteSpace: 'nowrap',
  },
  sectionTitle: {
    fontSize: '16px',
    color: '#333',
    fontWeight: '600',
    margin: '0 0 5px 0',
  },

  //  Vaccines to Order Card 
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    marginBottom: '30px',
    borderTop: '4px solid #e53935',
  },
  orderCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '15px',
    flexWrap: 'wrap',
    gap: '10px',
  },
  orderTotalBadge: {
    backgroundColor: '#ffebee',
    color: '#c62828',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    alignSelf: 'center',
  },

  //  Urgency Badges 
  urgencyOut: {
    backgroundColor: '#ffebee',
    color: '#c62828',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '700',
  },
  urgencyLow: {
    backgroundColor: '#fff8e1',
    color: '#f57f17',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '700',
  },
  urgencyOk: {
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '700',
  },

  //  Table 
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '250px',
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
  totalRow: {
    backgroundColor: '#f5f5f5',
    fontWeight: '700',
  },
  totalCell: {
    padding: '11px 12px',
    textAlign: 'left',
    fontSize: '13px',
    fontWeight: '700',
    color: '#333',
    borderTop: '2px solid #e0e0e0',
  },

  //  Status Badges 
  statusInStock: {
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
  },
  statusLowStock: {
    backgroundColor: '#fff8e1',
    color: '#f57f17',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
  },
  statusOutStock: {
    backgroundColor: '#ffebee',
    color: '#c62828',
    padding: '4px 12px',
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

//  RESPONSIVE CSS 
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
    .sidebar.active  { left: 0 !important; }
    .main-content    { padding: 70px 20px 20px 20px !important; }
    .stats-container { flex-direction: column !important; }
    .stats-container > div { min-width: 100% !important; }
    .middle-row      { flex-direction: column !important; }
    .middle-row > div {
      min-width: 100% !important;
      flex: 1 1 100% !important;
    }
  }

  @media (max-width: 480px) {
    .main-content { padding: 60px 15px 15px 15px !important; }
    table         { font-size: 12px !important; }
    th, td        { padding: 8px !important; }
  }
`;
document.head.appendChild(styleSheet);

export default Dashboard;
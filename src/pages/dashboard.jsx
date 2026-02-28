// Dashboard.jsx - FULLY OPTIMIZED FOR LAB 5

import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import DailyAnalytics from '../components/DailyAnalytics';
import '../styles/dashboard.css';
import { vaccineData } from '../data/dashboardData';

const Dashboard = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mlView, setMlView] = useState('weekly');

  // ── DYNAMIC CALCULATIONS ───────────────────────────────
  const totalAvailable = vaccineData.reduce((sum, v) => sum + v.available, 0);
  const lowStockCount = vaccineData.filter(v => v.status === 'Low Stock').length;
  const outOfStockCount = vaccineData.filter(v => v.status === 'Out Stock').length;
  const totalToOrder = vaccineData.reduce((sum, v) => sum + v.mlRecommended, 0);
  const vaccinesToOrder = vaccineData.filter(v =>
    v.status === 'Low Stock' || v.status === 'Out Stock'
  );

  // ── DYNAMIC COLOR HELPERS ──────────────────────────────
  const getAvailableColor = (total) => total > 500 ? '#26a69a' : total > 100 ? '#f57f17' : '#c62828';
  const getLowStockColor = (count) => count === 0 ? '#26a69a' : count <= 2 ? '#f57f17' : '#c62828';
  const getOutOfStockColor = (count) => count === 0 ? '#26a69a' : '#c62828';

  const getAvailableBorder = (total) => `4px solid ${getAvailableColor(total)}`;
  const getLowStockBorder = (count) => `4px solid ${getLowStockColor(count)}`;
  const getOutOfStockBorder = (count) => `4px solid ${getOutOfStockColor(count)}`;

  const getAvailableLabel = (total) => total > 500 ? '✅ Stock is sufficient' : total > 100 ? '⚠️ Stock is getting low' : '🚨 Stock is critically low';
  const getLowStockLabel = (count) => count === 0 ? '✅ All vaccines well stocked' : count <= 2 ? '⚠️ Some vaccines running low' : '🚨 Many vaccines running low';
  const getOutOfStockLabel = (count) => count === 0 ? '✅ All vaccines available' : '🚨 Immediate restocking needed';

  const getOrderUrgencyClass = (status) => {
    if (status === 'Out Stock') return 'urgency-out';
    if (status === 'Low Stock') return 'urgency-low';
    return 'urgency-ok';
  };

  const getOrderUrgencyLabel = (status) => {
    if (status === 'Out Stock') return '🚨 Urgent';
    if (status === 'Low Stock') return '⚠️ Soon';
    return '✅ OK';
  };

  const getVaccineStatusClass = (status) => {
    if (status === 'In Stock') return 'status-in-stock';
    if (status === 'Low Stock') return 'status-low-stock';
    return 'status-out-stock';
  };

  // ── PER-VACCINE WEEKLY / MONTHLY PREDICTIONS ──────────
  const vaccineForecasts = vaccineData.map(v => {
    const monthlyNeed = v.mlRecommended;
    const weeklyNeed = Math.round(monthlyNeed / 4);
    const peakMonthly = Math.round(monthlyNeed * 1.5);
    const peakWeekly = Math.round(weeklyNeed * 1.5);
    const weeksLeft = weeklyNeed > 0 ? (v.available / weeklyNeed).toFixed(1) : '∞';
    const risk = v.available <= 20 ? 'critical' : v.available < v.minStock ? 'warning' : 'ok';
    return { ...v, weeklyNeed, monthlyNeed, peakWeekly, peakMonthly, weeksLeft, risk };
  });

  // ── VACCINE TABLE HELPERS ──────────────────────────────
  const getStockBarPercent = (available, minStock) => {
    if (minStock === 0) return 100;
    const pct = Math.round((available / (minStock * 2)) * 100);
    return Math.min(pct, 100);
  };

  const getStockBarColor = (risk) => {
    if (risk === 'critical') return '#e53935';
    if (risk === 'warning') return '#f57f17';
    return '#26a69a';
  };

  const getWeeksLeftLabel = (weeksLeft) => {
    const w = parseFloat(weeksLeft);
    if (isNaN(w) || w === 0) return '🚨 No stock — order immediately';
    if (w < 0.5) return '🚨 Runs out in days — order now';
    if (w < 1) return `⚠️ Less than 1 week left (${weeksLeft} wks)`;
    if (w < 2) return `⚠️ About ${weeksLeft} week left — order soon`;
    if (w < 4) return `⚠️ ${weeksLeft} weeks left — monitor closely`;
    return `✅ Good for ${weeksLeft} more weeks`;
  };

  const thStyle = { padding: '10px 12px', fontSize: '12px', fontWeight: 600, textAlign: 'left', letterSpacing: '0.3px' };
  const tdStyle = { padding: '10px 12px', fontSize: '13px', verticalAlign: 'middle' };

  return (
    <div className="dashboard-container">

      <button
        type="button"
        className="mobile-menu-toggle"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle navigation menu">
        ☰
      </button>

      <Sidebar
        activeTab="dashboard"
        isMobileMenuOpen={isMobileMenuOpen}
        onMenuClose={() => setIsMobileMenuOpen(false)}
      />

      {isMobileMenuOpen && (
        <div className="overlay" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      <main className="main-content">

        <header>
          <h1 className="dashboard-heading">📊 Admin Dashboard</h1>
          <p className="dashboard-subheading">Welcome back, Admin</p>
        </header>

        {/* ── STATS CARDS ── */}
        <section className="stats-container" aria-label="Dashboard Statistics">
          <div className="stat-box" style={{ borderTop: getAvailableBorder(totalAvailable) }}>
            <h3 className="stat-title">Vaccines Available</h3>
            <p className="stat-number" style={{ color: getAvailableColor(totalAvailable) }}>
              {totalAvailable.toLocaleString()}
            </p>
            <p className="stat-note">{getAvailableLabel(totalAvailable)}</p>
          </div>

          <div className="stat-box" style={{ borderTop: '4px solid #e53935' }}>
            <h3 className="stat-title">Vaccines to Order</h3>
            <p className="stat-number" style={{ color: '#e53935' }}>{totalToOrder.toLocaleString()}</p>
            <p className="stat-note">💊 {vaccinesToOrder.length} vaccine types need restocking</p>
          </div>

          <div className="stat-box" style={{ borderTop: getLowStockBorder(lowStockCount) }}>
            <h3 className="stat-title">Low Stock</h3>
            <p className="stat-number" style={{ color: getLowStockColor(lowStockCount) }}>{lowStockCount}</p>
            <p className="stat-note">{getLowStockLabel(lowStockCount)}</p>
          </div>

          <div className="stat-box" style={{ borderTop: getOutOfStockBorder(outOfStockCount) }}>
            <h3 className="stat-title">Out of Stock</h3>
            <p className="stat-number" style={{ color: getOutOfStockColor(outOfStockCount) }}>{outOfStockCount}</p>
            <p className="stat-note">{getOutOfStockLabel(outOfStockCount)}</p>
          </div>
        </section>

        {/* ── DAILY ANALYTICS CHARTS ── */}
        <DailyAnalytics />

        {/* ── MIDDLE ROW: ML PREDICTIONS + VACCINE AVAILABILITY ── */}
        <section className="middle-row" aria-label="Forecasts and Availability">

          {/* ── ML PREDICTIONS CARD ── */}
          <article className="ml-card ml-forecast-card">

            {/* Header + toggle */}
            <div className="ml-forecast-header">
              <div>
                <h2 className="section-title">🤖 ML Vaccine Demand Forecast</h2>
                <p className="ml-subtitle" style={{ margin: '4px 0 0 0' }}>
                  {mlView === 'weekly'
                    ? 'How long will each vaccine last this week?'
                    : 'How long will each vaccine last this month?'}
                </p>
              </div>
              <div className="ml-view-toggle">
                {['weekly', 'monthly'].map(v => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setMlView(v)}
                    className={`ml-toggle-btn ${mlView === v ? 'ml-toggle-active' : ''}`}
                    aria-pressed={mlView === v}>
                    {v === 'weekly' ? '📅 Weekly' : '📆 Monthly'}
                  </button>
                ))}
              </div>
            </div>

            {/* ── VACCINE FORECAST TABLE ── */}
            <div style={{ overflowX: 'auto', marginTop: '12px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                <colgroup>
                  <col style={{ width: '16%' }} />
                  <col style={{ width: '24%' }} />
                  <col style={{ width: '14%' }} />
                  <col style={{ width: '14%' }} />
                  <col style={{ width: '22%' }} />
                  <col style={{ width: '10%' }} />
                </colgroup>
                <thead>
                  <tr style={{ background: '#26a69a', color: 'white' }}>
                    <th style={thStyle}>Vaccine</th>
                    <th style={thStyle}>Stock Left</th>
                    <th style={thStyle}>{mlView === 'weekly' ? 'Needed/Week' : 'Needed/Month'}</th>
                    <th style={thStyle}>Peak Season Need</th>
                    <th style={thStyle}>Stock Will Last</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {vaccineForecasts.map((v) => {
                    const need = mlView === 'weekly' ? v.weeklyNeed : v.monthlyNeed;
                    const peakNeed = mlView === 'weekly' ? v.peakWeekly : v.peakMonthly;
                    const barPct = getStockBarPercent(v.available, v.minStock);
                    const barColor = getStockBarColor(v.risk);

                    return (
                      <tr key={v.id} style={{ background: v.id % 2 === 0 ? '#fafafa' : '#fff', borderBottom: '1px solid #f0f0f0' }}>

                        {/* Vaccine name */}
                        <td style={tdStyle}>
                          <strong style={{ fontSize: '13px' }}>{v.vaccine}</strong>
                        </td>

                        {/* Stock left + mini bar */}
                        <td style={tdStyle}>
                          <span style={{ fontWeight: 700, color: barColor, fontSize: '13px' }}>{v.available.toLocaleString()}</span>
                          <span style={{ fontSize: '11px', color: '#aaa' }}> / min {v.minStock}</span>
                          <div style={{ background: '#f0f0f0', borderRadius: '99px', height: '6px', marginTop: '5px', overflow: 'hidden' }}>
                            <div style={{ width: `${barPct}%`, background: barColor, height: '100%', borderRadius: '99px' }} />
                          </div>
                        </td>

                        {/* Needed this period */}
                        <td style={{ ...tdStyle, color: '#26a69a', fontWeight: 700 }}>
                          {need.toLocaleString()}
                        </td>

                        {/* Peak need */}
                        <td style={{ ...tdStyle, color: '#e53935', fontWeight: 700 }}>
                          {peakNeed.toLocaleString()}
                        </td>

                        {/* Stock will last */}
                        <td style={{ ...tdStyle, fontWeight: 600, color: barColor, fontSize: '12px' }}>
                          {getWeeksLeftLabel(v.weeksLeft)}
                        </td>

                        {/* Action */}
                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                          <span className={`${v.risk === 'critical' ? 'urgency-out' : v.risk === 'warning' ? 'urgency-low' : 'urgency-ok'} urgency-sm`}>
                            {v.risk === 'critical' ? '🚨 Order Now' : v.risk === 'warning' ? '⚠️ Order Soon' : '✅ OK'}
                          </span>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </article>

          {/* VACCINE AVAILABILITY */}
          <article className="vaccine-card">
            <h2 className="section-title">💉 Vaccine Availability</h2>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Vaccine</th>
                    <th>Available</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {vaccineData.map((vaccine) => (
                    <tr key={vaccine.id}>
                      <td>{vaccine.vaccine}</td>
                      <td>{vaccine.available.toLocaleString()}</td>
                      <td>
                        <span className={getVaccineStatusClass(vaccine.status)}>
                          {vaccine.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="total-row">
                    <td>Total</td>
                    <td>{vaccineData.reduce((sum, v) => sum + v.available, 0).toLocaleString()}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </article>

        </section>

        {/* ── VACCINES TO ORDER TABLE ── */}
        <section className="order-card" aria-label="Vaccines to Order">
          <div className="order-card-header">
            <div>
              <h2 className="section-title">📦 Vaccines to Order</h2>
              <p className="ml-subtitle">
                ML recommended restock list — {vaccinesToOrder.length} vaccine/s need ordering
              </p>
            </div>
            <div className="order-total-badge">
              Total to Order: <strong>{totalToOrder.toLocaleString()}</strong> doses
            </div>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Vaccine</th>
                  <th>Current Stock</th>
                  <th>Min. Required</th>
                  <th>ML Recommended Order</th>
                  <th>Urgency</th>
                </tr>
              </thead>
              <tbody>
                {vaccinesToOrder.map((vaccine) => (
                  <tr key={vaccine.id}>
                    <td><strong>{vaccine.vaccine}</strong></td>
                    <td>
                      <span style={{ color: vaccine.available === 0 ? '#c62828' : '#f57f17', fontWeight: '700' }}>
                        {vaccine.available.toLocaleString()}
                      </span>
                    </td>
                    <td>{vaccine.minStock.toLocaleString()}</td>
                    <td>
                      <strong className="ml-rec-text">
                        💉 {vaccine.mlRecommended.toLocaleString()} doses
                      </strong>
                    </td>
                    <td>
                      <span className={getOrderUrgencyClass(vaccine.status)}>
                        {getOrderUrgencyLabel(vaccine.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="total-row">
                  <td colSpan={3}>Total Doses to Order</td>
                  <td className="order-total-cell">💉 {totalToOrder.toLocaleString()} doses</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

      </main>
    </div>
  );
};

export default Dashboard;
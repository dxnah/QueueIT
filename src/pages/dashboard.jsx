// Dashboard.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import DailyAnalytics from '../components/DailyAnalytics';
import '../styles/dashboard.css';

import {
  mlPredictions,
  vaccineData,
} from '../data/dashboardData';


const Dashboard = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mlView, setMlView] = useState('monthly');

  // ── DYNAMIC CALCULATIONS ───────────────────────────────
  const totalAvailable  = vaccineData.reduce((sum, v) => sum + v.available, 0);
  const lowStockCount   = vaccineData.filter(v => v.status === 'Low Stock').length;
  const outOfStockCount = vaccineData.filter(v => v.status === 'Out Stock').length;
  const totalToOrder    = vaccineData.reduce((sum, v) => sum + v.mlRecommended, 0);
  const vaccinesToOrder = vaccineData.filter(v =>
    v.status === 'Low Stock' || v.status === 'Out Stock'
  );

  // ── DYNAMIC COLOR HELPERS ──────────────────────────────
  const getAvailableColor  = (total) => total > 500 ? '#26a69a' : total > 100 ? '#f57f17' : '#c62828';
  const getLowStockColor   = (count) => count === 0 ? '#26a69a' : count <= 2 ? '#f57f17' : '#c62828';
  const getOutOfStockColor = (count) => count === 0 ? '#26a69a' : '#c62828';

  const getAvailableBorder  = (total) => `4px solid ${getAvailableColor(total)}`;
  const getLowStockBorder   = (count) => `4px solid ${getLowStockColor(count)}`;
  const getOutOfStockBorder = (count) => `4px solid ${getOutOfStockColor(count)}`;

  const getAvailableLabel  = (total) => total > 500 ? '✅ Stock is sufficient' : total > 100 ? '⚠️ Stock is getting low' : '🚨 Stock is critically low';
  const getLowStockLabel   = (count) => count === 0 ? '✅ All vaccines well stocked' : count <= 2 ? '⚠️ Some vaccines running low' : '🚨 Many vaccines running low';
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

  const getCrowdLevelClass = (level) => {
    if (level === 'High' || level === 'High - Above High') return 'crowd-badge crowd-high';
    if (level === 'Normal - Medium' || level === 'Medium') return 'crowd-badge crowd-normal';
    return 'crowd-badge crowd-low';
  };

  // ── PER-VACCINE WEEKLY / MONTHLY PREDICTIONS ──────────
  const vaccineForecasts = vaccineData.map(v => {
    const monthlyNeed = v.mlRecommended;
    const weeklyNeed  = Math.round(monthlyNeed / 4);
    const peakMonthly = Math.round(monthlyNeed * 1.5);
    const peakWeekly  = Math.round(weeklyNeed * 1.5);
    const weeksLeft   = weeklyNeed > 0 ? (v.available / weeklyNeed).toFixed(1) : '∞';
    const risk        = parseFloat(weeksLeft) < 1 ? 'critical' : parseFloat(weeksLeft) < 2 ? 'warning' : 'ok';
    return { ...v, weeklyNeed, monthlyNeed, peakWeekly, peakMonthly, weeksLeft, risk };
  });

  return (
    <div className="dashboard-container">

      <button
        className="mobile-menu-toggle"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
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

      <div className="main-content">

        <h2 className="dashboard-heading">📊 Admin Dashboard</h2>
        <p className="dashboard-subheading">Welcome back, Admin</p>

        {/* ── STATS CARDS ── */}
        <div className="stats-container">
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
        </div>

        {/* ── DAILY ANALYTICS CHARTS ── */}
        <DailyAnalytics />

        {/* ── MIDDLE ROW: ML PREDICTIONS + VACCINE AVAILABILITY ── */}
        <div className="middle-row">

          {/* ── ML PREDICTIONS CARD ── */}
          <div className="ml-card ml-forecast-card">

            {/* Header + toggle */}
            <div className="ml-forecast-header">
              <h3 className="section-title">🤖 ML Vaccine Demand Forecast</h3>
              <div className="ml-view-toggle">
                {['weekly', 'monthly'].map(v => (
                  <button
                    key={v}
                    onClick={() => setMlView(v)}
                    className={`ml-toggle-btn ${mlView === v ? 'ml-toggle-active' : ''}`}>
                    {v === 'weekly' ? '📅 Weekly' : '📆 Monthly'}
                  </button>
                ))}
              </div>
            </div>

            <p className="ml-subtitle">
              {mlView === 'weekly'
                ? 'Estimated doses needed this week vs. peak week'
                : 'Estimated doses needed this month vs. peak month'}
            </p>

            {/* Show general forecast ONLY when Monthly is selected */}
            {mlView === 'monthly' && (
              <>
                <div className="ml-item">
                  <span className="ml-label">Predicted Doses — Normal Month</span>
                  <span className="ml-value-normal">
                    💉 {mlPredictions.vaccinesAtNormal.toLocaleString()}
                  </span>
                </div>
                <div className="ml-item">
                  <span className="ml-label">Predicted Doses — Peak Month</span>
                  <span className="ml-value-peak">
                    💉 {mlPredictions.vaccinesAtPeak.toLocaleString()}
                  </span>
                </div>

                <div className="ml-divider" />
              </>
            )}

            {/* NORMAL PERIOD SECTION */}
            <div className="ml-period-section">
              <h4 className="ml-period-title">
                📊 {mlView === 'weekly' ? 'NORMAL WEEKLY' : 'NORMAL MONTHLY'} BREAKDOWN
              </h4>
              <div className="ml-table-wrapper">
                <table className="data-table ml-forecast-table">
                  <thead>
                    <tr>
                      <th>Vaccine</th>
                      <th>Current Stock</th>
                      <th>{mlView === 'weekly' ? 'Needed/Week' : 'Needed/Month'}</th>
                      <th>Weeks Left</th>
                      <th>Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vaccineForecasts.map(v => (
                      <tr key={v.id}>
                        <td><strong>{v.vaccine}</strong></td>
                        <td className={`ml-stock-cell ml-stock-${v.risk}`}>
                          {v.available.toLocaleString()}
                        </td>
                        <td className="ml-need-cell">
                          {(mlView === 'weekly' ? v.weeklyNeed : v.monthlyNeed).toLocaleString()}
                        </td>
                        <td className={`ml-weeks-cell ${parseFloat(v.weeksLeft) < 1 ? 'ml-weeks-critical' : parseFloat(v.weeksLeft) < 2 ? 'ml-weeks-warning' : 'ml-weeks-ok'}`}>
                          {v.weeksLeft} wks
                        </td>
                        <td>
                          <span className={`${getOrderUrgencyClass(v.status)} urgency-sm`}>
                            {v.risk === 'critical' ? '🚨 Critical' : v.risk === 'warning' ? '⚠️ Warning' : '✅ Stable'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* PEAK PERIOD SECTION */}
            <div className="ml-period-section ml-period-peak">
              <h4 className="ml-period-title ml-period-title-peak">
                🔥 {mlView === 'weekly' ? 'PEAK WEEKLY' : 'PEAK MONTHLY'} BREAKDOWN
                <span className="ml-period-subtitle">
                  ({mlView === 'weekly' ? 'During high-traffic weeks' : `June - August`})
                </span>
              </h4>
              <div className="ml-table-wrapper">
                <table className="data-table ml-forecast-table">
                  <thead>
                    <tr>
                      <th>Vaccine</th>
                      <th>Current Stock</th>
                      <th>{mlView === 'weekly' ? 'Peak Week Need' : 'Peak Month Need'}</th>
                      <th>Weeks Left</th>
                      <th>Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vaccineForecasts.map(v => {
                      const peakNeed = mlView === 'weekly' ? v.peakWeekly : v.peakMonthly;
                      const peakWeeksLeft = peakNeed > 0 ? (v.available / peakNeed).toFixed(1) : '∞';
                      const peakRisk = parseFloat(peakWeeksLeft) < 1 ? 'critical' : parseFloat(peakWeeksLeft) < 2 ? 'warning' : 'ok';
                      
                      return (
                        <tr key={v.id}>
                          <td><strong>{v.vaccine}</strong></td>
                          <td className={`ml-stock-cell ml-stock-${peakRisk}`}>
                            {v.available.toLocaleString()}
                          </td>
                          <td className="ml-peak-cell">
                            {peakNeed.toLocaleString()}
                          </td>
                          <td className={`ml-weeks-cell ${parseFloat(peakWeeksLeft) < 1 ? 'ml-weeks-critical' : parseFloat(peakWeeksLeft) < 2 ? 'ml-weeks-warning' : 'ml-weeks-ok'}`}>
                            {peakWeeksLeft} wks
                          </td>
                          <td>
                            <span className={`urgency-sm ${peakRisk === 'critical' ? 'urgency-out' : peakRisk === 'warning' ? 'urgency-low' : 'urgency-ok'}`}>
                              {peakRisk === 'critical' ? '🚨 Critical' : peakRisk === 'warning' ? '⚠️ Warning' : '✅ Stable'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* VACCINE AVAILABILITY */}
          <div className="vaccine-card">
            <h3 className="section-title">💉 Vaccine Availability</h3>
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
          </div>

        </div>

        {/* ── VACCINES TO ORDER TABLE ── */}
        <div className="order-card">
          <div className="order-card-header">
            <div>
              <h3 className="section-title">📦 Vaccines to Order</h3>
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
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
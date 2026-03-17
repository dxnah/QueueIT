// dashboard.jsx

import React, { useState, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import DailyAnalytics from '../components/DailyAnalytics';
import useClickOutside from '../hooks/useClickOutside';
import '../styles/dashboard.css';
import { useNavigate } from 'react-router-dom';
import {
  vaccineData,
  PEAK_MONTHS,
} from '../data/dashboardData';

// ─── Month list ───────────────────────────────────────────────────────────────
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

const DAYS_IN_MONTH = {
  January:31,February:28,March:31,April:30,May:31,June:30,
  July:31,August:31,September:30,October:31,November:30,December:31,
};

// ─── Urgency styling helpers ──────────────────────────────────────────────────
const urgencyStyle = (level) => {
  if (level === 'urgent') return { bg: '#ffebee', color: '#c62828', border: '#ef9a9a', label: '🚨 Urgent' };
  if (level === 'soon')   return { bg: '#fff8e1', color: '#f57f17', border: '#ffe082', label: '⚠️ Soon'   };
  return                         { bg: '#e8f5e9', color: '#2e7d32', border: '#a5d6a7', label: '✅ Normal'  };
};

// ─── Dropdown wrapper ─────────────────────────────────────────────────────────
const DropdownWrap = ({ trigger, children, isOpen, onClose }) => {
  const ref = useRef(null);
  useClickOutside(ref, onClose);
  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      {trigger}
      {isOpen && (
        <div className="dropdown-panel">
          {children}
        </div>
      )}
    </div>
  );
};

// ─── Log Usage Modal ──────────────────────────────────────────────────────────
const LogUsageModal = ({ month, onClose, onSave }) => {
  const [day, setDay] = useState(1);
  const [amounts, setAmounts] = useState(
    Object.fromEntries(vaccineData.map(v => [v.vaccine, '']))
  );

  const totalDays = DAYS_IN_MONTH[month] || 30;

  const handleSave = () => {
    vaccineData.forEach(v => {
      const amt = parseInt(amounts[v.vaccine]) || 0;
      if (amt > 0) logDailyUsage(v.vaccine, month, day, amt);
    });
    onSave();
    onClose();
  };

  return (
    <div className="modal-overlay-dashboard">
      <div className="modal-box-dashboard">
        <div className="modal-header-row">
          <h3 className="modal-title-dashboard">📋 Log Daily Usage — {month}</h3>
          <button type="button" className="modal-close-dashboard" onClick={onClose}>✕</button>
        </div>

        {/* Day selector */}
        <div className="modal-field-dashboard">
          <label htmlFor="day-select" className="modal-label-dashboard">
            Day of {month}
          </label>
          <select
            id="day-select"
            value={day}
            onChange={e => setDay(parseInt(e.target.value))}
            className="modal-select-dashboard"
          >
            {Array.from({ length: totalDays }, (_, i) => i + 1).map(d => (
              <option key={d} value={d}>Day {d}</option>
            ))}
          </select>
        </div>

        {/* Doses per vaccine */}
        {vaccineData.map(v => (
          <div key={v.vaccine} className="modal-field-dashboard">
            <label htmlFor={`dose-${v.vaccine}`} className="modal-label-dashboard">
              {v.vaccine}
            </label>
            <input
              id={`dose-${v.vaccine}`}
              type="number"
              min="0"
              placeholder="Doses used today"
              value={amounts[v.vaccine]}
              onChange={e => setAmounts(prev => ({ ...prev, [v.vaccine]: e.target.value }))}
              className="modal-input-dashboard"
            />
          </div>
        ))}

        <div className="modal-actions-dashboard">
          <button type="button" onClick={handleSave} className="modal-btn-save-dashboard">
            💾 Save Usage
          </button>
          <button type="button" onClick={onClose} className="modal-btn-cancel-dashboard">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const Dashboard = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [orderMonth, setOrderMonth]             = useState('January');
  const [monthDropOpen, setMonthDropOpen]       = useState(false);
  const [showLogModal, setShowLogModal]         = useState(false);
  const [refreshKey, setRefreshKey]             = useState(0);

  // ── DYNAMIC CALCULATIONS ──────────────────────────────
  const totalAvailable  = vaccineData.reduce((sum, v) => sum + v.available, 0);
  const lowStockCount   = vaccineData.filter(v => v.status === 'Low Stock').length;
  const outOfStockCount = vaccineData.filter(v => v.status === 'Out Stock').length;
  const totalToOrder    = vaccineData.reduce((sum, v) => sum + v.mlRecommended, 0);
  const vaccinesToOrder = vaccineData.filter(v => v.status === 'Low Stock' || v.status === 'Out Stock');

  // ── COLOR HELPERS ──────────────────────────────────────
  const getAvailableColor  = (t) => t > 500 ? '#26a69a' : t > 100 ? '#f57f17' : '#c62828';
  const getLowStockColor   = (c) => c === 0 ? '#26a69a' : c <= 2 ? '#f57f17' : '#c62828';
  const getOutOfStockColor = (c) => c === 0 ? '#26a69a' : '#c62828';
  const getAvailableLabel  = (t) => t > 500 ? '✅ Stock is sufficient' : t > 100 ? '⚠️ Stock is getting low' : '🚨 Stock is critically low';
  const getLowStockLabel   = (c) => c === 0 ? '✅ All vaccines well stocked' : c <= 2 ? '⚠️ Some vaccines running low' : '🚨 Many vaccines running low';
  const getOutOfStockLabel = (c) => c === 0 ? '✅ All vaccines available' : '🚨 Immediate restocking needed';
  const getVaccineStatusClass = (s) => s === 'In Stock' ? 'status-in-stock' : s === 'Low Stock' ? 'status-low-stock' : 'status-out-stock';

  // ── MONTHLY ORDER DATA ──────────────────────────────────
  const isPeak = PEAK_MONTHS.includes(orderMonth);

  const monthlyOrderData = vaccineData.map(v => {
    const required  = getMonthlyRequirement(v.vaccine, orderMonth);
    const usedSoFar = getUsedThisMonth(v.vaccine, orderMonth);
    const remaining = Math.max(0, required - usedSoFar);
    const urgency   = getOrderUrgency(remaining, required);
    const pct       = required > 0 ? Math.min(100, Math.round((remaining / required) * 100)) : 100;
    return { ...v, required, usedSoFar, remaining, urgency, pct };
  });

  const monthTotalRequired  = monthlyOrderData.reduce((s, v) => s + v.required, 0);
  const monthTotalRemaining = monthlyOrderData.reduce((s, v) => s + v.remaining, 0);

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
        <section className="stats-container">
          <div className="stat-box" style={{ borderTop: `4px solid ${getAvailableColor(totalAvailable)}` }}>
            <h3 className="stat-title">Vaccines Available</h3>
            <p className="stat-number" style={{ color: getAvailableColor(totalAvailable) }}>{totalAvailable.toLocaleString()}</p>
            <p className="stat-note">{getAvailableLabel(totalAvailable)}</p>
          </div>
          <div className="stat-box" style={{ borderTop: '4px solid #e53935' }}>
            <h3 className="stat-title">Vaccines to Order</h3>
            <p className="stat-number" style={{ color: '#e53935' }}>{totalToOrder.toLocaleString()}</p>
            <p className="stat-note">💊 {vaccinesToOrder.length} vaccine types need restocking</p>
          </div>
          <div className="stat-box" style={{ borderTop: `4px solid ${getLowStockColor(lowStockCount)}` }}>
            <h3 className="stat-title">Low Stock</h3>
            <p className="stat-number" style={{ color: getLowStockColor(lowStockCount) }}>{lowStockCount}</p>
            <p className="stat-note">{getLowStockLabel(lowStockCount)}</p>
          </div>
          <div className="stat-box" style={{ borderTop: `4px solid ${getOutOfStockColor(outOfStockCount)}` }}>
            <h3 className="stat-title">Out of Stock</h3>
            <p className="stat-number" style={{ color: getOutOfStockColor(outOfStockCount) }}>{outOfStockCount}</p>
            <p className="stat-note">{getOutOfStockLabel(outOfStockCount)}</p>
          </div>
        </section>

        {/* ── DAILY ANALYTICS (charts only — forecast table removed) ── */}
        <DailyAnalytics />

        {/* ── VACCINE AVAILABILITY ── */}
        <section className="middle-row" aria-label="Vaccine Availability">
          <article className="vaccine-card">
            <h2 className="section-title">💉 Vaccine Availability</h2>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th scope="col">Vaccine</th>
                    <th scope="col">Available</th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {vaccineData.map(vaccine => (
                    <tr key={vaccine.id}>
                      <td>{vaccine.vaccine}</td>
                      <td>{vaccine.available.toLocaleString()}</td>
                      <td><span className={getVaccineStatusClass(vaccine.status)}>{vaccine.status}</span></td>
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

        {/* ── VACCINES TO ORDER ── */}
        <section className="order-card" aria-label="Vaccines to Order" key={refreshKey}>

          {/* Header */}
          <div className="order-card-header">
            <div>
              <h2 className="section-title">📦 Vaccines to Order</h2>
              <p className="ml-subtitle">
                Monthly restock tracker — {orderMonth}{isPeak ? ' 🔥 Peak Season' : ''}
              </p>
            </div>

            <div className="order-card-controls">
              {/* Log daily usage button */}
              <button
                type="button"
                className="btn-log-usage-dashboard"
                onClick={() => setShowLogModal(true)}>
                📋 Log Daily Usage
              </button>

              {/* Month dropdown */}
              <DropdownWrap
                isOpen={monthDropOpen}
                onClose={() => setMonthDropOpen(false)}
                trigger={
                  <button
                    type="button"
                    className="btn-month-dropdown"
                    onClick={() => setMonthDropOpen(v => !v)}>
                    📅 {orderMonth} ▾
                  </button>
                }>
                {MONTHS.map(m => {
                  const isPeakM = PEAK_MONTHS.includes(m);
                  return (
                    <div
                      key={m}
                      className={`dropdown-item-dashboard ${m === orderMonth ? 'dropdown-item-active' : ''} ${isPeakM ? 'dropdown-item-peak' : ''}`}
                      onMouseEnter={e => e.currentTarget.style.background = isPeakM ? '#fff3e0' : '#f5f5f5'}
                      onMouseLeave={e => e.currentTarget.style.background = m === orderMonth ? '#e0f7f4' : 'white'}
                      onClick={() => { setOrderMonth(m); setMonthDropOpen(false); }}
                    >
                      <span>{m}</span>
                      {isPeakM
                        ? <span className="peak-badge-dashboard">🔥 PEAK</span>
                        : m === orderMonth ? <span className="check-mark-dashboard">✓</span> : null
                      }
                    </div>
                  );
                })}
              </DropdownWrap>

              {/* Total badge */}
              <div className="order-total-badge">
                Monthly Required: <strong>{monthTotalRequired.toLocaleString()}</strong> doses
              </div>
            </div>
          </div>

          {/* Peak season notice */}
          {isPeak && (
            <div className="peak-notice-dashboard">
              🔥 <strong>Peak Season ({orderMonth}):</strong> Monthly requirements are 1.5× higher than normal. Plan restocking accordingly.
            </div>
          )}

          {/* Table */}
          <div className="table-wrapper">
            <table className="data-table order-table">
              <thead>
                <tr>
                  {['Vaccine', 'Current Stock', 'Monthly Required', 'Used This Month', 'Remaining Budget', 'Progress', 'Urgency'].map(col => (
                    <th key={col} scope="col">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {monthlyOrderData.map((v, i) => {
                  const u = urgencyStyle(v.urgency);
                  return (
                    <tr key={v.id} className={i % 2 === 0 ? 'row-even' : 'row-odd'}>
                      <td className="td-vaccine-name">{v.vaccine}</td>
                      <td>
                        <span className={v.available === 0 ? 'stock-critical' : v.available < v.minStock ? 'stock-warning' : 'stock-ok'}>
                          {v.available.toLocaleString()}
                        </span>
                        <span className="stock-unit"> doses</span>
                      </td>
                      <td className="td-required">
                        {v.required.toLocaleString()}
                        {isPeak && <span className="peak-fire-icon">🔥</span>}
                      </td>
                      <td className="td-used">{v.usedSoFar.toLocaleString()}</td>
                      <td className={v.urgency === 'urgent' ? 'td-remaining-urgent' : v.urgency === 'soon' ? 'td-remaining-soon' : 'td-remaining-ok'}>
                        {v.remaining.toLocaleString()}
                      </td>
                      <td className="td-progress">
                        <div className="progress-track">
                          <div
                            className="progress-fill"
                            style={{
                              width: `${v.pct}%`,
                              background: v.urgency === 'urgent' ? '#e53935' : v.urgency === 'soon' ? '#f57f17' : '#26a69a',
                            }}
                          />
                        </div>
                        <span className="progress-label">{v.pct}% remaining</span>
                      </td>
                      <td>
                        <span
                          className="urgency-badge"
                          style={{ background: u.bg, color: u.color, border: `1.5px solid ${u.border}` }}>
                          {u.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="total-row">
                  <td colSpan={2}>Total for {orderMonth}</td>
                  <td>{monthTotalRequired.toLocaleString()} doses</td>
                  <td className="td-used">{monthlyOrderData.reduce((s, v) => s + v.usedSoFar, 0).toLocaleString()}</td>
                  <td className="td-remaining-ok">{monthTotalRemaining.toLocaleString()}</td>
                  <td colSpan={2} className="tfoot-note">
                    💉 {monthTotalRemaining.toLocaleString()} doses remaining this month
                  </td>
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
// dashboard.jsx

import React, { useState, useRef, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import DailyAnalytics from '../components/DailyAnalytics';
import '../styles/dashboard.css';
import {
  vaccineData,
  PEAK_MONTHS,
  getMonthlyRequirement,
  getOrderUrgency,
  logDailyUsage,
  getUsedThisMonth,
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

// ─── Tiny outside-click hook ──────────────────────────────────────────────────
const useOutsideClick = (ref, cb) => {
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) cb(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [ref, cb]);
};

// ─── Dropdown wrapper ─────────────────────────────────────────────────────────
const DropdownWrap = ({ trigger, children, isOpen, onClose }) => {
  const ref = useRef(null);
  useOutsideClick(ref, onClose);
  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      {trigger}
      {isOpen && (
        <div style={{
          position: 'absolute', top: '110%', right: 0, zIndex: 999,
          background: 'white', border: '1px solid #e0e0e0',
          borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          minWidth: '180px', padding: '6px 0', overflow: 'hidden',
        }}>
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
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
      zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: 'white', borderRadius: '16px', padding: '28px',
        width: '420px', maxWidth: '95vw', boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#333' }}>
            📋 Log Daily Usage — {month}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#999' }}>✕</button>
        </div>

        {/* Day selector */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '13px', fontWeight: '600', color: '#555', display: 'block', marginBottom: '6px' }}>
            Day of {month}
          </label>
          <select
            value={day}
            onChange={e => setDay(parseInt(e.target.value))}
            style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #e0e0e0', fontSize: '13px' }}
          >
            {Array.from({ length: totalDays }, (_, i) => i + 1).map(d => (
              <option key={d} value={d}>Day {d}</option>
            ))}
          </select>
        </div>

        {/* Doses per vaccine */}
        {vaccineData.map(v => (
          <div key={v.vaccine} style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#555', display: 'block', marginBottom: '4px' }}>
              {v.vaccine}
            </label>
            <input
              type="number"
              min="0"
              placeholder="Doses used today"
              value={amounts[v.vaccine]}
              onChange={e => setAmounts(prev => ({ ...prev, [v.vaccine]: e.target.value }))}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #e0e0e0', fontSize: '13px', boxSizing: 'border-box' }}
            />
          </div>
        ))}

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button
            onClick={handleSave}
            style={{
              flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
              background: '#26a69a', color: 'white', fontWeight: '700',
              fontSize: '14px', cursor: 'pointer',
            }}
          >
            💾 Save Usage
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '10px', borderRadius: '8px',
              border: '1.5px solid #e0e0e0', background: 'white',
              color: '#555', fontWeight: '600', fontSize: '14px', cursor: 'pointer',
            }}
          >
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

  // Vaccines-to-Order month selector
  const [orderMonth, setOrderMonth]     = useState('January');
  const [monthDropOpen, setMonthDropOpen] = useState(false);
  const [showLogModal, setShowLogModal]  = useState(false);
  const [refreshKey, setRefreshKey]     = useState(0); // force re-render after logging

  // ── DYNAMIC CALCULATIONS ───────────────────────────────
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

  // ── PER-VACCINE MONTHLY ORDER DATA (keyed to orderMonth) ──
  const isPeak = PEAK_MONTHS.includes(orderMonth);

  const monthlyOrderData = vaccineData.map(v => {
    const required  = getMonthlyRequirement(v.vaccine, orderMonth);
    const usedSoFar = getUsedThisMonth(v.vaccine, orderMonth); // from daily logs
    const remaining = Math.max(0, required - usedSoFar);
    const urgency   = getOrderUrgency(remaining, required);
    const pct       = required > 0 ? Math.min(100, Math.round((remaining / required) * 100)) : 100;
    return { ...v, required, usedSoFar, remaining, urgency, pct };
  });

  const monthTotalRequired  = monthlyOrderData.reduce((s, v) => s + v.required, 0);
  const monthTotalRemaining = monthlyOrderData.reduce((s, v) => s + v.remaining, 0);

  // ── dropdown item style ────────────────────────────────
  const dropItem = (active, isPeakItem) => ({
    padding: '8px 16px', cursor: 'pointer', fontSize: '13px',
    fontWeight: active ? '700' : '500',
    background: active ? '#e0f7f4' : 'white',
    color: isPeakItem ? '#e53935' : active ? '#26a69a' : '#333',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px',
  });

  const btnStyle = {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    padding: '7px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '600',
    cursor: 'pointer', border: '1.5px solid #26a69a',
    background: '#26a69a', color: 'white',
    boxShadow: '0 2px 8px rgba(38,166,154,0.3)',
  };

  return (
    <div className="dashboard-container">

      <button type="button" className="mobile-menu-toggle"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Toggle navigation menu">
        ☰
      </button>

      <Sidebar activeTab="dashboard" isMobileMenuOpen={isMobileMenuOpen} onMenuClose={() => setIsMobileMenuOpen(false)} />

      {isMobileMenuOpen && <div className="overlay" onClick={() => setIsMobileMenuOpen(false)} />}

      {showLogModal && (
        <LogUsageModal
          month={orderMonth}
          onClose={() => setShowLogModal(false)}
          onSave={() => setRefreshKey(k => k + 1)}
        />
      )}

      <main className="main-content">

        <header>
          <h1 className="dashboard-heading">📊 Admin Dashboard</h1>
          <p className="dashboard-subheading">Welcome back, Admin</p>
        </header>

        {/* ── STATS CARDS ── */}
        <section className="stats-container" aria-label="Dashboard Statistics">
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

        {/* ── DAILY ANALYTICS ── */}
        <DailyAnalytics />

        {/* ── MIDDLE ROW ── */}
        <section className="middle-row" aria-label="Vaccine Availability">
          <article className="vaccine-card">
            
            {/* ── VACCINE AVAILABILITY ── */}
            <h2 className="section-title">💉 Vaccine Availability</h2>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr><th>Vaccine</th><th>Available</th><th>Status</th></tr>
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

          {/* Header row */}
          <div className="order-card-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 className="section-title">📦 Vaccines to Order</h2>
              <p className="ml-subtitle">
                Monthly restock tracker — {orderMonth}{isPeak ? ' 🔥 Peak Season' : ''}
              </p>
            </div>

            {/* Right side: month dropdown + log button + total badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>

              {/* Log daily usage button */}
              <button
                type="button"
                onClick={() => setShowLogModal(true)}
                style={{
                  padding: '7px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '600',
                  cursor: 'pointer', border: '1.5px solid #5c6bc0',
                  background: '#5c6bc0', color: 'white',
                  boxShadow: '0 2px 8px rgba(92,107,192,0.3)',
                }}>
                📋 Log Daily Usage
              </button>

              {/* Month dropdown */}
              <DropdownWrap
                isOpen={monthDropOpen}
                onClose={() => setMonthDropOpen(false)}
                trigger={
                  <button type="button" style={btnStyle} onClick={() => setMonthDropOpen(v => !v)}>
                    📅 {orderMonth} ▾
                  </button>
                }>
                {MONTHS.map(m => {
                  const isPeakM = PEAK_MONTHS.includes(m);
                  return (
                    <div
                      key={m}
                      style={dropItem(m === orderMonth, isPeakM)}
                      onMouseEnter={e => e.currentTarget.style.background = isPeakM ? '#fff3e0' : '#f5f5f5'}
                      onMouseLeave={e => e.currentTarget.style.background = m === orderMonth ? '#e0f7f4' : 'white'}
                      onClick={() => { setOrderMonth(m); setMonthDropOpen(false); }}
                    >
                      <span>{m}</span>
                      {isPeakM
                        ? <span style={{ fontSize: '10px', background: '#ffebee', color: '#e53935', padding: '2px 6px', borderRadius: '10px', fontWeight: '700' }}>🔥 PEAK</span>
                        : m === orderMonth ? <span style={{ color: '#26a69a', fontSize: '12px' }}>✓</span> : null
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
            <div style={{
              margin: '0 0 14px 0', padding: '10px 16px',
              background: '#fff3e0', borderRadius: '8px',
              border: '1px solid #ffcc80', fontSize: '13px', color: '#e65100',
              fontWeight: '600',
            }}>
              🔥 <strong>Peak Season ({orderMonth}):</strong> Monthly requirements are 1.5× higher than normal. Plan restocking accordingly.
            </div>
          )}

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#26a69a', color: 'white' }}>
                  {['Vaccine', 'Current Stock', 'Monthly Required', 'Used This Month', 'Remaining Budget', 'Progress', 'Urgency'].map(col => (
                    <th key={col} style={{ padding: '10px 14px', fontWeight: '700', fontSize: '12px', textAlign: 'left', whiteSpace: 'nowrap' }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {monthlyOrderData.map((v, i) => {
                  const u = urgencyStyle(v.urgency);
                  return (
                    <tr key={v.id} style={{ borderBottom: '1px solid #f0f0f0', background: i % 2 === 0 ? '#fafafa' : 'white' }}>

                      {/* Vaccine name */}
                      <td style={{ padding: '12px 14px', fontWeight: '700', color: '#333' }}>{v.vaccine}</td>

                      {/* Current physical stock */}
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ fontWeight: '700', color: v.available === 0 ? '#c62828' : v.available < v.minStock ? '#f57f17' : '#26a69a' }}>
                          {v.available.toLocaleString()}
                        </span>
                        <span style={{ color: '#aaa', fontSize: '11px' }}> doses</span>
                      </td>

                      {/* Monthly requirement */}
                      <td style={{ padding: '12px 14px', color: '#333', fontWeight: '600' }}>
                        {v.required.toLocaleString()}
                        {isPeak && <span style={{ marginLeft: '5px', fontSize: '10px', color: '#e53935' }}>🔥</span>}
                      </td>

                      {/* Used so far */}
                      <td style={{ padding: '12px 14px', color: '#5c6bc0', fontWeight: '600' }}>
                        {v.usedSoFar.toLocaleString()}
                      </td>

                      {/* Remaining budget */}
                      <td style={{ padding: '12px 14px', fontWeight: '700', color: v.urgency === 'urgent' ? '#c62828' : v.urgency === 'soon' ? '#f57f17' : '#2e7d32' }}>
                        {v.remaining.toLocaleString()}
                      </td>

                      {/* Progress bar */}
                      <td style={{ padding: '12px 14px', minWidth: '120px' }}>
                        <div style={{ background: '#f0f0f0', borderRadius: '99px', height: '7px', overflow: 'hidden' }}>
                          <div style={{
                            width: `${v.pct}%`, height: '100%', borderRadius: '99px',
                            background: v.urgency === 'urgent' ? '#e53935' : v.urgency === 'soon' ? '#f57f17' : '#26a69a',
                            transition: 'width 0.4s ease',
                          }} />
                        </div>
                        <span style={{ fontSize: '10px', color: '#999', marginTop: '3px', display: 'block' }}>{v.pct}% remaining</span>
                      </td>

                      {/* Urgency badge */}
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{
                          background: u.bg, color: u.color,
                          border: `1.5px solid ${u.border}`,
                          padding: '4px 10px', borderRadius: '20px',
                          fontSize: '12px', fontWeight: '700', whiteSpace: 'nowrap',
                        }}>
                          {u.label}
                        </span>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ background: '#f5f5f5', fontWeight: '700' }}>
                  <td style={{ padding: '12px 14px' }} colSpan={2}>Total for {orderMonth}</td>
                  <td style={{ padding: '12px 14px', color: '#333' }}>{monthTotalRequired.toLocaleString()} doses</td>
                  <td style={{ padding: '12px 14px', color: '#5c6bc0' }}>
                    {monthlyOrderData.reduce((s, v) => s + v.usedSoFar, 0).toLocaleString()}
                  </td>
                  <td style={{ padding: '12px 14px', color: '#26a69a' }}>{monthTotalRemaining.toLocaleString()}</td>
                  <td colSpan={2} style={{ padding: '12px 14px', color: '#888', fontSize: '12px' }}>
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
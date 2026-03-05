// dashboard.jsx

import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import DailyAnalytics from '../components/DailyAnalytics';
import '../styles/dashboard.css';
import { useNavigate } from 'react-router-dom';
import {
  vaccineData,
  PEAK_MONTHS,
  logDailyUsage,
  getUsedThisMonth,
} from '../data/dashboardData';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

// ── Same forecast helper that lives in DemandForecast.jsx ──────────────────
// Duplicated here so Dashboard has no cross-page import dependency
const seededRand = (seed) => { const x = Math.sin(seed + 1) * 10000; return x - Math.floor(x); };
const getMonthMultiplier = (month) => PEAK_MONTHS.includes(month) ? 1.55 : 1.0;

const generateForecastData = (month) => {
  const monthMult = getMonthMultiplier(month);
  return vaccineData.map((v) => {
    const neededBase = Math.round(v.mlRecommended * monthMult);
    const weeksLeft  = v.available > 0 ? parseFloat((v.available / (neededBase / 30)).toFixed(1)) : 0;
    let action;
    if (v.available === 0)         action = 'order_now';
    else if (weeksLeft < 1.5)      action = 'order_soon';
    else if (weeksLeft < 3)        action = 'order_soon';
    else                           action = 'ok';
    return { ...v, neededBase, weeksLeft, action };
  });
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const Dashboard = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Use current real month for the snapshot card
  const currentMonthIdx = new Date().getMonth();
  const currentMonth    = MONTHS[currentMonthIdx];
  const isPeak          = PEAK_MONTHS.includes(currentMonth);

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

  // ── TOP 3 URGENT VACCINES for snapshot card ───────────
  const actionOrder = { order_now: 0, order_soon: 1, ok: 2 };
  const snapshotData = generateForecastData(currentMonth)
    .sort((a, b) => actionOrder[a.action] - actionOrder[b.action])
    .slice(0, 3);

  return (
    <section className="dashboard-container">

      <button type="button" className="mobile-menu-toggle"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>☰</button>

      <Sidebar isMobileMenuOpen={isMobileMenuOpen} onMenuClose={() => setIsMobileMenuOpen(false)} />
      {isMobileMenuOpen && <div className="overlay" onClick={() => setIsMobileMenuOpen(false)} />}

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

        {/* ── ML DEMAND SNAPSHOT CARD ── */}
        <section style={{
          background: 'white', borderRadius: '12px', padding: '22px 24px', marginBottom: '28px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.06),0 6px 16px rgba(0,0,0,0.10),0 12px 28px rgba(0,0,0,0.07)',
          borderTop: '4px solid #26a69a',
        }}>
          {/* Card header */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'16px', flexWrap:'wrap', gap:'10px' }}>
            <div>
              <h2 className="section-title">🤖 ML Demand Snapshot — {currentMonth}</h2>
              <p className="ml-subtitle">
                Top {snapshotData.length} most urgent vaccines right now
                {isPeak ? ' · 🔥 Peak Season active' : ''}
              </p>
            </div>
            <button
              onClick={() => navigate('/demand-forecast')}
              style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'8px 16px', borderRadius:'8px', fontSize:'13px', fontWeight:'600', cursor:'pointer', border:'1.5px solid #26a69a', background:'white', color:'#26a69a', transition:'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background='#26a69a'; e.currentTarget.style.color='white'; }}
              onMouseLeave={e => { e.currentTarget.style.background='white'; e.currentTarget.style.color='#26a69a'; }}>
              📊 View Full Forecast →
            </button>
          </div>

          {/* 3 vaccine rows */}
          <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
            {snapshotData.map(v => {
              const bg    = v.action === 'order_now' ? '#ffebee' : v.action === 'order_soon' ? '#fff8e1' : '#e8f5e9';
              const color = v.action === 'order_now' ? '#c62828' : v.action === 'order_soon' ? '#f57f17' : '#2e7d32';
              const bdr   = v.action === 'order_now' ? '#ef9a9a' : v.action === 'order_soon' ? '#ffe082' : '#a5d6a7';
              const lbl   = v.action === 'order_now' ? '🚨 Order Now' : v.action === 'order_soon' ? '⚠️ Order Soon' : '✅ Sufficient';
              const pct   = v.neededBase > 0 ? Math.min(100, Math.round((v.available / v.neededBase) * 100)) : 100;
              return (
                <div key={v.id} style={{ display:'flex', alignItems:'center', gap:'14px', padding:'14px 16px', borderRadius:'10px', background:bg, border:`1.5px solid ${bdr}`, flexWrap:'wrap' }}>

                  {/* Name + badge */}
                  <div style={{ flex:'1 1 160px', minWidth:0 }}>
                    <div style={{ fontSize:'14px', fontWeight:'700', color:'#333', marginBottom:'3px' }}>{v.vaccine}</div>
                    <span style={{ fontSize:'11px', fontWeight:'700', color, background:'white', padding:'2px 8px', borderRadius:'10px', border:`1px solid ${bdr}` }}>
                      {lbl}
                    </span>
                  </div>

                  {/* Stock count */}
                  <div style={{ textAlign:'center', flex:'0 0 auto' }}>
                    <div style={{ fontSize:'18px', fontWeight:'800', color: v.available === 0 ? '#c62828' : v.available < v.minStock ? '#f57f17' : '#26a69a' }}>
                      {v.available.toLocaleString()}
                    </div>
                    <div style={{ fontSize:'10px', color:'#999', textTransform:'uppercase', letterSpacing:'0.4px' }}>doses left</div>
                  </div>

                  {/* Progress bar */}
                  <div style={{ flex:'1 1 120px', minWidth:'100px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
                      <span style={{ fontSize:'10px', color:'#888' }}>vs monthly need</span>
                      <span style={{ fontSize:'10px', fontWeight:'700', color }}>{pct}%</span>
                    </div>
                    <div style={{ background:'rgba(0,0,0,0.08)', borderRadius:'99px', height:'8px', overflow:'hidden' }}>
                      <div style={{ width:`${pct}%`, height:'100%', borderRadius:'99px', background: v.action === 'order_now' ? '#e53935' : v.action === 'order_soon' ? '#f57f17' : '#26a69a', transition:'width 0.4s ease' }} />
                    </div>
                    <div style={{ fontSize:'10px', color:'#888', marginTop:'3px' }}>
                      {v.available.toLocaleString()} / {v.neededBase.toLocaleString()} doses needed
                    </div>
                  </div>

                  {/* ML rec */}
                  {v.mlRecommended > 0 && (
                    <div style={{ flex:'0 0 auto', padding:'8px 12px', borderRadius:'8px', background:'white', border:`1px solid ${bdr}`, textAlign:'center' }}>
                      <div style={{ fontSize:'13px', fontWeight:'800', color:'#5c6bc0' }}>{v.mlRecommended.toLocaleString()}</div>
                      <div style={{ fontSize:'10px', color:'#999' }}>ML order rec.</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div style={{ marginTop:'16px', paddingTop:'14px', borderTop:'1px solid #f0f0f0', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'8px' }}>
            <span style={{ fontSize:'12px', color:'#aaa' }}>
              Showing top 3 of {vaccineData.length} vaccines by urgency · Full management in Demand Forecast
            </span>
            <button onClick={() => navigate('/demand-forecast')}
              style={{ fontSize:'12px', color:'#26a69a', background:'none', border:'none', cursor:'pointer', fontWeight:'600', textDecoration:'underline' }}>
              See all vaccines →
            </button>
          </div>
        </section>

        {/* ── VACCINE AVAILABILITY TABLE ── */}
        <section className="middle-row">
          <article className="vaccine-card">
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

      </main>
    </section>
  );
};

export default Dashboard;
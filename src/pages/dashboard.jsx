import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import DailyAnalytics from '../components/DailyAnalytics';
import '../styles/dashboard.css';
import '../styles/topbar.css';
import { useNavigate } from 'react-router-dom';
import { vaccineAPI, mlAPI } from '../services/api';
import { PEAK_MONTHS } from '../data/dashboardData';
import { MONTHS } from '../data/analyticsConstants';



const formatStatus = (s) => {
  if (!s) return 'Unknown';
  if (s === 'in_stock'  || s === 'In Stock')  return 'In Stock';
  if (s === 'low_stock' || s === 'Low Stock') return 'Low Stock';
  if (s === 'out_stock' || s === 'Out Stock') return 'Out of Stock';
  return s;
};

const statusClass = (s) => {
  if (s === 'In Stock'  || s === 'in_stock')  return 'status-in-stock';
  if (s === 'Low Stock' || s === 'low_stock') return 'status-low-stock';
  return 'status-out-stock';
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [vaccines,   setVaccines]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [mlForecast, setMlForecast] = useState(null);
  const [mlMetrics,  setMlMetrics]  = useState(null);
  const [mlLoading,  setMlLoading]  = useState(true);

  const currentMonthIdx = new Date().getMonth();
  const currentMonth    = MONTHS[currentMonthIdx];
  const currentYear     = new Date().getFullYear();
  const isPeak          = PEAK_MONTHS.includes(currentMonth);

  useEffect(() => {
    vaccineAPI.getAll()
      .then(setVaccines)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
      Promise.all([
        mlAPI.predict(currentYear, currentMonthIdx + 1),
        mlAPI.getMetrics(),
      ]).then(([forecast, metrics]) => {
        setMlForecast(forecast);
        setMlMetrics(metrics);
      }).catch(e => console.error('ML:', e))
        .finally(() => setMlLoading(false));
    }, [currentMonthIdx, currentYear]);

  // ── Derived ─────────────────────────────────────────────────────────────────
  const totalDoses    = vaccines.reduce((s, v) => s + (v.available ?? 0), 0);
  const inStockCount  = vaccines.filter(v => v.status === 'In Stock'  || v.status === 'in_stock').length;
  const lowCount      = vaccines.filter(v => v.status === 'Low Stock' || v.status === 'low_stock').length;
  const outCount      = vaccines.filter(v => v.status === 'Out Stock' || v.status === 'out_stock').length;

  // Urgency sort — out of stock first, then low stock, then in stock
  const urgencyOrder = (v) => {
    const s = v.status;
    if (s === 'out_stock' || s === 'Out Stock') return 0;
    if (s === 'low_stock' || s === 'Low Stock') return 1;
    return 2;
  };
  const top3 = [...vaccines]
    .sort((a, b) => urgencyOrder(a) - urgencyOrder(b))
    .slice(0, 3);

  const predicted   = mlForecast?.prediction?.predicted_doses;
  const recommended = mlForecast?.prediction?.recommended_order;

  // ── Tiny helpers ─────────────────────────────────────────────────────────────
  const SectionLabel = ({ children }) => (
    <p style={{ margin:'0 0 10px', fontSize:11, color:'#999', fontWeight:700,
      textTransform:'uppercase', letterSpacing:'0.6px' }}>{children}</p>
  );

  const Divider = () => <hr style={{ border:'none', borderTop:'1px solid #eee', margin:'28px 0' }}/>;

  return (
    <section className="dashboard-container">
      <Sidebar/>
      <section className="main-wrapper">
        <TopBar/>
        <main className="main-content">

          {/* ── Title ── */}
          <header style={{ marginBottom: 28 }}>
            <h1 className="dashboard-heading">📊 Admin Dashboard</h1>
            <p className="dashboard-subheading">
              {currentMonth} {currentYear}
              {isPeak && <span style={{ marginLeft:10, color:'#e65100', fontWeight:700, fontSize:12 }}>🔥 Peak Season Active</span>}
            </p>
          </header>

          {error && (
            <div style={{ background:'#ffebee', border:'1px solid #ef9a9a', borderRadius:10,
              padding:'12px 18px', color:'#c62828', marginBottom:20, fontSize:13, fontWeight:600 }}>
              ⚠️ Could not load vaccine data: {error}
              <button onClick={() => window.location.reload()}
                style={{ marginLeft:12, padding:'4px 10px', borderRadius:6,
                  border:'1.5px solid #c62828', background:'white', color:'#c62828',
                  cursor:'pointer', fontSize:12, fontWeight:600 }}>Retry</button>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════
              SECTION 1 — ML FORECAST BANNER
          ══════════════════════════════════════════════════════ */}
          {!mlLoading && mlForecast && (
            <>
              <SectionLabel>🤖 ML Demand Forecast — This Month</SectionLabel>
              <div style={{
                background: 'linear-gradient(135deg, #1a7a74 0%, #26a69a 100%)',
                borderRadius: 14, padding: '24px 28px', marginBottom: 28,
                boxShadow: '0 4px 20px rgba(38,166,154,0.28)',
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', flexWrap: 'wrap', gap: 20,
              }}>
                {/* Left label */}
                <div>
                  <p style={{ margin:'0 0 4px', fontSize:13, color:'rgba(255,255,255,0.8)', fontWeight:600 }}>
                    {mlMetrics?.model_name || 'Linear Regression'} model prediction
                  </p>
                  <p style={{ margin:0, fontSize:11, color:'rgba(255,255,255,0.6)' }}>
                    Accuracy: R² {mlMetrics?.test_metrics?.R2} · Error margin: ±{mlMetrics?.test_metrics?.MAPE_pct}%
                    &nbsp;· 12% safety buffer applied to order recommendation
                  </p>
                </div>

                {/* Two numbers */}
                <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                  {[
                    { label:'Predicted ARV Doses Needed', value: predicted?.toLocaleString() ?? '—', sub:'doses this month' },
                    { label:'Recommended Order Quantity',  value: recommended?.toLocaleString() ?? '—', sub:'incl. 12% buffer' },
                  ].map(({ label, value, sub }) => (
                    <div key={label} style={{
                      textAlign:'center', background:'rgba(255,255,255,0.15)',
                      borderRadius:10, padding:'14px 22px', minWidth:140,
                    }}>
                      <p style={{ margin:'0 0 4px', fontSize:10, color:'rgba(255,255,255,0.75)',
                        fontWeight:700, textTransform:'uppercase', letterSpacing:'0.5px' }}>{label}</p>
                      <p style={{ margin:'0 0 2px', fontSize:32, fontWeight:800, color:'white', lineHeight:1 }}>{value}</p>
                      <p style={{ margin:0, fontSize:10, color:'rgba(255,255,255,0.6)' }}>{sub}</p>
                    </div>
                  ))}
                </div>

                <button onClick={() => navigate('/demand-forecast')}
                  style={{ padding:'10px 20px', borderRadius:8,
                    border:'1.5px solid rgba(255,255,255,0.6)',
                    background:'transparent', color:'white', fontSize:13,
                    fontWeight:700, cursor:'pointer', whiteSpace:'nowrap' }}
                  onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.15)'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                  View Full Forecast →
                </button>
              </div>
            </>
          )}

          {/* ══════════════════════════════════════════════════════
              SECTION 2 — STOCK OVERVIEW (4 cards)
          ══════════════════════════════════════════════════════ */}
          <SectionLabel>📦 Vaccine Stock Overview</SectionLabel>
          {loading ? (
            <div style={{ display:'flex', gap:16, marginBottom:28, flexWrap:'wrap' }}>
              {[1,2,3,4].map(i => (
                <div key={i} style={{ flex:'1 1 180px', height:100, borderRadius:12,
                  background:'#f0f0f0', animation:'vf-shimmer 1.4s infinite' }}/>
              ))}
            </div>
          ) : !error && (
            <div style={{ display:'flex', gap:16, marginBottom:28, flexWrap:'wrap' }}>
              {[
                {
                  icon:'💉', label:'Total Doses Available',
                  value: totalDoses.toLocaleString(),
                  sub: `across ${vaccines.length} vaccine types`,
                  color:'#26a69a',
                  note: totalDoses > 500 ? '✅ Stock level is healthy'
                      : totalDoses > 100 ? '⚠️ Stock getting low'
                      : '🚨 Critically low stock',
                },
                {
                  icon:'✅', label:'Vaccines In Stock',
                  value: inStockCount,
                  sub: 'types fully stocked',
                  color:'#2e7d32',
                  note: inStockCount === vaccines.length ? 'All vaccines sufficient' : `${vaccines.length - inStockCount} need attention`,
                },
                {
                  icon:'⚠️', label:'Vaccines Low Stock',
                  value: lowCount,
                  sub: 'types need restocking soon',
                  color: lowCount === 0 ? '#2e7d32' : '#f57f17',
                  note: lowCount === 0 ? '✅ None running low' : 'Order soon to avoid stockout',
                },
                {
                  icon:'🚨', label:'Vaccines Out of Stock',
                  value: outCount,
                  sub: 'types unavailable now',
                  color: outCount === 0 ? '#2e7d32' : '#e53935',
                  note: outCount === 0 ? '✅ All vaccines available' : 'Immediate order required',
                },
              ].map(({ icon, label, value, sub, color, note }) => (
                <div key={label} style={{
                  flex:'1 1 180px', minWidth:160, background:'white',
                  borderRadius:12, padding:'20px 18px', textAlign:'center',
                  borderTop:`4px solid ${color}`,
                  boxShadow:'0 2px 6px rgba(0,0,0,0.07),0 8px 20px rgba(0,0,0,0.09)',
                }}>
                  <p style={{ margin:'0 0 8px', fontSize:11, color:'#888',
                    textTransform:'uppercase', letterSpacing:'0.5px', fontWeight:600 }}>
                    {icon} {label}
                  </p>
                  <p style={{ margin:'0 0 2px', fontSize:32, fontWeight:800, color, lineHeight:1 }}>{value}</p>
                  <p style={{ margin:'0 0 6px', fontSize:11, color:'#aaa' }}>{sub}</p>
                  <p style={{ margin:0, fontSize:11, color:'#666', fontWeight:600 }}>{note}</p>
                </div>
              ))}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════
              SECTION 3 — DAILY ANALYTICS
          ══════════════════════════════════════════════════════ */}
          <SectionLabel>📊 Today's Dispensing Activity</SectionLabel>
          <DailyAnalytics/>

          <Divider/>

          {/* ══════════════════════════════════════════════════════
              SECTION 4 — URGENT VACCINES (top 3)
          ══════════════════════════════════════════════════════ */}
          <div style={{ display:'flex', justifyContent:'space-between',
            alignItems:'center', marginBottom:10, flexWrap:'wrap', gap:8 }}>
            <SectionLabel>🚨 Most Urgent Vaccines Right Now</SectionLabel>
            <button onClick={() => navigate('/vaccine')}
              style={{ fontSize:12, color:'#26a69a', background:'none', border:'none',
                cursor:'pointer', fontWeight:600, textDecoration:'underline',
                marginBottom:10 }}>
              Manage All Vaccines →
            </button>
          </div>

          {/* Legend */}
          <div style={{ display:'flex', gap:10, marginBottom:14, flexWrap:'wrap' }}>
            {[
              ['#e53935', '🚨 Out of Stock — order immediately'],
              ['#f57f17', '⚠️ Low Stock — order soon'],
              ['#2e7d32', '✅ In Stock — sufficient'],
            ].map(([c, l]) => (
              <span key={l} style={{ fontSize:11, color:c, fontWeight:600,
                background:`${c}15`, padding:'3px 10px', borderRadius:20,
                border:`1px solid ${c}30` }}>{l}</span>
            ))}
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:28 }}>
            {!loading && top3.map(v => {
              const s      = v.status;
              const isOut  = s === 'out_stock' || s === 'Out Stock';
              const isLow  = s === 'low_stock' || s === 'Low Stock';
              const bg     = isOut ? '#ffebee' : isLow ? '#fff8e1' : '#e8f5e9';
              const color  = isOut ? '#c62828' : isLow ? '#f57f17' : '#2e7d32';
              const border = isOut ? '#ef9a9a' : isLow ? '#ffe082' : '#a5d6a7';
              const lbl    = isOut ? '🚨 Out of Stock' : isLow ? '⚠️ Low Stock' : '✅ In Stock';
              const action = isOut ? 'Order immediately — patients cannot be served'
                           : isLow ? 'Order soon to prevent stockout'
                           : 'Stock level is sufficient';

              return (
                <div key={v.id} style={{
                  background: bg, border:`1.5px solid ${border}`,
                  borderRadius:12, padding:'16px 20px',
                  display:'flex', alignItems:'center',
                  justifyContent:'space-between', flexWrap:'wrap', gap:16,
                }}>
                  {/* Left — name + badge + action tip */}
                  <div style={{ flex:'1 1 200px', minWidth:0 }}>
                    <div style={{ fontSize:15, fontWeight:700, color:'#222', marginBottom:4 }}>
                      {v.name}
                    </div>
                    <span style={{ fontSize:11, fontWeight:700, color,
                      background:'white', padding:'2px 10px', borderRadius:10,
                      border:`1px solid ${border}`, marginRight:8 }}>{lbl}</span>
                    <span style={{ fontSize:11, color:'#666' }}>{action}</span>
                  </div>

                  {/* Center — doses left */}
                  <div style={{ textAlign:'center', minWidth:80 }}>
                    <div style={{ fontSize:28, fontWeight:800, color: isOut ? '#c62828' : '#333', lineHeight:1 }}>
                      {(v.available ?? 0).toLocaleString()}
                    </div>
                    <div style={{ fontSize:10, color:'#999', textTransform:'uppercase', letterSpacing:'0.4px' }}>
                      doses left
                    </div>
                  </div>

                  {/* Right — ML recommended order (if set) */}
                  {(v.ml_recommended ?? 0) > 0 ? (
                    <div style={{ textAlign:'center', background:'white',
                      border:`1px solid ${border}`, borderRadius:8,
                      padding:'8px 16px', minWidth:100 }}>
                      <div style={{ fontSize:18, fontWeight:800, color:'#5c6bc0' }}>
                        {v.ml_recommended.toLocaleString()}
                      </div>
                      <div style={{ fontSize:9, color:'#999', textTransform:'uppercase',
                        letterSpacing:'0.3px', marginTop:2 }}>ML order rec.</div>
                    </div>
                  ) : (
                    <div style={{ textAlign:'center', background:'white',
                      border:`1px solid #e0e0e0`, borderRadius:8,
                      padding:'8px 16px', minWidth:100, opacity:0.6 }}>
                      <div style={{ fontSize:12, color:'#999' }}>No ML rec.</div>
                      <div style={{ fontSize:9, color:'#bbb', marginTop:2 }}>
                        Set in Vaccines page
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {!loading && top3.length === 0 && (
              <p style={{ color:'#bbb', textAlign:'center', padding:'30px 0', fontSize:13 }}>
                No vaccines found. Add vaccines in Vaccine Management.
              </p>
            )}
          </div>

          <Divider/>

          {/* ══════════════════════════════════════════════════════
              SECTION 5 — FULL VACCINE TABLE
          ══════════════════════════════════════════════════════ */}
          <div style={{ display:'flex', justifyContent:'space-between',
            alignItems:'center', marginBottom:10, flexWrap:'wrap', gap:8 }}>
            <SectionLabel>💉 All Vaccines — Current Availability</SectionLabel>
            <button onClick={() => navigate('/vaccine')}
              style={{ fontSize:12, color:'#5c6bc0', background:'none', border:'none',
                cursor:'pointer', fontWeight:600, textDecoration:'underline', marginBottom:10 }}>
              Manage Vaccines →
            </button>
          </div>

          {!loading && !error && (
            <div style={{
              background:'white', borderRadius:12, padding:'0 0 4px',
              boxShadow:'0 2px 6px rgba(0,0,0,0.07),0 8px 20px rgba(0,0,0,0.09)',
              marginBottom:40, overflow:'hidden',
            }}>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Vaccine Name</th>
                      <th>Doses Available</th>
                      <th>ML Recommended Order</th>
                      <th>Stock Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vaccines.map(v => (
                      <tr key={v.id}>
                        <td style={{ fontWeight:600, color:'#333' }}>{v.name}</td>
                        <td style={{
                          fontWeight:700,
                          color: (v.available??0) === 0 ? '#e53935'
                               : (v.available??0) < 50  ? '#f57f17' : '#333',
                        }}>
                          {(v.available ?? 0).toLocaleString()} doses
                        </td>
                        <td style={{ color:'#5c6bc0', fontWeight:600 }}>
                          {(v.ml_recommended ?? 0) > 0
                            ? `${v.ml_recommended.toLocaleString()} doses`
                            : <span style={{ color:'#bbb', fontSize:12 }}>Not set — edit in Vaccines page</span>}
                        </td>
                        <td>
                          <span className={statusClass(v.status)}>
                            {formatStatus(v.status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="total-row">
                      <td>Total</td>
                      <td>{totalDoses.toLocaleString()} doses</td>
                      <td>{vaccines.reduce((s,v)=>s+(v.ml_recommended??0),0).toLocaleString()} doses recommended</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

        </main>
      </section>
      <style>{`@keyframes vf-shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}`}</style>
    </section>
  );
};

export default Dashboard;
// DemandForecast.jsx
// Save this file in: src/pages/DemandForecast.jsx

import { useState } from 'react';
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import Sidebar from '../components/Sidebar';
import { vaccineData } from '../data/dashboardData';
import '../styles/dashboard.css';
import '../styles/analytics.css';

// ─── Constants ────────────────────────────────────────────────────────────────
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const PEAK_MONTHS = ['June', 'July', 'August'];

const DAYS_IN_MONTH = {
  January: 31, February: 28, March: 31, April: 30, May: 31, June: 30,
  July: 31, August: 31, September: 30, October: 31, November: 30, December: 31,
};

const MONTH_START_DAYS = {
  January: 0, February: 3, March: 3, April: 6, May: 1, June: 4,
  July: 6, August: 2, September: 5, October: 0, November: 3, December: 5,
};

const CHART_COLORS = ['#26a69a', '#f57f17', '#e53935', '#5c6bc0', '#2e7d32'];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const seededRand = (seed) => {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
};

const getMonthMultiplier = (month) => PEAK_MONTHS.includes(month) ? 1.55 : 1.0;

const generateForecastData = (month, weekIndex = null, day = null) => {
  const monthMult = getMonthMultiplier(month);
  const weekMult  = weekIndex !== null ? (1 + weekIndex * 0.05) : 1;
  const dayMult   = day !== null ? (1 / 30) : weekIndex !== null ? (1 / 4) : 1;

  return vaccineData.map((v) => {
    const baseAvail  = v.available;
    const neededBase = Math.round(v.mlRecommended * monthMult * weekMult * dayMult);
    const peakNeed   = Math.round(neededBase * 1.5);
    const divisor    = day ? 1 : weekIndex !== null ? 7 : 30;
    const weeksLeft  = baseAvail > 0 ? parseFloat((baseAvail / (neededBase / divisor)).toFixed(1)) : 0;

    let status, action;
    if (baseAvail === 0) {
      status = '🚨 No stock — order immediately';
      action = 'order_now';
    } else if (weeksLeft < 1.5) {
      status = `⚠️ About ${weeksLeft} week left — order soon`;
      action = 'order_soon';
    } else if (weeksLeft < 3) {
      status = `⚠️ Less than ${weeksLeft} wks left`;
      action = 'order_soon';
    } else {
      status = `✅ Good for ${weeksLeft} more weeks`;
      action = 'ok';
    }
    return { ...v, neededBase, peakNeed, weeksLeft, status, action };
  });
};

// ─── Mini Calendar ────────────────────────────────────────────────────────────
const MiniCalendar = ({ month, selectedDay, onSelectDay }) => {
  const totalDays = DAYS_IN_MONTH[month] || 30;
  const startDay  = MONTH_START_DAYS[month] || 0;
  const dayNames  = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const cells     = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);

  return (
    <div style={{ position:'absolute', top:'110%', right:0, zIndex:999, background:'white', border:'1px solid #e0e0e0', borderRadius:'12px', boxShadow:'0 8px 24px rgba(0,0,0,0.15)', padding:'16px', minWidth:'280px' }}>
      <p style={{ margin:'0 0 12px 0', fontWeight:'700', color:'#333', fontSize:'14px', textAlign:'center' }}>📅 {month}</p>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:'2px', textAlign:'center' }}>
        {dayNames.map(d => <div key={d} style={{ fontSize:'11px', fontWeight:'700', color:'#999', padding:'4px 0' }}>{d}</div>)}
        {cells.map((d, i) => (
          <div key={i} onClick={() => d && onSelectDay(d)}
            style={{ padding:'6px 2px', fontSize:'12px', borderRadius:'6px', cursor: d ? 'pointer' : 'default', background: d === selectedDay ? '#26a69a' : 'transparent', color: d === selectedDay ? 'white' : d ? '#333' : 'transparent', fontWeight: d === selectedDay ? '700' : '400', transition:'background 0.15s' }}
            onMouseEnter={e => { if (d && d !== selectedDay) e.target.style.background = '#e0f7f4'; }}
            onMouseLeave={e => { if (d !== selectedDay) e.target.style.background = 'transparent'; }}>
            {d || ''}
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Forecast Table ───────────────────────────────────────────────────────────
const ForecastTable = ({ month, weekIndex, day, viewMode, sortBy, filterAction }) => {
  const isPeak = PEAK_MONTHS.includes(month);
  let data     = generateForecastData(month, weekIndex, day);

  if (filterAction !== 'all') data = data.filter(r => r.action === filterAction);

  const actionOrder = { order_now: 0, order_soon: 1, ok: 2 };
  data = [...data].sort((a, b) => {
    if (sortBy === 'urgency') return actionOrder[a.action] - actionOrder[b.action];
    if (sortBy === 'stock')   return a.available - b.available;
    if (sortBy === 'needed')  return b.neededBase - a.neededBase;
    return a.vaccine.localeCompare(b.vaccine);
  });

  const periodLabel = day
    ? `${month} ${day}`
    : weekIndex !== null ? `${month} — Week ${weekIndex + 1}` : month;

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'14px', flexWrap:'wrap' }}>
        <h3 style={{ margin:0, fontSize:'16px', fontWeight:'700', color:'#333' }}>
          🤖 ML Vaccine Demand Forecast
        </h3>
        {isPeak && (
          <span style={{ background:'#fff3e0', color:'#e65100', fontSize:'11px', fontWeight:'700', padding:'3px 10px', borderRadius:'20px', border:'1px solid #ffcc80' }}>
            🔥 PEAK SEASON — Higher Demand Expected
          </span>
        )}
        <span style={{ background:'#f5f5f5', color:'#666', fontSize:'11px', fontWeight:'600', padding:'3px 10px', borderRadius:'20px' }}>
          {periodLabel}
        </span>
      </div>
      <p style={{ margin:'0 0 14px 0', fontSize:'12px', color:'#888', fontStyle:'italic' }}>
        How long will each vaccine last {viewMode === 'daily' ? 'today' : viewMode === 'weekly' ? 'this week' : 'this month'}?
        {data.length < vaccineData.length && ` · Showing ${data.length} of ${vaccineData.length} vaccines`}
      </p>

      <div style={{ overflowX:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'13px' }}>
          <thead>
            <tr style={{ background:'#26a69a', color:'white' }}>
              {['Vaccine', 'Stock Left', 'Needed / Period', 'Peak Season Need', 'Stock Will Last', 'ML Confidence', 'Action'].map(col => (
                <th key={col} style={{ padding:'10px 14px', textAlign:'left', fontWeight:'700', fontSize:'12px', whiteSpace:'nowrap' }}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => {
              const confSeed   = vaccineData.findIndex(v => v.vaccine === row.vaccine) * 13 + MONTHS.indexOf(month);
              const confidence = Math.round(85 + seededRand(confSeed) * 12);
              const confColor  = confidence >= 92 ? '#2e7d32' : confidence >= 87 ? '#f57f17' : '#e53935';

              return (
                <tr key={row.vaccine} style={{ borderBottom:'1px solid #f0f0f0', background: i % 2 === 0 ? '#fafafa' : 'white', transition:'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f0fffe'}
                  onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? '#fafafa' : 'white'}>

                  <td style={{ padding:'12px 14px', fontWeight:'700', color:'#333' }}>{row.vaccine}</td>

                  <td style={{ padding:'12px 14px' }}>
                    <div style={{ display:'flex', flexDirection:'column', gap:'4px' }}>
                      <span style={{ color: row.available < row.mlRecommended * 0.5 ? '#e53935' : '#f57f17', fontWeight:'700' }}>
                        {row.available.toLocaleString()}
                        <span style={{ color:'#999', fontWeight:'400', fontSize:'11px' }}> / min {row.mlRecommended}</span>
                      </span>
                      <div style={{ height:'5px', background:'#e0e0e0', borderRadius:'3px', width:'120px' }}>
                        <div style={{ height:'100%', borderRadius:'3px', width:`${Math.min(100,(row.available / Math.max(row.mlRecommended,1))*100)}%`, background: row.available < row.mlRecommended * 0.5 ? '#e53935' : '#f57f17' }} />
                      </div>
                    </div>
                  </td>

                  <td style={{ padding:'12px 14px', color:'#333', fontWeight:'600' }}>{row.neededBase}</td>
                  <td style={{ padding:'12px 14px', color:'#e53935', fontWeight:'600' }}>{row.peakNeed}</td>

                  <td style={{ padding:'12px 14px' }}>
                    <span style={{ color: row.action === 'ok' ? '#2e7d32' : row.action === 'order_soon' ? '#f57f17' : '#e53935', fontSize:'12px' }}>
                      {row.status}
                    </span>
                  </td>

                  <td style={{ padding:'12px 14px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                      <div style={{ flex:1, background:'#f0f0f0', borderRadius:'99px', height:'6px', minWidth:'60px' }}>
                        <div style={{ width:`${confidence}%`, height:'100%', borderRadius:'99px', background: confColor }} />
                      </div>
                      <span style={{ fontSize:'12px', fontWeight:'700', color: confColor, whiteSpace:'nowrap' }}>{confidence}%</span>
                    </div>
                  </td>

                  <td style={{ padding:'12px 14px' }}>
                    {row.action === 'ok' ? (
                      <span style={{ background:'#e8f5e9', color:'#2e7d32', padding:'5px 12px', borderRadius:'20px', fontSize:'12px', fontWeight:'700', border:'1.5px solid #a5d6a7' }}>✅ OK</span>
                    ) : row.action === 'order_soon' ? (
                      <span style={{ background:'#fff8e1', color:'#f57f17', padding:'5px 12px', borderRadius:'20px', fontSize:'12px', fontWeight:'700', border:'1.5px solid #ffe082' }}>⚠️ Order Soon</span>
                    ) : (
                      <span style={{ background:'#ffebee', color:'#e53935', padding:'5px 12px', borderRadius:'20px', fontSize:'12px', fontWeight:'700', border:'1.5px solid #ef9a9a' }}>🚨 Order Now</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const DemandForecast = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [viewMode,      setViewMode]      = useState('monthly');
  const [selectedMonth, setSelectedMonth] = useState('January');
  const [selectedWeek,  setSelectedWeek]  = useState(0);
  const [selectedDay,   setSelectedDay]   = useState(1);

  const [monthDropOpen, setMonthDropOpen] = useState(false);
  const [weekDropOpen,  setWeekDropOpen]  = useState(false);
  const [calOpen,       setCalOpen]       = useState(false);

  const [sortBy,       setSortBy]       = useState('urgency');
  const [filterAction, setFilterAction] = useState('all');
  const [activeView,   setActiveView]   = useState('table');

  const isPeak = PEAK_MONTHS.includes(selectedMonth);

  const forecastData = generateForecastData(
    selectedMonth,
    viewMode === 'weekly' || viewMode === 'daily' ? selectedWeek : null,
    viewMode === 'daily' ? selectedDay : null
  );

  const barData = forecastData.map((r) => ({
    name:        r.vaccine.replace('Anti-', 'A-'),
    'Stock':     r.available,
    'Needed':    r.neededBase,
    'Peak Need': r.peakNeed,
  }));

  const trendData = MONTHS.map(m => {
    const mult = getMonthMultiplier(m);
    const row  = { month: m.slice(0,3), isPeak: PEAK_MONTHS.includes(m) };
    vaccineData.forEach(v => { row[v.vaccine] = Math.round(v.mlRecommended * mult); });
    row.total = vaccineData.reduce((s, v) => s + Math.round(v.mlRecommended * mult), 0);
    return row;
  });

  const periodLabel = viewMode === 'daily'
    ? `${selectedMonth} ${selectedDay}`
    : viewMode === 'weekly'
    ? `${selectedMonth} — Week ${selectedWeek + 1}`
    : selectedMonth;

  const btnStyle = (active) => ({
    display:'inline-flex', alignItems:'center', gap:'5px',
    padding:'7px 14px', borderRadius:'8px', fontSize:'13px', fontWeight:'600',
    cursor:'pointer', border:'1.5px solid', transition:'all 0.18s',
    background: active ? '#26a69a' : 'white',
    color: active ? 'white' : '#555',
    borderColor: active ? '#26a69a' : '#ddd',
    boxShadow: active ? '0 2px 8px rgba(38,166,154,0.3)' : '0 1px 3px rgba(0,0,0,0.08)',
  });

  const dropItemStyle = (active, isPeakItem = false) => ({
    padding:'8px 16px', cursor:'pointer', fontSize:'13px',
    fontWeight: active ? '700' : '500',
    background: active ? '#e0f7f4' : 'white',
    color: isPeakItem ? '#e53935' : active ? '#26a69a' : '#333',
    display:'flex', alignItems:'center', justifyContent:'space-between', gap:'8px',
    transition:'background 0.12s',
  });

  return (
    <div className="dashboard-container">

      <button className="mobile-menu-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>☰</button>
      <Sidebar isMobileMenuOpen={isMobileMenuOpen} onMenuClose={() => setIsMobileMenuOpen(false)} />
      {isMobileMenuOpen && <div className="overlay" onClick={() => setIsMobileMenuOpen(false)} />}

      <main className="main-content">

        {/* ── Page header ── */}
        <header>
          <h1 className="dashboard-heading">🤖 Demand Forecast</h1>
          <p className="dashboard-subheading">ML-powered vaccine demand predictions and restock planning</p>
        </header>

        {/* ── Peak banner ── */}
        {isPeak && (
          <div style={{ marginBottom:'20px', padding:'12px 18px', background:'#fff3e0', borderRadius:'10px', border:'1px solid #ffcc80', fontSize:'13px', color:'#e65100', fontWeight:'600' }}>
            🔥 <strong>Peak Season ({selectedMonth}):</strong> Dose requirements are automatically increased by 1.5×. Plan restocking accordingly.
          </div>
        )}

        {/* ── KPI CARDS REMOVED ── */}

        {/* ── Period selector + View toggle row ── */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'18px', flexWrap:'wrap', gap:'12px' }}>

          {/* Period controls */}
          <div style={{ display:'flex', alignItems:'center', gap:'8px', flexWrap:'wrap' }}>

            {/* MONTHLY */}
            <div style={{ position:'relative' }}>
              <button type="button" style={btnStyle(viewMode === 'monthly')}
                onClick={() => { setViewMode('monthly'); setMonthDropOpen(v => !v); setWeekDropOpen(false); setCalOpen(false); }}>
                📅 Monthly {viewMode === 'monthly' ? `(${selectedMonth.slice(0,3)})` : ''} ▾
              </button>
              {monthDropOpen && (
                <div style={{ position:'absolute', top:'110%', left:0, zIndex:999, background:'white', border:'1px solid #e0e0e0', borderRadius:'10px', boxShadow:'0 8px 24px rgba(0,0,0,0.15)', minWidth:'180px', padding:'6px 0', overflow:'hidden' }}>
                  {MONTHS.map(m => {
                    const isPeakM = PEAK_MONTHS.includes(m);
                    return (
                      <div key={m} style={dropItemStyle(m === selectedMonth, isPeakM)}
                        onMouseEnter={e => e.currentTarget.style.background = isPeakM ? '#fff3e0' : '#f5f5f5'}
                        onMouseLeave={e => e.currentTarget.style.background = m === selectedMonth ? '#e0f7f4' : 'white'}
                        onClick={() => { setSelectedMonth(m); setMonthDropOpen(false); setSelectedWeek(0); setSelectedDay(1); }}>
                        <span>{m}</span>
                        {isPeakM && <span style={{ fontSize:'10px', background:'#ffebee', color:'#e53935', padding:'2px 6px', borderRadius:'10px', fontWeight:'700' }}>🔥 PEAK</span>}
                        {m === selectedMonth && !isPeakM && <span style={{ color:'#26a69a', fontSize:'12px' }}>✓</span>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* WEEKLY */}
            <div style={{ position:'relative' }}>
              <button type="button" style={btnStyle(viewMode === 'weekly')}
                onClick={() => { setViewMode('weekly'); setWeekDropOpen(v => !v); setMonthDropOpen(false); setCalOpen(false); }}>
                📆 Weekly {viewMode === 'weekly' ? `(Wk ${selectedWeek + 1})` : ''} ▾
              </button>
              {weekDropOpen && (
                <div style={{ position:'absolute', top:'110%', left:0, zIndex:999, background:'white', border:'1px solid #e0e0e0', borderRadius:'10px', boxShadow:'0 8px 24px rgba(0,0,0,0.15)', minWidth:'160px', padding:'6px 0', overflow:'hidden' }}>
                  {[0, 1, 2, 3].map(wi => (
                    <div key={wi} style={dropItemStyle(selectedWeek === wi)}
                      onMouseEnter={e => e.currentTarget.style.background = selectedWeek === wi ? '#e0f7f4' : '#f5f5f5'}
                      onMouseLeave={e => e.currentTarget.style.background = selectedWeek === wi ? '#e0f7f4' : 'white'}
                      onClick={() => { setSelectedWeek(wi); setWeekDropOpen(false); }}>
                      Week {wi + 1}
                      {selectedWeek === wi && <span style={{ color:'#26a69a', fontSize:'12px' }}>✓</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* DAILY */}
            <div style={{ position:'relative' }}>
              <button type="button" style={btnStyle(viewMode === 'daily')}
                onClick={() => { setViewMode('daily'); setCalOpen(v => !v); setMonthDropOpen(false); setWeekDropOpen(false); }}>
                🗓️ Daily {viewMode === 'daily' ? `(${selectedMonth.slice(0,3)} ${selectedDay})` : ''} ▾
              </button>
              {calOpen && (
                <div style={{ position:'absolute', top:'110%', left:0, zIndex:999 }}>
                  <MiniCalendar month={selectedMonth} selectedDay={selectedDay}
                    onSelectDay={(d) => { setSelectedDay(d); setCalOpen(false); }} />
                </div>
              )}
            </div>

          </div>

          {/* View toggle */}
          <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
            {[
              { id:'table', label:'📋 Table'      },
              { id:'chart', label:'📊 Bar Chart'  },
              { id:'trend', label:'📈 Year Trend' },
            ].map(v => (
              <button key={v.id} onClick={() => setActiveView(v.id)} style={btnStyle(activeView === v.id)}>
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Sort + filter (table only) ── */}
        {activeView === 'table' && (
          <div style={{ display:'flex', gap:'8px', marginBottom:'16px', flexWrap:'wrap' }}>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              style={{ padding:'7px 12px', borderRadius:'8px', border:'1.5px solid #e0e0e0', fontSize:'13px', color:'#555', background:'white', cursor:'pointer' }}>
              <option value="urgency">Sort: Urgency</option>
              <option value="stock">Sort: Stock ↑</option>
              <option value="needed">Sort: Needed ↓</option>
              <option value="name">Sort: Name A–Z</option>
            </select>
            <select value={filterAction} onChange={e => setFilterAction(e.target.value)}
              style={{ padding:'7px 12px', borderRadius:'8px', border:'1.5px solid #e0e0e0', fontSize:'13px', color:'#555', background:'white', cursor:'pointer' }}>
              <option value="all">All Vaccines</option>
              <option value="order_now">🚨 Order Now Only</option>
              <option value="order_soon">⚠️ Order Soon Only</option>
              <option value="ok">✅ OK Only</option>
            </select>
          </div>
        )}

        {/* ══ TABLE VIEW ══════════════════════════════════════════════ */}
        {activeView === 'table' && (
          <div style={{ background:'white', borderRadius:'12px', padding:'20px', marginBottom:'30px', boxShadow:'0 2px 4px rgba(0,0,0,0.06),0 6px 16px rgba(0,0,0,0.10),0 12px 28px rgba(0,0,0,0.07)' }}>
            <ForecastTable
              month={selectedMonth}
              weekIndex={viewMode === 'weekly' || viewMode === 'daily' ? selectedWeek : null}
              day={viewMode === 'daily' ? selectedDay : null}
              viewMode={viewMode}
              sortBy={sortBy}
              filterAction={filterAction}
            />
          </div>
        )}

        {/* ══ BAR CHART VIEW ══════════════════════════════════════════ */}
        {activeView === 'chart' && (
          <div style={{ background:'white', borderRadius:'12px', padding:'24px', marginBottom:'30px', boxShadow:'0 2px 4px rgba(0,0,0,0.06),0 6px 16px rgba(0,0,0,0.10),0 12px 28px rgba(0,0,0,0.07)' }}>
            <h3 style={{ margin:'0 0 4px 0', fontSize:'16px', fontWeight:'700', color:'#333' }}>Stock vs Demand — {periodLabel}</h3>
            <p style={{ margin:'0 0 20px 0', fontSize:'12px', color:'#999' }}>Current stock, required doses, and peak season projections per vaccine</p>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={barData} margin={{ top:5, right:20, left:0, bottom:5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize:12, fontWeight:600 }} />
                <YAxis tick={{ fontSize:11 }} />
                <Tooltip contentStyle={{ borderRadius:'8px', fontSize:'13px' }} />
                <Legend wrapperStyle={{ fontSize:'12px', paddingTop:'12px' }} />
                <Bar dataKey="Stock"     fill="#26a69a" radius={[4,4,0,0]} />
                <Bar dataKey="Needed"    fill="#5c6bc0" radius={[4,4,0,0]} />
                <Bar dataKey="Peak Need" fill="#e53935" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
            <div style={{ display:'flex', gap:'12px', marginTop:'20px', flexWrap:'wrap' }}>
              {forecastData.map((r) => {
                const bg    = r.action === 'order_now' ? '#ffebee' : r.action === 'order_soon' ? '#fff8e1' : '#e8f5e9';
                const color = r.action === 'order_now' ? '#c62828' : r.action === 'order_soon' ? '#f57f17' : '#2e7d32';
                const bdr   = r.action === 'order_now' ? '#ef9a9a' : r.action === 'order_soon' ? '#ffe082' : '#a5d6a7';
                const lbl   = r.action === 'order_now' ? '🚨 Order Now' : r.action === 'order_soon' ? '⚠️ Order Soon' : '✅ OK';
                return (
                  <div key={r.vaccine} style={{ flex:'1 1 140px', padding:'12px 14px', borderRadius:'10px', background:bg, border:`1.5px solid ${bdr}` }}>
                    <div style={{ fontSize:'13px', fontWeight:'700', color:'#333', marginBottom:'4px' }}>{r.vaccine}</div>
                    <div style={{ fontSize:'12px', color, fontWeight:'700' }}>{lbl}</div>
                    <div style={{ fontSize:'11px', color:'#888', marginTop:'4px' }}>{r.available} / {r.neededBase} doses</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══ YEAR TREND VIEW ══════════════════════════════════════════ */}
        {activeView === 'trend' && (
          <div style={{ background:'white', borderRadius:'12px', padding:'24px', marginBottom:'30px', boxShadow:'0 2px 4px rgba(0,0,0,0.06),0 6px 16px rgba(0,0,0,0.10),0 12px 28px rgba(0,0,0,0.07)' }}>
            <h3 style={{ margin:'0 0 4px 0', fontSize:'16px', fontWeight:'700', color:'#333' }}>12-Month Demand Forecast</h3>
            <p style={{ margin:'0 0 6px 0', fontSize:'12px', color:'#999' }}>Projected monthly dose requirements. Peak months (Jun–Aug) are 1.5× base demand.</p>
            <div style={{ display:'flex', gap:'12px', marginBottom:'20px', flexWrap:'wrap' }}>
              <span style={{ fontSize:'12px', color:'#e53935', fontWeight:'600', background:'#ffebee', padding:'4px 10px', borderRadius:'20px' }}>🔥 Peak Season: Jun · Jul · Aug</span>
              <span style={{ fontSize:'12px', color:'#26a69a', fontWeight:'600', background:'#e0f7f4', padding:'4px 10px', borderRadius:'20px' }}>Dashed teal line = total demand</span>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={trendData} margin={{ top:5, right:20, left:0, bottom:5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize:12 }} />
                <YAxis tick={{ fontSize:11 }} />
                <Tooltip contentStyle={{ borderRadius:'8px', fontSize:'13px' }} />
                <Legend wrapperStyle={{ fontSize:'12px', paddingTop:'12px' }} />
                <ReferenceLine x="Jun" stroke="#ffcc80" strokeWidth={28} strokeOpacity={0.3} />
                <ReferenceLine x="Jul" stroke="#ffcc80" strokeWidth={28} strokeOpacity={0.3} />
                <ReferenceLine x="Aug" stroke="#ffcc80" strokeWidth={28} strokeOpacity={0.3} />
                {vaccineData.map((v, i) => (
                  <Line key={v.vaccine} type="monotone" dataKey={v.vaccine}
                    stroke={CHART_COLORS[i]} strokeWidth={2} dot={{ r:3 }} />
                ))}
                <Line type="monotone" dataKey="total" name="Total Demand"
                  stroke="#26a69a" strokeWidth={3} dot={{ r:4 }} strokeDasharray="6 3" />
              </LineChart>
            </ResponsiveContainer>
            <div style={{ marginTop:'24px', overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'12px' }}>
                <thead>
                  <tr style={{ background:'#f5f5f5' }}>
                    <th style={{ padding:'8px 12px', textAlign:'left', color:'#888', fontWeight:'700', fontSize:'11px', textTransform:'uppercase' }}>Month</th>
                    {vaccineData.map(v => (
                      <th key={v.vaccine} style={{ padding:'8px 12px', textAlign:'right', color:'#888', fontWeight:'700', fontSize:'11px', textTransform:'uppercase', whiteSpace:'nowrap' }}>
                        {v.vaccine.replace('Anti-', 'A-')}
                      </th>
                    ))}
                    <th style={{ padding:'8px 12px', textAlign:'right', color:'#26a69a', fontWeight:'700', fontSize:'11px', textTransform:'uppercase' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {trendData.map((row, i) => (
                    <tr key={row.month} style={{ borderBottom:'1px solid #f0f0f0', background: row.isPeak ? '#fff8f0' : i % 2 === 0 ? '#fafafa' : 'white' }}>
                      <td style={{ padding:'8px 12px', fontWeight: row.isPeak ? '700' : '500', color: row.isPeak ? '#e65100' : '#333' }}>
                        {MONTHS[i].slice(0,3)} {row.isPeak ? '🔥' : ''}
                      </td>
                      {vaccineData.map(v => (
                        <td key={v.vaccine} style={{ padding:'8px 12px', textAlign:'right', color:'#555' }}>
                          {row[v.vaccine].toLocaleString()}
                        </td>
                      ))}
                      <td style={{ padding:'8px 12px', textAlign:'right', fontWeight:'700', color:'#26a69a' }}>{row.total.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default DemandForecast;
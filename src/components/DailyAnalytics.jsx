// DailyAnalytics.jsx

import { useState, useRef, useEffect } from 'react';
import {
  AreaChart, Area,
  BarChart, Bar,
  LineChart, Line,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';

import { vaccineData } from '../data/dashboardData';
import '../styles/analytics.css';

// ─── Constants ───────────────────────────────────────────────────────────────
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const PEAK_MONTHS = ['June', 'July', 'August']; // indices 5, 6, 7

const DAYS_IN_MONTH = {
  January: 31, February: 28, March: 31, April: 30, May: 31, June: 30,
  July: 31, August: 31, September: 30, October: 31, November: 30, December: 31,
};

// Day-of-week offset so calendar starts correctly (simplified: Jan 1 = Wednesday for a generic year)
const MONTH_START_DAYS = {
  January: 0, February: 3, March: 3, April: 6, May: 1, June: 4,
  July: 6, August: 2, September: 5, October: 0, November: 3, December: 5,
};

// ─── Seeded random ────────────────────────────────────────────────────────────
const seededRand = (seed) => {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
};

// ─── Peak multiplier by month ─────────────────────────────────────────────────
const getMonthMultiplier = (month) => PEAK_MONTHS.includes(month) ? 1.55 : 1.0;

// ─── Generate hourly data (accepts month + optional week/day for scaling) ─────
const generateHourlyData = (month = 'January', weekIndex = null, day = null) => {
  const monthMult = getMonthMultiplier(month);
  const monthIdx = MONTHS.indexOf(month);
  const hours = [];

  for (let h = 7; h <= 17; h++) {
    const label = h < 12 ? `${h}:00 AM` : h === 12 ? `12:00 PM` : `${h - 12}:00 PM`;
    const isPeak = (h >= 9 && h <= 11) || (h >= 14 && h <= 16);
    const timeMultiplier = isPeak ? 1.4 : h < 9 || h > 16 ? 0.6 : 1;

    const weekMult = weekIndex !== null ? (1 + (weekIndex * 0.05)) : 1;
    const dayMult = day !== null ? (0.85 + seededRand(day * 7 + monthIdx) * 0.3) : 1;

    const entry = { time: label };
    let totalDispensed = 0;
    let totalWasted = 0;

    vaccineData.forEach((vaccine, vi) => {
      const seed = h * 10 + vi + monthIdx * 100 + (weekIndex || 0) * 1000 + (day || 0) * 10000;
      const rand = seededRand(seed);
      const baseRate = Math.max(1, Math.round(
        (vaccine.mlRecommended / 30) * timeMultiplier * monthMult * weekMult * dayMult * (0.85 + rand * 0.3)
      ));
      const wasted = Math.max(0, Math.round(baseRate * (0.02 + seededRand(seed + 50) * 0.03)));

      entry[vaccine.vaccine] = baseRate;
      entry[`${vaccine.vaccine}_w`] = wasted;
      totalDispensed += baseRate;
      totalWasted += wasted;
    });

    entry.totalDispensed = totalDispensed;
    entry.totalWasted = totalWasted;
    entry.efficiency = parseFloat(((totalDispensed / (totalDispensed + totalWasted)) * 100).toFixed(1));
    hours.push(entry);
  }
  return hours;
};

// ─── Generate forecast table data (monthly / weekly / daily) ──────────────────
const generateForecastData = (month, weekIndex = null, day = null) => {
  const monthMult = getMonthMultiplier(month);
  const weekMult = weekIndex !== null ? (1 + weekIndex * 0.05) : 1;
  const dayMult = day !== null ? (1 / 30) : weekIndex !== null ? (1 / 4) : 1;
  const monthIdx = MONTHS.indexOf(month);

  return vaccineData.map((v, i) => {
    const baseAvail = v.available;
    const neededBase = Math.round(v.mlRecommended * monthMult * weekMult * dayMult);
    const peakNeed = Math.round(neededBase * 1.5);
    const weeksLeft = baseAvail > 0 ? parseFloat((baseAvail / (neededBase / (day ? 1 : weekIndex !== null ? 7 : 30))).toFixed(1)) : 0;

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

// ─── Generate stock snapshots ──────────────────────────────────────────────────
const generateStockSnapshots = () => {
  const hours = [];
  for (let h = 7; h <= 17; h++) {
    const label = h < 12 ? `${h}:00 AM` : h === 12 ? `12:00 PM` : `${h - 12}:00 PM`;
    const entry = { time: label };
    vaccineData.forEach(v => { entry[v.vaccine] = v.available; });
    hours.push(entry);
  }
  return hours;
};

// ─── Colors ───────────────────────────────────────────────────────────────────
const COLORS = {
  'Anti-Rabies': '#26a69a',
  'Anti-Tetanus': '#f57f17',
  'Booster': '#e53935',
  'Hepatitis B': '#5c6bc0',
  'Flu Shot': '#2e7d32',
};
const CHART_COLORS = ['#26a69a', '#f57f17', '#e53935', '#5c6bc0', '#2e7d32'];

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'white', border: '1px solid #e0e0e0',
      borderRadius: '8px', padding: '12px 16px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.12)', fontSize: '13px',
    }}>
      <p style={{ margin: '0 0 8px 0', fontWeight: '700', color: '#333' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ margin: '3px 0', color: p.color || p.fill }}>
          {p.name}: <strong>{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</strong>
          {p.name === 'Efficiency' ? '%' : ' doses'}
        </p>
      ))}
    </div>
  );
};

// ─── Dropdown Component ───────────────────────────────────────────────────────
const Dropdown = ({ trigger, children, isOpen, onClose }) => {
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    if (isOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, onClose]);

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      {trigger}
      {isOpen && (
        <div style={{
          position: 'absolute', top: '110%', right: 0, zIndex: 999,
          background: 'white', border: '1px solid #e0e0e0',
          borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          minWidth: '160px', padding: '6px 0', overflow: 'hidden',
        }}>
          {children}
        </div>
      )}
    </div>
  );
};

// ─── Calendar Component ───────────────────────────────────────────────────────
const MiniCalendar = ({ month, selectedDay, onSelectDay }) => {
  const totalDays = DAYS_IN_MONTH[month] || 30;
  const startDay = MONTH_START_DAYS[month] || 0;
  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const cells = [];

  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);

  return (
    <div style={{
      position: 'absolute', top: '110%', right: 0, zIndex: 999,
      background: 'white', border: '1px solid #e0e0e0',
      borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
      padding: '16px', minWidth: '280px',
    }}>
      <p style={{ margin: '0 0 12px 0', fontWeight: '700', color: '#333', fontSize: '14px', textAlign: 'center' }}>
        📅 {month}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', textAlign: 'center' }}>
        {dayNames.map(d => (
          <div key={d} style={{ fontSize: '11px', fontWeight: '700', color: '#999', padding: '4px 0' }}>{d}</div>
        ))}
        {cells.map((d, i) => (
          <div
            key={i}
            onClick={() => d && onSelectDay(d)}
            style={{
              padding: '6px 2px',
              fontSize: '12px',
              borderRadius: '6px',
              cursor: d ? 'pointer' : 'default',
              background: d === selectedDay ? '#26a69a' : 'transparent',
              color: d === selectedDay ? 'white' : d ? '#333' : 'transparent',
              fontWeight: d === selectedDay ? '700' : '400',
              transition: 'background 0.15s',
              ':hover': d ? { background: '#e0f7f4' } : {},
            }}
            onMouseEnter={e => { if (d && d !== selectedDay) e.target.style.background = '#e0f7f4'; }}
            onMouseLeave={e => { if (d !== selectedDay) e.target.style.background = 'transparent'; }}
          >
            {d || ''}
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Forecast Table ───────────────────────────────────────────────────────────
const ForecastTable = ({ month, weekIndex, day, viewMode }) => {
  const isPeak = PEAK_MONTHS.includes(month);
  const data = generateForecastData(month, weekIndex, day);

  const periodLabel = day
    ? `${month} ${day}`
    : weekIndex !== null
    ? `${month} — Week ${weekIndex + 1}`
    : month;

  return (
    <div style={{ marginTop: '20px' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        marginBottom: '14px', flexWrap: 'wrap',
      }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#333' }}>
          🤖 ML Vaccine Demand Forecast
        </h3>
        {isPeak && (
          <span style={{
            background: '#fff3e0', color: '#e65100', fontSize: '11px',
            fontWeight: '700', padding: '3px 10px', borderRadius: '20px',
            border: '1px solid #ffcc80',
          }}>
            🔥 PEAK SEASON — Higher Demand Expected
          </span>
        )}
        <span style={{
          background: '#f5f5f5', color: '#666', fontSize: '11px',
          fontWeight: '600', padding: '3px 10px', borderRadius: '20px',
        }}>
          {periodLabel}
        </span>
      </div>

      {/* Subtitle */}
      <p style={{ margin: '0 0 14px 0', fontSize: '12px', color: '#888', fontStyle: 'italic' }}>
        How long will each vaccine last {viewMode === 'daily' ? 'today' : viewMode === 'weekly' ? 'this week' : 'this month'}?
      </p>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#26a69a', color: 'white' }}>
              {['Vaccine', 'Stock Left', 'Needed / Period', 'Peak Season Need', 'Stock Will Last', 'Action'].map(col => (
                <th key={col} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: '700', fontSize: '12px', whiteSpace: 'nowrap' }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={row.vaccine} style={{ borderBottom: '1px solid #f0f0f0', background: i % 2 === 0 ? '#fafafa' : 'white' }}>
                <td style={{ padding: '12px 14px', fontWeight: '700', color: '#333' }}>{row.vaccine}</td>
                <td style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{
                      color: row.available < row.mlRecommended * 0.5 ? '#e53935' : '#f57f17',
                      fontWeight: '700',
                    }}>
                      {row.available.toLocaleString()}
                      <span style={{ color: '#999', fontWeight: '400', fontSize: '11px' }}> / min {row.mlRecommended}</span>
                    </span>
                    <div style={{ height: '5px', background: '#e0e0e0', borderRadius: '3px', width: '120px' }}>
                      <div style={{
                        height: '100%', borderRadius: '3px',
                        width: `${Math.min(100, (row.available / Math.max(row.mlRecommended, 1)) * 100)}%`,
                        background: row.available < row.mlRecommended * 0.5 ? '#e53935' : '#f57f17',
                      }} />
                    </div>
                  </div>
                </td>
                <td style={{ padding: '12px 14px', color: '#333', fontWeight: '600' }}>{row.neededBase}</td>
                <td style={{ padding: '12px 14px', color: '#e53935', fontWeight: '600' }}>{row.peakNeed}</td>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{
                    color: row.action === 'ok' ? '#2e7d32' : row.action === 'order_soon' ? '#f57f17' : '#e53935',
                    fontSize: '12px',
                  }}>
                    {row.status}
                  </span>
                </td>
                <td style={{ padding: '12px 14px' }}>
                  {row.action === 'ok' ? (
                    <span style={{
                      background: '#e8f5e9', color: '#2e7d32',
                      padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700',
                      border: '1.5px solid #a5d6a7',
                    }}>✅ OK</span>
                  ) : row.action === 'order_soon' ? (
                    <span style={{
                      background: '#fff8e1', color: '#f57f17',
                      padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700',
                      border: '1.5px solid #ffe082', cursor: 'pointer',
                    }}>⚠️ Order Soon</span>
                  ) : (
                    <span style={{
                      background: '#ffebee', color: '#e53935',
                      padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700',
                      border: '1.5px solid #ef9a9a', cursor: 'pointer',
                    }}>🚨 Order Now</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const DailyAnalytics = () => {
  // View mode: 'monthly' | 'weekly' | 'daily'
  const [viewMode, setViewMode] = useState('monthly');

  // Selections
  const [selectedMonth, setSelectedMonth] = useState('January');
  const [selectedWeek, setSelectedWeek] = useState(0);   // 0-3
  const [selectedDay, setSelectedDay] = useState(1);

  // Dropdown open states
  const [monthDropOpen, setMonthDropOpen] = useState(false);
  const [weekDropOpen, setWeekDropOpen] = useState(false);
  const [calOpen, setCalOpen] = useState(false);

  // Chart state
  const [activeChart, setActiveChart] = useState('dispensed');
  const [selectedVax, setSelectedVax] = useState('all');

  const vaccineNames = vaccineData.map(v => v.vaccine);

  // Compute hourly data based on view
  const hourlyData = generateHourlyData(
    selectedMonth,
    viewMode === 'weekly' ? selectedWeek : viewMode === 'daily' ? selectedWeek : null,
    viewMode === 'daily' ? selectedDay : null
  );
  const stockData = generateStockSnapshots();

  // Summary stats
  const totalToday = hourlyData.reduce((s, h) => s + (h.totalDispensed || 0), 0);
  const wastedToday = hourlyData.reduce((s, h) => s + (h.totalWasted || 0), 0);
  const avgEfficiency = hourlyData.length
    ? (hourlyData.reduce((s, h) => s + (h.efficiency || 0), 0) / hourlyData.length).toFixed(1)
    : 0;
  const peakHour = hourlyData.reduce(
    (best, h) => h.totalDispensed > (best.totalDispensed || 0) ? h : best, {}
  );

  // Filter chart data by vaccine
  const chartData = selectedVax === 'all' ? hourlyData : hourlyData.map(h => ({
    time: h.time,
    [selectedVax]: h[selectedVax],
    [`${selectedVax}_w`]: h[`${selectedVax}_w`],
    totalDispensed: h[selectedVax],
    totalWasted: h[`${selectedVax}_w`],
    efficiency: h.efficiency,
  }));
  const keysToShow = selectedVax === 'all' ? vaccineNames : [selectedVax];

  // Period label for display
  const periodLabel = viewMode === 'daily'
    ? `${selectedMonth} ${selectedDay}`
    : viewMode === 'weekly'
    ? `${selectedMonth} — Week ${selectedWeek + 1}`
    : selectedMonth;

  const isPeak = PEAK_MONTHS.includes(selectedMonth);

  // ─── Shared button style ──────────────────────────────────────────────────
  const btnStyle = (active) => ({
    display: 'inline-flex', alignItems: 'center', gap: '5px',
    padding: '7px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '600',
    cursor: 'pointer', border: '1.5px solid',
    transition: 'all 0.18s',
    background: active ? '#26a69a' : 'white',
    color: active ? 'white' : '#555',
    borderColor: active ? '#26a69a' : '#ddd',
    boxShadow: active ? '0 2px 8px rgba(38,166,154,0.3)' : '0 1px 3px rgba(0,0,0,0.08)',
  });

  const dropItemStyle = (active, isPeakItem = false) => ({
    padding: '8px 16px', cursor: 'pointer', fontSize: '13px',
    fontWeight: active ? '700' : '500',
    background: active ? '#e0f7f4' : 'white',
    color: isPeakItem ? '#e53935' : active ? '#26a69a' : '#333',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px',
    transition: 'background 0.12s',
  });

  return (
    <div className="analytics-wrapper">

      {/* ── Forecast Table ── */}
      <div style={{ background: 'white', borderRadius: '14px', padding: '20px', marginBottom: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>

        {/* Controls row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>

            {/* ── MONTHLY button + dropdown ── */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                style={btnStyle(viewMode === 'monthly')}
                onClick={() => {
                  setViewMode('monthly');
                  setMonthDropOpen(v => !v);
                  setWeekDropOpen(false);
                  setCalOpen(false);
                }}
              >
                📅 Monthly {viewMode === 'monthly' ? `(${selectedMonth.slice(0, 3)})` : ''} ▾
              </button>
              {monthDropOpen && (
                <div style={{
                  position: 'absolute', top: '110%', right: 0, zIndex: 999,
                  background: 'white', border: '1px solid #e0e0e0',
                  borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  minWidth: '180px', padding: '6px 0', overflow: 'hidden',
                }}>
                  {MONTHS.map(m => {
                    const isPeakM = PEAK_MONTHS.includes(m);
                    return (
                      <div
                        key={m}
                        onMouseEnter={e => e.currentTarget.style.background = isPeakM ? '#fff3e0' : '#f5f5f5'}
                        onMouseLeave={e => e.currentTarget.style.background = m === selectedMonth ? '#e0f7f4' : 'white'}
                        style={dropItemStyle(m === selectedMonth, isPeakM)}
                        onClick={() => { setSelectedMonth(m); setMonthDropOpen(false); setSelectedWeek(0); setSelectedDay(1); }}
                      >
                        <span>{m}</span>
                        {isPeakM && (
                          <span style={{
                            fontSize: '10px', background: '#ffebee', color: '#e53935',
                            padding: '2px 6px', borderRadius: '10px', fontWeight: '700',
                          }}>🔥 PEAK</span>
                        )}
                        {m === selectedMonth && !isPeakM && <span style={{ color: '#26a69a', fontSize: '12px' }}>✓</span>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── WEEKLY button + dropdown ── */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                style={btnStyle(viewMode === 'weekly')}
                onClick={() => {
                  setViewMode('weekly');
                  setWeekDropOpen(v => !v);
                  setMonthDropOpen(false);
                  setCalOpen(false);
                }}
              >
                📆 Weekly {viewMode === 'weekly' ? `(Wk ${selectedWeek + 1})` : ''} ▾
              </button>
              {weekDropOpen && (
                <div style={{
                  position: 'absolute', top: '110%', right: 0, zIndex: 999,
                  background: 'white', border: '1px solid #e0e0e0',
                  borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  minWidth: '160px', padding: '6px 0', overflow: 'hidden',
                }}>
                  {[0, 1, 2, 3].map(wi => (
                    <div
                      key={wi}
                      style={dropItemStyle(selectedWeek === wi)}
                      onMouseEnter={e => e.currentTarget.style.background = selectedWeek === wi ? '#e0f7f4' : '#f5f5f5'}
                      onMouseLeave={e => e.currentTarget.style.background = selectedWeek === wi ? '#e0f7f4' : 'white'}
                      onClick={() => { setSelectedWeek(wi); setWeekDropOpen(false); }}
                    >
                      Week {wi + 1}
                      {selectedWeek === wi && <span style={{ color: '#26a69a', fontSize: '12px' }}>✓</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── DAILY button + calendar ── */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                style={btnStyle(viewMode === 'daily')}
                onClick={() => {
                  setViewMode('daily');
                  setCalOpen(v => !v);
                  setMonthDropOpen(false);
                  setWeekDropOpen(false);
                }}
              >
                🗓️ Daily {viewMode === 'daily' ? `(${selectedMonth.slice(0, 3)} ${selectedDay})` : ''} ▾
              </button>
              {calOpen && (
                <div style={{ position: 'absolute', top: '110%', right: 0, zIndex: 999 }}>
                  <MiniCalendar
                    month={selectedMonth}
                    selectedDay={selectedDay}
                    onSelectDay={(d) => { setSelectedDay(d); setCalOpen(false); }}
                  />
                </div>
              )}
            </div>

          </div>

          {/* Peak badge on header right */}
          {isPeak && (
            <span style={{
              background: '#ffebee', color: '#c62828',
              fontSize: '12px', fontWeight: '700', padding: '5px 12px',
              borderRadius: '20px', border: '1.5px solid #ef9a9a',
            }}>
              🔥 Peak Season Active
            </span>
          )}
        </div>

        {/* Forecast table */}
        <ForecastTable
          month={selectedMonth}
          weekIndex={viewMode === 'weekly' || viewMode === 'daily' ? selectedWeek : null}
          day={viewMode === 'daily' ? selectedDay : null}
          viewMode={viewMode}
        />
      </div>

      {/* ── Analytics Charts Section ── */}
      <div className="analytics-header">
        <div>
          <h3 className="analytics-title">📊 Vaccine Analytics — {periodLabel}</h3>
          <p className="analytics-subtext">
            {viewMode === 'daily'
              ? `Hourly dispensing data for ${selectedMonth} ${selectedDay}`
              : viewMode === 'weekly'
              ? `Week ${selectedWeek + 1} of ${selectedMonth} — dispensing overview`
              : `Monthly dispensing overview for ${selectedMonth}`}
            {isPeak && ' · 🔥 Peak season demand'}
          </p>
        </div>
      </div>

      {/* Summary chips */}
      <div className="analytics-stat-chips">
        {[
          { label: 'Total Dispensed Today', value: totalToday.toLocaleString(), unit: 'doses', color: '#26a69a', icon: '💉' },
          { label: 'Total Wasted Today', value: wastedToday.toLocaleString(), unit: 'doses', color: '#e53935', icon: '🗑️' },
          { label: 'Avg. Efficiency', value: `${avgEfficiency}%`, unit: '', color: '#2e7d32', icon: '📈' },
          { label: 'Peak Hour', value: peakHour.time || '—', unit: `${peakHour.totalDispensed || 0} doses`, color: '#f57f17', icon: '⏰' },
          { label: 'Hours Tracked', value: hourlyData.length, unit: 'hrs', color: '#5c6bc0', icon: '🕐' },
        ].map((chip, i) => (
          <div key={i} className="analytics-chip" style={{ borderTop: `3px solid ${chip.color}` }}>
            <span className="analytics-chip-icon">{chip.icon}</span>
            <span className="analytics-chip-value" style={{ color: chip.color }}>{chip.value}</span>
            <span className="analytics-chip-unit">{chip.unit}</span>
            <span className="analytics-chip-label">{chip.label}</span>
          </div>
        ))}
      </div>

      {/* Chart controls */}
      <div className="analytics-controls">
        <div className="analytics-tab-group">
          {[
            { key: 'dispensed', label: '💉 Dispensed by Hour' }, //area chart
            { key: 'stacked', label: '📊 Vaccine Breakdown' }, //bar chart
            { key: 'stock', label: '📦 Stock Levels' }, //line chart
            { key: 'efficiency', label: '📈 Efficiency Trend' }, //effiency chart
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveChart(tab.key)}
              className={`analytics-tab-btn ${activeChart === tab.key ? 'active' : ''}`}>
              {tab.label}
            </button>
          ))}
        </div>
        {activeChart !== 'stock' && (
          <select
            value={selectedVax}
            onChange={e => setSelectedVax(e.target.value)}
            className="analytics-vaccine-select">
            <option value="all">All Vaccines</option>
            {vaccineNames.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        )}
      </div>

      {/* Chart area */}
      <div className="analytics-chart-box">

        {activeChart === 'dispensed' && (
          <>
            <p className="analytics-chart-caption">
              Doses dispensed each hour{selectedVax !== 'all' ? ` — ${selectedVax}` : ' — all vaccines combined'}
            </p>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  {keysToShow.map(name => (
                    <linearGradient key={name} id={`grad_${name.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS[name]} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={COLORS[name]} stopOpacity={0.02} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#888' }} />
                <YAxis tick={{ fontSize: 11, fill: '#888' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                {keysToShow.map(name => (
                  <Area key={name} type="monotone" dataKey={name}
                    stroke={COLORS[name]} strokeWidth={2}
                    fill={`url(#grad_${name.replace(/\s/g, '')})`}
                    dot={{ r: 3, fill: COLORS[name] }} activeDot={{ r: 5 }} />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </>
        )}

        {activeChart === 'stacked' && (
          <>
            <p className="analytics-chart-caption">Hourly breakdown of doses dispensed per vaccine type</p>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={hourlyData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#888' }} />
                <YAxis tick={{ fontSize: 11, fill: '#888' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                {vaccineNames.map((name, i) => (
                  <Bar key={name} dataKey={name} stackId="a"
                    fill={CHART_COLORS[i]}
                    radius={i === vaccineNames.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </>
        )}

        {activeChart === 'stock' && (
          <>
            <p className="analytics-chart-caption">Current stock levels per vaccine — based on available inventory</p>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={stockData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#888' }} />
                <YAxis tick={{ fontSize: 11, fill: '#888' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                {vaccineNames.map((name, i) => (
                  <Line key={name} type="monotone" dataKey={name}
                    stroke={CHART_COLORS[i]} strokeWidth={2}
                    dot={{ r: 3 }} activeDot={{ r: 5 }} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </>
        )}

        {activeChart === 'efficiency' && (
          <>
            <p className="analytics-chart-caption">Dispensing efficiency % per hour — administered vs. wasted doses</p>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={hourlyData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="effGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2e7d32" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2e7d32" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#888' }} />
                <YAxis domain={[85, 100]} tick={{ fontSize: 11, fill: '#888' }} unit="%" />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="efficiency" name="Efficiency"
                  stroke="#2e7d32" strokeWidth={2.5}
                  fill="url(#effGrad)"
                  dot={{ r: 4, fill: '#2e7d32' }} activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          </>
        )}
      </div>

      {/* Dispensed vs Wasted comparison */}
      <div className="analytics-comparison">
        <h4 className="analytics-comparison-label">Dispensed vs. Wasted per Vaccine — {periodLabel}</h4>
        <div className="analytics-comparison-bars">
          {vaccineNames.map((name, i) => {
            const disp = hourlyData.reduce((s, h) => s + (h[name] || 0), 0);
            const wasted = hourlyData.reduce((s, h) => s + (h[`${name}_w`] || 0), 0);
            const total = disp + wasted;
            const pct = total > 0 ? ((disp / total) * 100).toFixed(0) : 0;
            return (
              <div key={name} className="analytics-comparison-item">
                <div className="analytics-comparison-header">
                  <span className="analytics-comparison-name">{name}</span>
                  <span className="analytics-comparison-efficiency" style={{ color: CHART_COLORS[i] }}>
                    {pct}% efficient
                  </span>
                </div>
                <div className="analytics-track-bar">
                  <div className="analytics-track-fill" style={{ width: `${pct}%`, background: CHART_COLORS[i] }} />
                </div>
                <div className="analytics-comparison-footer">
                  <span style={{ color: CHART_COLORS[i] }}>💉 {disp.toLocaleString()} dispensed</span>
                  <span style={{ color: '#e53935' }}>🗑️ {wasted} wasted</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default DailyAnalytics;
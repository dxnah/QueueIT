// DailyAnalytics.jsx
// Drop this component anywhere inside Dashboard.jsx's main-content div
// Import: import DailyAnalytics from '../components/DailyAnalytics';

import { useState, useEffect, useCallback } from 'react';
import {
  AreaChart, Area,
  BarChart, Bar,
  LineChart, Line,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// ── Simulate realistic hourly vaccine dispensing data ──────────────
const generateHourlyData = () => {
  const hours = [];
  const vaccineNames = ['Anti-Rabies', 'Anti-Tetanus', 'Booster', 'Hepatitis B', 'Flu Shot'];
  const baseRates   = [18, 12, 6, 4, 9]; // avg dispensed per hour
  const now = new Date();

  for (let h = 7; h <= now.getHours(); h++) {
    const label = h < 12 ? `${h}:00 AM` : h === 12 ? `12:00 PM` : `${h - 12}:00 PM`;
    const isPeak = h >= 9 && h <= 11 || h >= 14 && h <= 16;
    const multiplier = isPeak ? 1.6 : h < 9 || h > 16 ? 0.5 : 1;

    const entry = { time: label };
    let totalDispensed = 0;
    let totalWasted = 0;

    vaccineNames.forEach((name, i) => {
      const dispensed = Math.round(baseRates[i] * multiplier * (0.8 + Math.random() * 0.4));
      const wasted    = Math.round(dispensed * (0.02 + Math.random() * 0.04));
      entry[name]          = dispensed;
      entry[`${name}_w`]   = wasted;
      totalDispensed += dispensed;
      totalWasted    += wasted;
    });

    entry.totalDispensed = totalDispensed;
    entry.totalWasted    = totalWasted;
    entry.efficiency     = parseFloat(((totalDispensed / (totalDispensed + totalWasted)) * 100).toFixed(1));
    hours.push(entry);
  }
  return hours;
};

// ── Stock level snapshots per hour ─────────────────────────────────
const generateStockSnapshots = () => {
  const initial = { 'Anti-Rabies': 320, 'Anti-Tetanus': 85, 'Booster': 0, 'Hepatitis B': 2, 'Flu Shot': 150 };
  const now = new Date();
  const snapshots = [];

  for (let h = 7; h <= now.getHours(); h++) {
    const label = h < 12 ? `${h}:00 AM` : h === 12 ? `12:00 PM` : `${h - 12}:00 PM`;
    const entry = { time: label };
    Object.keys(initial).forEach(name => {
      const deducted = Math.round((2 + Math.random() * 6));
      initial[name] = Math.max(0, initial[name] - deducted);
      entry[name]   = initial[name];
    });
    snapshots.push(entry);
  }
  return snapshots;
};

// ── Color palette matching dashboard ──────────────────────────────
const COLORS = {
  'Anti-Rabies':  '#26a69a',
  'Anti-Tetanus': '#f57f17',
  'Booster':      '#e53935',
  'Hepatitis B':  '#5c6bc0',
  'Flu Shot':     '#2e7d32',
};

const CHART_COLORS = ['#26a69a', '#f57f17', '#e53935', '#5c6bc0', '#2e7d32'];

// ── Custom tooltip style ───────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'white',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      padding: '12px 16px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
      fontSize: '13px',
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

// ── Main Component ─────────────────────────────────────────────────
const DailyAnalytics = () => {
  const [hourlyData,    setHourlyData]    = useState(generateHourlyData());
  const [stockData,     setStockData]     = useState(generateStockSnapshots());
  const [activeChart,   setActiveChart]   = useState('dispensed');
  const [lastUpdated,   setLastUpdated]   = useState(new Date());
  const [isLive,        setIsLive]        = useState(true);
  const [selectedVax,   setSelectedVax]   = useState('all');
  const [pulse,         setPulse]         = useState(false);

  const vaccineNames = ['Anti-Rabies', 'Anti-Tetanus', 'Booster', 'Hepatitis B', 'Flu Shot'];

  // ── Simulate live tick every 30 seconds ───────────────────────
  const tick = useCallback(() => {
    setHourlyData(generateHourlyData());
    setStockData(generateStockSnapshots());
    setLastUpdated(new Date());
    setPulse(true);
    setTimeout(() => setPulse(false), 800);
  }, []);

  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(tick, 30000);
    return () => clearInterval(interval);
  }, [isLive, tick]);

  // ── Derived summary stats from latest data ─────────────────────
  const latestHour    = hourlyData[hourlyData.length - 1] || {};
  const totalToday    = hourlyData.reduce((s, h) => s + (h.totalDispensed || 0), 0);
  const wastedToday   = hourlyData.reduce((s, h) => s + (h.totalWasted || 0), 0);
  const avgEfficiency = hourlyData.length
    ? (hourlyData.reduce((s, h) => s + (h.efficiency || 0), 0) / hourlyData.length).toFixed(1)
    : 0;
  const peakHour = hourlyData.reduce(
    (best, h) => h.totalDispensed > (best.totalDispensed || 0) ? h : best, {}
  );

  // ── Chart data filtered by selected vaccine ────────────────────
  const chartData = selectedVax === 'all' ? hourlyData : hourlyData.map(h => ({
    time: h.time,
    [selectedVax]: h[selectedVax],
    [`${selectedVax}_w`]: h[`${selectedVax}_w`],
    totalDispensed: h[selectedVax],
    totalWasted: h[`${selectedVax}_w`],
    efficiency: h.efficiency,
  }));

  const keysToShow = selectedVax === 'all' ? vaccineNames : [selectedVax];

  // ─────────────────────────────────────────────────────────────
  return (
    <div style={styles.wrapper}>

      {/* ── Header Row ─────────────────────────────────────────── */}
      <div style={styles.headerRow}>
        <div>
          <h3 style={styles.sectionTitle}>📊 Today's Vaccine Analytics</h3>
          <p style={styles.subtext}>
            Live dispensing data — {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div style={styles.headerRight}>
          {/* Live indicator */}
          <div style={styles.liveTag}>
            <span style={{ ...styles.dot, background: isLive ? '#26a69a' : '#ccc',
              boxShadow: isLive ? '0 0 0 3px rgba(38,166,154,0.25)' : 'none',
              animation: isLive ? 'livePulse 1.8s infinite' : 'none' }} />
            <span style={{ fontSize: '12px', fontWeight: '600', color: isLive ? '#26a69a' : '#aaa' }}>
              {isLive ? 'LIVE' : 'PAUSED'}
            </span>
          </div>
          <button
            onClick={() => setIsLive(p => !p)}
            style={{ ...styles.ctaBtn, background: isLive ? '#fff' : '#26a69a',
              color: isLive ? '#e53935' : 'white',
              border: isLive ? '2px solid #e53935' : 'none' }}>
            {isLive ? '⏸ Pause' : '▶ Resume'}
          </button>
          <button onClick={tick} style={{ ...styles.ctaBtn, background: '#f5f5f5', color: '#555', border: '2px solid #e0e0e0' }}>
            🔄 Refresh
          </button>
          <span style={{ fontSize: '11px', color: '#aaa', alignSelf: 'center' }}>
            Updated {lastUpdated.toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* ── Summary Stat Chips ──────────────────────────────────── */}
      <div style={styles.statChips}>
        {[
          { label: 'Total Dispensed Today', value: totalToday.toLocaleString(), unit: 'doses', color: '#26a69a', icon: '💉' },
          { label: 'Total Wasted Today',    value: wastedToday.toLocaleString(), unit: 'doses', color: '#e53935', icon: '🗑️' },
          { label: 'Avg. Efficiency',       value: `${avgEfficiency}%`,          unit: '',       color: '#2e7d32', icon: '📈' },
          { label: 'Peak Hour',             value: peakHour.time || '—',         unit: `${peakHour.totalDispensed || 0} doses`, color: '#f57f17', icon: '⏰' },
          { label: 'Hours Tracked',         value: hourlyData.length,            unit: 'hrs',    color: '#5c6bc0', icon: '🕐' },
        ].map((chip, i) => (
          <div key={i} style={{ ...styles.chip, borderTop: `3px solid ${chip.color}`,
            boxShadow: pulse ? `0 4px 16px ${chip.color}22` : '0 2px 8px rgba(0,0,0,0.08)',
            transition: 'box-shadow 0.4s ease' }}>
            <span style={styles.chipIcon}>{chip.icon}</span>
            <span style={{ ...styles.chipValue, color: chip.color }}>{chip.value}</span>
            <span style={styles.chipUnit}>{chip.unit}</span>
            <span style={styles.chipLabel}>{chip.label}</span>
          </div>
        ))}
      </div>

      {/* ── Chart Controls ──────────────────────────────────────── */}
      <div style={styles.controlsRow}>
        <div style={styles.tabGroup}>
          {[
            { key: 'dispensed', label: '💉 Dispensed by Hour' },
            { key: 'stacked',   label: '📊 Vaccine Breakdown' },
            { key: 'stock',     label: '📦 Stock Levels' },
            { key: 'efficiency',label: '📈 Efficiency Trend' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveChart(tab.key)}
              style={{ ...styles.tabBtn, ...(activeChart === tab.key ? styles.tabBtnActive : {}) }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Vaccine filter — only shown on relevant charts */}
        {activeChart !== 'stock' && (
          <select
            value={selectedVax}
            onChange={e => setSelectedVax(e.target.value)}
            style={styles.vaxSelect}>
            <option value="all">All Vaccines</option>
            {vaccineNames.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        )}
      </div>

      {/* ── Chart Area ──────────────────────────────────────────── */}
      <div style={styles.chartBox}>

        {/* 1. Dispensed per Hour — Area Chart */}
        {activeChart === 'dispensed' && (
          <>
            <p style={styles.chartCaption}>
              Doses dispensed each hour today{selectedVax !== 'all' ? ` — ${selectedVax}` : ' — all vaccines combined'}
            </p>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  {keysToShow.map(name => (
                    <linearGradient key={name} id={`grad_${name.replace(/\s/g,'')}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={COLORS[name]} stopOpacity={0.3} />
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
                    fill={`url(#grad_${name.replace(/\s/g,'')})`}
                    dot={{ r: 3, fill: COLORS[name] }} activeDot={{ r: 5 }} />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </>
        )}

        {/* 2. Stacked Bar — Vaccine Breakdown per Hour */}
        {activeChart === 'stacked' && (
          <>
            <p style={styles.chartCaption}>
              Hourly breakdown of doses dispensed per vaccine type
            </p>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={hourlyData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#888' }} />
                <YAxis tick={{ fontSize: 11, fill: '#888' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                {vaccineNames.map((name, i) => (
                  <Bar key={name} dataKey={name} stackId="a"
                    fill={CHART_COLORS[i]} radius={i === vaccineNames.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </>
        )}

        {/* 3. Stock Level Line Chart — all vaccines throughout day */}
        {activeChart === 'stock' && (
          <>
            <p style={styles.chartCaption}>
              Remaining stock levels per vaccine as the day progresses — declining lines show consumption
            </p>
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

        {/* 4. Efficiency Trend — Line Chart */}
        {activeChart === 'efficiency' && (
          <>
            <p style={styles.chartCaption}>
              Dispensing efficiency % per hour — how much was actually administered vs. wasted
            </p>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={hourlyData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="effGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#2e7d32" stopOpacity={0.25} />
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

      {/* ── Dispensed vs Wasted comparison bar at bottom ──────── */}
      <div style={styles.comparisonRow}>
        <h4 style={styles.compLabel}>Today's Dispensed vs. Wasted per Vaccine</h4>
        <div style={styles.compBars}>
          {vaccineNames.map((name, i) => {
            const disp   = hourlyData.reduce((s, h) => s + (h[name] || 0), 0);
            const wasted = hourlyData.reduce((s, h) => s + (h[`${name}_w`] || 0), 0);
            const total  = disp + wasted;
            const pct    = total > 0 ? ((disp / total) * 100).toFixed(0) : 0;
            return (
              <div key={name} style={styles.compItem}>
                <div style={styles.compHeader}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#333' }}>{name}</span>
                  <span style={{ fontSize: '12px', color: CHART_COLORS[i], fontWeight: '700' }}>{pct}% efficient</span>
                </div>
                <div style={styles.trackBar}>
                  <div style={{ ...styles.trackFill, width: `${pct}%`, background: CHART_COLORS[i] }} />
                </div>
                <div style={styles.compFooter}>
                  <span style={{ color: CHART_COLORS[i] }}>💉 {disp.toLocaleString()} dispensed</span>
                  <span style={{ color: '#e53935' }}>🗑️ {wasted} wasted</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── CSS keyframes injected inline ─────────────────────── */}
      <style>{`
        @keyframes livePulse {
          0%   { box-shadow: 0 0 0 0 rgba(38,166,154,0.5); }
          70%  { box-shadow: 0 0 0 6px rgba(38,166,154,0); }
          100% { box-shadow: 0 0 0 0 rgba(38,166,154,0); }
        }
      `}</style>

    </div>
  );
};

// ── Styles ─────────────────────────────────────────────────────────
const styles = {
  wrapper: {
    background: '#fff',
    borderRadius: '8px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    marginBottom: '30px',
    borderTop: '4px solid #26a69a',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '12px',
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#333',
    margin: '0 0 4px 0',
  },
  subtext: {
    fontSize: '13px',
    color: '#888',
    margin: 0,
    fontStyle: 'italic',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
  },
  liveTag: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: '#f0fffe',
    border: '1px solid #b2dfdb',
    borderRadius: '20px',
    padding: '5px 12px',
  },
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    display: 'inline-block',
  },
  ctaBtn: {
    padding: '7px 14px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  statChips: {
    display: 'flex',
    gap: '14px',
    flexWrap: 'wrap',
    marginBottom: '22px',
  },
  chip: {
    flex: '1 1 140px',
    background: '#fafafa',
    borderRadius: '8px',
    padding: '14px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  chipIcon:  { fontSize: '20px', marginBottom: '4px' },
  chipValue: { fontSize: '22px', fontWeight: '800', lineHeight: '1' },
  chipUnit:  { fontSize: '11px', color: '#aaa', fontWeight: '500' },
  chipLabel: { fontSize: '11px', color: '#666', fontWeight: '600', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.4px' },
  controlsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '10px',
    marginBottom: '16px',
  },
  tabGroup: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  tabBtn: {
    padding: '8px 14px',
    borderRadius: '20px',
    border: '2px solid #e0e0e0',
    background: 'white',
    color: '#555',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
  },
  tabBtnActive: {
    background: '#26a69a',
    color: 'white',
    border: '2px solid #26a69a',
  },
  vaxSelect: {
    padding: '8px 28px 8px 12px',
    border: '2px solid #e0e0e0',
    borderRadius: '6px',
    fontSize: '13px',
    background: 'white',
    cursor: 'pointer',
    color: '#333',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23555' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 10px center',
  },
  chartBox: {
    background: '#fafafa',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '20px',
    border: '1px solid #f0f0f0',
  },
  chartCaption: {
    fontSize: '12px',
    color: '#888',
    margin: '0 0 12px 0',
    fontStyle: 'italic',
  },
  comparisonRow: {
    borderTop: '1px solid #f0f0f0',
    paddingTop: '20px',
  },
  compLabel: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#333',
    margin: '0 0 14px 0',
  },
  compBars: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  compItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  compHeader: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  trackBar: {
    height: '10px',
    background: '#ffebee',
    borderRadius: '6px',
    overflow: 'hidden',
  },
  trackFill: {
    height: '100%',
    borderRadius: '6px',
    transition: 'width 0.5s ease',
  },
  compFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    fontWeight: '600',
    color: '#555',
  },
};

export default DailyAnalytics;
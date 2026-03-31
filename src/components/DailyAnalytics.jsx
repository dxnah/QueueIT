// DailyAnalytics.jsx
import { useState } from 'react';
import {
  AreaChart, Area,
  BarChart, Bar,
  LineChart, Line,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';

import { vaccineData } from '../data/dashboardData';
import '../styles/analytics.css';

// ─── Constants ───────────────────────────────────────────
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const PEAK_MONTHS = ['June', 'July', 'August'];

// ─── Seeded random ───────────────────────────────────────
const seededRand = (seed) => {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
};

const getMonthMultiplier = (month) => PEAK_MONTHS.includes(month) ? 1.55 : 1.0;

// ─── Generate hourly data (UNCHANGED LOGIC) ──────────────
const generateHourlyData = (month = 'January', weekIndex = null, day = null) => {
  const monthMult = getMonthMultiplier(month);
  const monthIdx = MONTHS.indexOf(month);
  const hours = [];

  for (let h = 7; h <= 17; h++) {
    const label = h < 12 ? `${h}:00 AM` : h === 12 ? `12:00 PM` : `${h - 12}:00 PM`;
    const isPeak = (h >= 9 && h <= 11) || (h >= 14 && h <= 16);
    const timeMultiplier = isPeak ? 1.4 : h < 9 || h > 16 ? 0.6 : 1;
    const dayMult = day !== null ? (0.85 + seededRand(day * 7 + monthIdx) * 0.3) : 1;

    const entry = { time: label };
    let totalDispensed = 0;
    let totalWasted = 0;

    vaccineData.forEach((vaccine, vi) => {
      const seed = h * 10 + vi + monthIdx * 100 + (day || 0) * 10000;
      const rand = seededRand(seed);

      const baseRate = Math.max(1, Math.round(
        (vaccine.mlRecommended / 30) * timeMultiplier * monthMult * dayMult * (0.85 + rand * 0.3)
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

// ─── Generate stock snapshots (UNCHANGED) ───────────────
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

// ─── Colors (UNCHANGED) ─────────────────────────────────
const COLORS = {
  'Anti-Rabies': '#26a69a',
  'Anti-Tetanus': '#f57f17',
  'Booster': '#e53935',
  'Hepatitis B': '#5c6bc0',
  'Flu Shot': '#2e7d32',
};
const CHART_COLORS = ['#26a69a', '#f57f17', '#e53935', '#5c6bc0', '#2e7d32'];

// ─── Tooltip (UNCHANGED) ────────────────────────────────
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

// ─── MAIN COMPONENT ─────────────────────────────────────
const DailyAnalytics = () => {
  const [activeChart, setActiveChart]   = useState('dispensed');
  const [selectedVax, setSelectedVax]   = useState('all');

  const vaccineNames = vaccineData.map(v => v.vaccine);

  // ✅ LAST 2 DAYS DATA ONLY
  const latestMonth = 'January';
  const day1 = generateHourlyData(latestMonth, null, 1);
  const day2 = generateHourlyData(latestMonth, null, 2);
  const hourlyData = [...day1, ...day2];

  const stockData = generateStockSnapshots();

  // ─── Summary (UNCHANGED) ─────────────────────────────
  const totalToday     = hourlyData.reduce((s, h) => s + (h.totalDispensed || 0), 0);
  const wastedToday    = hourlyData.reduce((s, h) => s + (h.totalWasted || 0), 0);
  const avgEfficiency  = hourlyData.length
    ? (hourlyData.reduce((s, h) => s + (h.efficiency || 0), 0) / hourlyData.length).toFixed(1)
    : 0;

  const peakHour = hourlyData.reduce(
    (best, h) => h.totalDispensed > (best.totalDispensed || 0) ? h : best, {}
  );

  const chartData = selectedVax === 'all'
    ? hourlyData
    : hourlyData.map(h => ({
      time: h.time,
      [selectedVax]: h[selectedVax],
      [`${selectedVax}_w`]: h[`${selectedVax}_w`],
      totalDispensed: h[selectedVax],
      totalWasted: h[`${selectedVax}_w`],
      efficiency: h.efficiency,
    }));

  const keysToShow = selectedVax === 'all' ? vaccineNames : [selectedVax];

  const periodLabel = "Last 2 Days";

  return (
    <section className="analytics-wrapper">

      {/* HEADER */}
      <section className="analytics-header">
        <section>
          <h3 className="analytics-title">📊 Vaccine Analytics — {periodLabel}</h3>
          <p className="analytics-subtext">
            Latest dispensing data for the past 2 days
          </p>
        </section>
      </section>

      {/* SUMMARY CHIPS (UNCHANGED STYLE) */}
      <section className="analytics-stat-chips">
        {[
          { label: 'Total Dispensed', value: totalToday.toLocaleString(), unit: 'doses', color: '#26a69a', icon: '💉' },
          { label: 'Total Wasted', value: wastedToday.toLocaleString(), unit: 'doses', color: '#e53935', icon: '🗑️' },
          { label: 'Avg. Efficiency', value: `${avgEfficiency}%`, unit: '', color: '#2e7d32', icon: '📈' },
          { label: 'Peak Hour', value: peakHour.time || '—', unit: `${peakHour.totalDispensed || 0} doses`, color: '#f57f17', icon: '⏰' },
          { label: 'Hours Tracked', value: hourlyData.length, unit: 'hrs', color: '#5c6bc0', icon: '🕐' },
        ].map((chip, i) => (
          <section key={i} className="analytics-chip" style={{ borderTop: `3px solid ${chip.color}` }}>
            <span className="analytics-chip-icon">{chip.icon}</span>
            <span className="analytics-chip-value" style={{ color: chip.color }}>{chip.value}</span>
            <span className="analytics-chip-unit">{chip.unit}</span>
            <span className="analytics-chip-label">{chip.label}</span>
          </section>
        ))}
      </section>

      {/* CONTROLS (UNCHANGED STYLE) */}
      <section className="analytics-controls">
        <section className="analytics-tab-group">
          {[
            { key: 'dispensed', label: '💉 Dispensed by Hour' },
            { key: 'stacked',   label: '📊 Vaccine Breakdown' },
            { key: 'stock',     label: '📦 Stock Levels'      },
            { key: 'efficiency',label: '📈 Efficiency Trend'  },
          ].map(tab => (
            <button key={tab.key}
              onClick={() => setActiveChart(tab.key)}
              className={`analytics-tab-btn ${activeChart === tab.key ? 'active' : ''}`}>
              {tab.label}
            </button>
          ))}
        </section>

        {activeChart !== 'stock' && (
          <select value={selectedVax} onChange={e => setSelectedVax(e.target.value)} className="analytics-vaccine-select">
            <option value="all">All Vaccines</option>
            {vaccineNames.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        )}
      </section>

      {/* CHART AREA (UNCHANGED) */}
      <section className="analytics-chart-box">
        {activeChart === 'dispensed' && (
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {keysToShow.map(name => (
                <Area key={name} type="monotone" dataKey={name}
                  stroke={COLORS[name]} fillOpacity={0.2} fill={COLORS[name]} />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        )}

        {activeChart === 'stacked' && (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {vaccineNames.map((name, i) => (
                <Bar key={name} dataKey={name} stackId="a" fill={CHART_COLORS[i]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}

        {activeChart === 'stock' && (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={stockData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {vaccineNames.map((name, i) => (
                <Line key={name} type="monotone" dataKey={name}
                  stroke={CHART_COLORS[i]} strokeWidth={2} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </section>

    </section>
  );
};

export default DailyAnalytics;
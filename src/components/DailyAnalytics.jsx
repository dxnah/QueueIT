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

// ── Seeded random ──────────────────────────────────────────────────
const seededRand = (seed) => {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
};

// ── Generate hourly data ───────────────────────────────────────────
const generateHourlyData = () => {
  const hours = [];
  for (let h = 7; h <= 17; h++) {
    const label = h < 12 ? `${h}:00 AM` : h === 12 ? `12:00 PM` : `${h - 12}:00 PM`;
    const isPeak = (h >= 9 && h <= 11) || (h >= 14 && h <= 16);
    const multiplier = isPeak ? 1.4 : h < 9 || h > 16 ? 0.6 : 1;

    const entry = { time: label };
    let totalDispensed = 0;
    let totalWasted = 0;

    vaccineData.forEach((vaccine, vi) => {
      const seed = h * 10 + vi;
      const rand = seededRand(seed);
      const baseRate = Math.max(1, Math.round((vaccine.mlRecommended / 30) * multiplier * (0.85 + rand * 0.3)));
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

// ── Generate stock snapshots ───────────────────────────────────────
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

// ── Colors ─────────────────────────────────────────────────────────
const COLORS = {
  'Anti-Rabies': '#26a69a',
  'Anti-Tetanus': '#f57f17',
  'Booster': '#e53935',
  'Hepatitis B': '#5c6bc0',
  'Flu Shot': '#2e7d32',
};
const CHART_COLORS = ['#26a69a', '#f57f17', '#e53935', '#5c6bc0', '#2e7d32'];

// ── Custom Tooltip ─────────────────────────────────────────────────
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

// ── Main Component ─────────────────────────────────────────────────
const DailyAnalytics = () => {
  const [hourlyData] = useState(generateHourlyData);
  const [stockData] = useState(generateStockSnapshots);
  const [activeChart, setActiveChart] = useState('dispensed');
  const [selectedVax, setSelectedVax] = useState('all');

  const vaccineNames = vaccineData.map(v => v.vaccine);

  // ── Summary stats ────────────────────────────────────────────────
  const totalToday = hourlyData.reduce((s, h) => s + (h.totalDispensed || 0), 0);
  const wastedToday = hourlyData.reduce((s, h) => s + (h.totalWasted || 0), 0);
  const avgEfficiency = hourlyData.length
    ? (hourlyData.reduce((s, h) => s + (h.efficiency || 0), 0) / hourlyData.length).toFixed(1)
    : 0;
  const peakHour = hourlyData.reduce(
    (best, h) => h.totalDispensed > (best.totalDispensed || 0) ? h : best, {}
  );

  // ── Filter by vaccine ────────────────────────────────────────────
  const chartData = selectedVax === 'all' ? hourlyData : hourlyData.map(h => ({
    time: h.time,
    [selectedVax]: h[selectedVax],
    [`${selectedVax}_w`]: h[`${selectedVax}_w`],
    totalDispensed: h[selectedVax],
    totalWasted: h[`${selectedVax}_w`],
    efficiency: h.efficiency,
  }));
  const keysToShow = selectedVax === 'all' ? vaccineNames : [selectedVax];

  return (
    <div className="analytics-wrapper">

      {/* Header */}
      <div className="analytics-header">
        <div>
          <h3 className="analytics-title">📊 Today's Vaccine Analytics</h3>
          <p className="analytics-subtext">
            Daily dispensing data — {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
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
            { key: 'dispensed', label: '💉 Dispensed by Hour' },
            { key: 'stacked', label: '📊 Vaccine Breakdown' },
            { key: 'stock', label: '📦 Stock Levels' },
            { key: 'efficiency', label: '📈 Efficiency Trend' },
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
              Doses dispensed each hour today{selectedVax !== 'all' ? ` — ${selectedVax}` : ' — all vaccines combined'}
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
        <h4 className="analytics-comparison-label">Today's Dispensed vs. Wasted per Vaccine</h4>
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
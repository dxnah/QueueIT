import { useMemo, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

import { vaccineData } from '../data/dashboardData';
import '../styles/analytics.css';


// ─── Seeded Random Generator ─────────────────────────
const seededRand = (seed) => {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
};


// ─── Generate Hourly Data ────────────────────────────
const generateHourlyData = (dayOffset = 0) => {
  const hours = [];

  for (let h = 7; h <= 17; h++) {
    const label =
      h < 12 ? `${h}:00 AM`
      : h === 12 ? '12:00 PM'
      : `${h - 12}:00 PM`;

    const isPeak = (h >= 9 && h <= 11) || (h >= 14 && h <= 16);
    const timeMultiplier = isPeak ? 1.4 : h < 9 || h > 16 ? 0.6 : 1;

    const entry = { time: label };

    let totalDispensed = 0;
    let totalWasted = 0;

    vaccineData.forEach((vaccine, vi) => {
      const seed = h * 10 + vi + dayOffset * 999;
      const rand = seededRand(seed);

      const baseRate = Math.max(
        1,
        Math.round(
          (vaccine.mlRecommended / 30) *
          timeMultiplier *
          (0.85 + rand * 0.3)
        )
      );

      const wasted = Math.max(
        0,
        Math.round(baseRate * (0.02 + seededRand(seed + 50) * 0.03))
      );

      totalDispensed += baseRate;
      totalWasted += wasted;
    });

    entry.totalDispensed = totalDispensed;
    entry.totalWasted = totalWasted;
    entry.efficiency = parseFloat(
      ((totalDispensed / (totalDispensed + totalWasted)) * 100).toFixed(1)
    );

    hours.push(entry);
  }

  return hours;
};


// ─── Tooltip ─────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div
      style={{
        background: 'white',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '12px 16px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
        fontSize: '13px',
      }}
    >
      <p style={{ margin: 0, fontWeight: 700 }}>{label}</p>

      {payload.map((p, i) => (
        <p key={i} style={{ margin: '4px 0', color: p.color }}>
          {p.name}: <strong>{p.value}</strong>
          {p.name === 'Efficiency' ? '%' : ' doses'}
        </p>
      ))}
    </div>
  );
};


// ─── MAIN COMPONENT ─────────────────────────────────
const DailyAnalytics = () => {

  const [activeChart, setActiveChart] = useState('dispensed');

  const lastTwoDays = useMemo(() => {
    const today = generateHourlyData(0);
    const yesterday = generateHourlyData(1);

    return today.map((hour, i) => ({
      time: hour.time,
      today: hour.totalDispensed,
      yesterday: yesterday[i].totalDispensed,
      efficiency: hour.efficiency,
    }));
  }, []);

  const hourlyData = generateHourlyData(0);

  const totalToday = hourlyData.reduce((s, h) => s + h.totalDispensed, 0);
  const wastedToday = hourlyData.reduce((s, h) => s + h.totalWasted, 0);

  const avgEfficiency = (
    hourlyData.reduce((s, h) => s + h.efficiency, 0) /
    hourlyData.length
  ).toFixed(1);

  const peakHour = hourlyData.reduce(
    (best, h) =>
      h.totalDispensed > (best.totalDispensed || 0)
        ? h
        : best,
    {}
  );

  return (
    <section className="analytics-wrapper">

      {/* HEADER */}
      <section className="analytics-header">
        <div>
          <h3 className="analytics-title">
            📊 Vaccine Analytics — Last 2 Days
          </h3>
          <p className="analytics-subtext">
            Hourly dispensing overview for today vs yesterday
          </p>
        </div>
      </section>


      {/* SUMMARY CHIPS */}
      <section className="analytics-stat-chips">
        {[
          {
            label: 'Total Dispensed Today',
            value: totalToday.toLocaleString(),
            unit: 'doses',
            color: '#26a69a',
            icon: '💉',
          },
          {
            label: 'Total Wasted Today',
            value: wastedToday.toLocaleString(),
            unit: 'doses',
            color: '#e53935',
            icon: '🗑️',
          },
          {
            label: 'Avg. Efficiency',
            value: `${avgEfficiency}%`,
            unit: '',
            color: '#2e7d32',
            icon: '📈',
          },
          {
            label: 'Peak Hour',
            value: peakHour.time || '—',
            unit: `${peakHour.totalDispensed || 0} doses`,
            color: '#f57f17',
            icon: '⏰',
          },
        ].map((chip, i) => (
          <section
            key={i}
            className="analytics-chip"
            style={{ borderTop: `3px solid ${chip.color}` }}
          >
            <span className="analytics-chip-icon">{chip.icon}</span>
            <span
              className="analytics-chip-value"
              style={{ color: chip.color }}
            >
              {chip.value}
            </span>
            <span className="analytics-chip-unit">{chip.unit}</span>
            <span className="analytics-chip-label">{chip.label}</span>
          </section>
        ))}
      </section>


      {/* TABS */}
      <section className="analytics-controls">
        <div className="analytics-tab-group">
          <button
            onClick={() => setActiveChart('dispensed')}
            className={`analytics-tab-btn ${
              activeChart === 'dispensed' ? 'active' : ''
            }`}
          >
            💉 Today vs Yesterday
          </button>

          <button
            onClick={() => setActiveChart('efficiency')}
            className={`analytics-tab-btn ${
              activeChart === 'efficiency' ? 'active' : ''
            }`}
          >
            📈 Efficiency Trend
          </button>
        </div>
      </section>


      {/* CHART */}
      <section className="analytics-chart-box">

        {activeChart === 'dispensed' && (
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={lastTwoDays}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />

              <XAxis dataKey="time" stroke="#9aa0a6" />
              <YAxis stroke="#9aa0a6" />

              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="bottom" iconType="circle" />

              <Area
                type="monotone"
                dataKey="today"
                name="today"
                stroke="#26a69a"
                fill="#26a69a33"
                strokeWidth={2.5}
                dot={false}
              />

              <Area
                type="monotone"
                dataKey="yesterday"
                name="yesterday"
                stroke="#e53935"
                fill="#e5393533"
                strokeWidth={2.5}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {activeChart === 'efficiency' && (
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis domain={[85, 100]} unit="%" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="efficiency"
                name="Efficiency"
                stroke="#2e7d32"
                fill="#2e7d3222"
                strokeWidth={2.5}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}

      </section>

    </section>
  );
};

export default DailyAnalytics;
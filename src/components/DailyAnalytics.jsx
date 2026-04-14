// src/components/DailyAnalytics.jsx

import { useMemo, useState, useEffect } from 'react';
import {
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { usageReportAPI, stockReportAPI } from '../services/api';
import '../styles/analytics.css';

// ─── Seeded Random (used only for hourly simulation) ─────────────────────────
const seededRand = (seed) => {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
};

// ─── Generate Hourly Simulation ───────────────────────────────────────────────
// Used when real usage-report data is sparse (no hourly breakdown in DB).
// dayOffset=0 → today, dayOffset=1 → yesterday
const generateHourlyFromTotals = (totalDispensed, totalWasted, dayOffset = 0) => {
  const hours = [];
  for (let h = 7; h <= 17; h++) {
    const label = h < 12 ? `${h}:00 AM` : h === 12 ? '12:00 PM' : `${h - 12}:00 PM`;
    const isPeak = (h >= 9 && h <= 11) || (h >= 14 && h <= 16);
    const weight = isPeak ? 1.4 : h < 9 || h > 16 ? 0.6 : 1.0;
    const seed   = h * 10 + dayOffset * 999;
    const rand   = seededRand(seed);

    const hoursCount    = 11; // 7 AM – 5 PM
    const dispensed     = Math.round((totalDispensed / hoursCount) * weight * (0.85 + rand * 0.3));
    const wasted        = Math.round((totalWasted    / hoursCount) * weight * (0.85 + rand * 0.3));
    const efficiency    = parseFloat(((dispensed / Math.max(dispensed + wasted, 1)) * 100).toFixed(1));

    hours.push({ time: label, totalDispensed: dispensed, totalWasted: wasted, efficiency });
  }
  return hours;
};

// ─── Tooltip ─────────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'white', border:'1px solid #e0e0e0', borderRadius:'8px', padding:'12px 16px', boxShadow:'0 4px 12px rgba(0,0,0,0.12)', fontSize:'13px' }}>
      <p style={{ margin:0, fontWeight:700 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ margin:'4px 0', color:p.color }}>
          {p.name}: <strong>{p.value}</strong>{p.name === 'Efficiency' ? '%' : ' doses'}
        </p>
      ))}
    </div>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const DailyAnalytics = () => {
  const [activeChart,   setActiveChart]   = useState('dispensed');
  const [usageReports,  setUsageReports]  = useState([]);
  const [stockReports,  setStockReports]  = useState([]);
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const [usage, stock] = await Promise.all([
          usageReportAPI.getAll(),
          stockReportAPI.getAll(),
        ]);
        setUsageReports(usage  || []);
        setStockReports(stock  || []);
      } catch (err) {
        console.error('Analytics fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  // ── Derive today/yesterday totals from usage reports ─────────────────────
  // Usage reports have period: 'daily' | 'weekly' | 'monthly'
  // We take the two most recent daily reports as today + yesterday.
  const { todayTotals, yesterdayTotals } = useMemo(() => {
    const dailyReports = usageReports
      .filter(r => r.period === 'daily')
      .sort((a, b) => new Date(b.report_date) - new Date(a.report_date));

    const today     = dailyReports[0] || null;
    const yesterday = dailyReports[1] || null;

    return {
      todayTotals:     { dispensed: today?.administered     ?? 0, wasted: today?.wasted     ?? 0 },
      yesterdayTotals: { dispensed: yesterday?.administered ?? 0, wasted: yesterday?.wasted ?? 0 },
    };
  }, [usageReports]);

  // ── Build hourly simulation from DB totals ────────────────────────────────
  const { lastTwoDays, hourlyData } = useMemo(() => {
    // If no real data yet, fall back to a safe non-zero baseline so charts render
    const todayD     = todayTotals.dispensed     || 120;
    const todayW     = todayTotals.wasted        || 4;
    const yesterdayD = yesterdayTotals.dispensed || 110;
    const yesterdayW = yesterdayTotals.wasted    || 5;

    const todayHours     = generateHourlyFromTotals(todayD,     todayW,     0);
    const yesterdayHours = generateHourlyFromTotals(yesterdayD, yesterdayW, 1);

    const combined = todayHours.map((h, i) => ({
      time:      h.time,
      today:     h.totalDispensed,
      yesterday: yesterdayHours[i].totalDispensed,
      efficiency: h.efficiency,
    }));

    return { lastTwoDays: combined, hourlyData: todayHours };
  }, [todayTotals, yesterdayTotals]);

  // ── Summary stats ─────────────────────────────────────────────────────────
  const totalToday   = hourlyData.reduce((s, h) => s + h.totalDispensed, 0);
  const wastedToday  = hourlyData.reduce((s, h) => s + h.totalWasted,    0);
  const avgEfficiency = (
    hourlyData.reduce((s, h) => s + h.efficiency, 0) / hourlyData.length
  ).toFixed(1);
  const peakHour = hourlyData.reduce(
    (best, h) => h.totalDispensed > (best.totalDispensed || 0) ? h : best, {}
  );

  // ── Stock level summary from stock reports ────────────────────────────────
  const latestStock = useMemo(() => {
    const sorted = [...stockReports].sort((a, b) => new Date(b.date) - new Date(a.date));
    return sorted[0] || null;
  }, [stockReports]);

  if (loading) {
    return (
      <section className="analytics-wrapper">
        <div style={{ padding:'40px', textAlign:'center', color:'#999', fontSize:'14px' }}>
          Loading analytics...
        </div>
      </section>
    );
  }

  return (
    <section className="analytics-wrapper">

      {/* HEADER */}
      <section className="analytics-header">
        <div>
          <h3 className="analytics-title">📊 Vaccine Analytics — Last 2 Days</h3>
          <p className="analytics-subtext">
            Hourly dispensing overview for today vs yesterday
            {usageReports.length === 0 && (
              <span style={{ color:'#f57f17', fontWeight:'600', marginLeft:'8px' }}>
                · Using simulated data — add daily reports in the backend to see real data
              </span>
            )}
          </p>
        </div>
      </section>

      {/* SUMMARY CHIPS */}
      <section className="analytics-stat-chips">
        {[
          { label:'Total Dispensed Today', value: totalToday.toLocaleString(),   unit:'doses',   color:'#26a69a', icon:'💉' },
          { label:'Total Wasted Today',    value: wastedToday.toLocaleString(),  unit:'doses',   color:'#e53935', icon:'🗑️' },
          { label:'Avg. Efficiency',       value: `${avgEfficiency}%`,           unit:'',        color:'#2e7d32', icon:'📈' },
          { label:'Peak Hour',             value: peakHour.time || '—',          unit:`${peakHour.totalDispensed || 0} doses`, color:'#f57f17', icon:'⏰' },
          ...(latestStock ? [
            { label:'In Stock',  value: latestStock.in_stock,  unit:'vaccines', color:'#26a69a', icon:'✅' },
            { label:'Low Stock', value: latestStock.low_stock, unit:'vaccines', color:'#f57f17', icon:'⚠️' },
            { label:'Out Stock', value: latestStock.out_stock, unit:'vaccines', color:'#e53935', icon:'🚨' },
          ] : []),
        ].map((chip, i) => (
          <section key={i} className="analytics-chip" style={{ borderTop:`3px solid ${chip.color}` }}>
            <span className="analytics-chip-icon">{chip.icon}</span>
            <span className="analytics-chip-value" style={{ color:chip.color }}>{chip.value}</span>
            <span className="analytics-chip-unit">{chip.unit}</span>
            <span className="analytics-chip-label">{chip.label}</span>
          </section>
        ))}
      </section>

      {/* TABS */}
      <section className="analytics-controls">
        <div className="analytics-tab-group">
          <button onClick={() => setActiveChart('dispensed')}
            className={`analytics-tab-btn ${activeChart === 'dispensed' ? 'active' : ''}`}>
            💉 Today vs Yesterday
          </button>
          <button onClick={() => setActiveChart('efficiency')}
            className={`analytics-tab-btn ${activeChart === 'efficiency' ? 'active' : ''}`}>
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
              <Area type="monotone" dataKey="today"     name="today"     stroke="#26a69a" fill="#26a69a33" strokeWidth={2.5} dot={false} />
              <Area type="monotone" dataKey="yesterday" name="yesterday" stroke="#e53935" fill="#e5393533" strokeWidth={2.5} dot={false} />
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
              <Area type="monotone" dataKey="efficiency" name="Efficiency" stroke="#2e7d32" fill="#2e7d3222" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </section>

    </section>
  );
};

export default DailyAnalytics;
// reports.jsx

import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import { reportsData } from '../data/dashboardData';
import '../styles/dashboard.css';
import '../styles/reports.css';

/* ─── tiny helpers ─── */
const calcEff = (adm, wst) => ((adm / (adm + wst)) * 100).toFixed(1);

const Reports = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod]     = useState('monthly');
  const [selectedReport, setSelectedReport]     = useState('vaccine-usage');
  const [dateRange, setDateRange]               = useState({
    startDate: '2025-01-01',
    endDate:   '2025-02-19',
  });
  const [sortConfig, setSortConfig] = useState({ key: null, dir: 'asc' });
  const [reportData]                = useState(reportsData);

  const vaccineRows = reportData['vaccine-usage'];

  const totals = useMemo(() => {
    const adm = vaccineRows.reduce((s, r) => s + r.administered, 0);
    const wst = vaccineRows.reduce((s, r) => s + r.wasted,       0);
    const rem = vaccineRows.reduce((s, r) => s + r.remaining,    0);
    return { adm, wst, rem, eff: calcEff(adm, wst) };
  }, [vaccineRows]);

  const mostUsed = useMemo(() =>
    [...vaccineRows].sort((a, b) => b.administered - a.administered)[0]?.vaccine ?? '—',
  [vaccineRows]);

  const handleSort = (key) => {
    setSortConfig(prev =>
      prev.key === key
        ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'asc' }
    );
  };

  const sortedRows = useMemo(() => {
    if (!sortConfig.key) return vaccineRows;
    return [...vaccineRows].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      if (sortConfig.key === 'efficiency') {
        aVal = parseFloat(calcEff(a.administered, a.wasted));
        bVal = parseFloat(calcEff(b.administered, b.wasted));
      }
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      if (aVal < bVal) return sortConfig.dir === 'asc' ? -1 :  1;
      if (aVal > bVal) return sortConfig.dir === 'asc' ?  1 : -1;
      return 0;
    });
  }, [vaccineRows, sortConfig]);

  const SortIcon = ({ col }) => {
    if (sortConfig.key !== col) return <span className="sort-icon">↕</span>;
    return <span className="sort-icon active">{sortConfig.dir === 'asc' ? '↑' : '↓'}</span>;
  };

  const chartData = vaccineRows.map(r => ({
    name:         r.vaccine,
    Administered: r.administered,
    Wasted:       r.wasted,
    Remaining:    r.remaining,
  }));

  const handleDateChange     = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };
  const handleGenerateReport = () => alert(`Generating ${selectedReport} report for ${selectedPeriod} period`);
  const handleExportReport   = (fmt) => alert(`Exporting report as ${fmt.toUpperCase()}`);

  return (
    <section className="dashboard-container">

      <button
        type="button"
        className="mobile-menu-toggle"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle navigation menu"
        aria-expanded={isMobileMenuOpen}>
        ☰
      </button>

      <Sidebar
        isMobileMenuOpen={isMobileMenuOpen}
        onMenuClose={() => setIsMobileMenuOpen(false)} />

      {isMobileMenuOpen && (
        <div
          className="overlay"
          onClick={() => setIsMobileMenuOpen(false)}
          role="presentation" />
      )}

      {/* ── main-wrapper: holds TopBar + scrollable content ── */}
      <section className="main-wrapper">
        <TopBar />

        <main className="main-content">

          <header>
            <h1 className="dashboard-heading">📈 Reports & Analytics</h1>
            <p className="dashboard-subheading">Generate and view system performance reports</p>
          </header>

          {/* ── REPORT CONFIGURATION ── */}
          <section className="settings-card" aria-label="Report configuration">
            <h2 className="section-title">📋 Report Configuration</h2>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="report-type">Report Type</label>
                <select
                  id="report-type"
                  value={selectedReport}
                  onChange={(e) => setSelectedReport(e.target.value)}
                  className="form-control">
                  <option value="vaccine-usage">💉 Vaccine Usage Report</option>
                  <option value="stock-levels">📦 Stock Levels Report</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="report-period">Time Period</label>
                <select
                  id="report-period"
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="form-control">
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>
            </div>

            {selectedPeriod === 'custom' && (
              <div className="form-row date-range-row">
                <div className="form-group">
                  <label htmlFor="report-start">Start Date</label>
                  <input
                    type="date"
                    id="report-start"
                    name="startDate"
                    value={dateRange.startDate}
                    onChange={handleDateChange}
                    className="form-control" />
                </div>
                <div className="form-group">
                  <label htmlFor="report-end">End Date</label>
                  <input
                    type="date"
                    id="report-end"
                    name="endDate"
                    value={dateRange.endDate}
                    onChange={handleDateChange}
                    className="form-control" />
                </div>
              </div>
            )}

            <div className="form-actions">
              <button type="button" onClick={handleGenerateReport} className="btn btn-primary">
                🔍 Generate Report
              </button>
              <button type="button" onClick={() => handleExportReport('pdf')} className="btn btn-secondary">
                📄 Export PDF
              </button>
              <button type="button" onClick={() => handleExportReport('excel')} className="btn btn-secondary">
                📊 Export Excel
              </button>
            </div>
          </section>

          {/* ── BAR CHART ── */}
          {selectedReport === 'vaccine-usage' && (
            <section className="settings-card" aria-label="Vaccine usage chart">
              <h2 className="section-title">📊 Vaccine Usage Overview</h2>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12, fill: '#666' }}
                      axisLine={{ stroke: '#e0e0e0' }}
                      tickLine={false} />
                    <YAxis
                      tick={{ fontSize: 12, fill: '#666' }}
                      axisLine={false}
                      tickLine={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e0e0e0', fontSize: '13px' }}
                      formatter={(value, name) => [`${value} doses`, name]} />
                    <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }} />
                    <Bar dataKey="Administered" fill="#26a69a" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Wasted"       fill="#ef5350" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Remaining"    fill="#5c6bc0" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          )}

          {/* ── REPORT PREVIEW TABLE ── */}
          <section className="settings-card" aria-label="Report preview">
            <h2 className="section-title">📋 Report Preview</h2>

            {selectedReport === 'vaccine-usage' && (
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th scope="col" onClick={() => handleSort('vaccine')} className="sortable">
                        Vaccine <SortIcon col="vaccine" />
                      </th>
                      <th scope="col" onClick={() => handleSort('administered')} className="sortable">
                        Administered <SortIcon col="administered" />
                      </th>
                      <th scope="col" onClick={() => handleSort('wasted')} className="sortable">
                        Wasted <SortIcon col="wasted" />
                      </th>
                      <th scope="col" onClick={() => handleSort('remaining')} className="sortable">
                        Remaining <SortIcon col="remaining" />
                      </th>
                      <th scope="col" onClick={() => handleSort('efficiency')} className="sortable">
                        Efficiency <SortIcon col="efficiency" />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedRows.map((row, idx) => {
                      const eff = parseFloat(calcEff(row.administered, row.wasted));
                      const rowClass =
                        row.wasted > 10 ? 'row-critical' :
                        row.wasted > 5  ? 'row-warning'  : '';
                      return (
                        <tr key={idx} className={rowClass}>
                          <td><strong>{row.vaccine}</strong></td>
                          <td>{row.administered} doses</td>
                          <td>
                            <span className={row.wasted > 5 ? 'waste-badge waste-high' : 'waste-badge waste-low'}>
                              {row.wasted} doses
                            </span>
                          </td>
                          <td>{row.remaining} doses</td>
                          <td>
                            <div className="eff-cell">
                              <span style={{
                                color:      eff >= 98 ? '#2e7d32' : eff >= 95 ? '#f57f17' : '#e53935',
                                fontWeight: 'bold',
                              }}>
                                {eff}%
                              </span>
                              <div className="eff-bar-track">
                                <div
                                  className="eff-bar-fill"
                                  style={{
                                    width:      `${eff}%`,
                                    background: eff >= 98 ? '#26a69a' : eff >= 95 ? '#f57f17' : '#e53935',
                                  }}
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {selectedReport === 'stock-levels' && (
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th scope="col">Period</th>
                      <th scope="col">In Stock</th>
                      <th scope="col">Low Stock</th>
                      <th scope="col">Out of Stock</th>
                      <th scope="col">Stock Health</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData['stock-levels'].map((row, idx) => (
                      <tr key={idx}>
                        <td><strong>{row.date}</strong></td>
                        <td style={{ color: '#2e7d32' }}>{row.inStock} doses</td>
                        <td style={{ color: '#f57f17' }}>{row.lowStock} types</td>
                        <td style={{ color: '#e53935' }}>{row.outStock} types</td>
                        <td>
                          <span className={
                            row.outStock === 0 && row.lowStock < 2 ? 'status-in-stock' :
                            row.outStock > 0 ? 'status-out-stock' : 'status-low-stock'
                          }>
                            {row.outStock === 0 && row.lowStock < 2 ? '✅ Healthy' :
                             row.outStock > 0 ? '🚨 Critical' : '⚠️ Needs Attention'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </section>

        </main>
      </section>
    </section>
  );
};

export default Reports;
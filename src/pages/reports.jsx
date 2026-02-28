// Reports.jsx

import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { reportsData } from '../data/dashboardData';
import '../styles/dashboard.css';
import '../styles/reports.css';

const Reports = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod]     = useState('monthly');
  const [selectedReport, setSelectedReport]     = useState('vaccine-usage');
  const [dateRange, setDateRange]               = useState({
    startDate: '2025-01-01',
    endDate:   '2025-02-19',
  });

  const [reportData] = useState(reportsData);

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerateReport = () => {
    alert(`Generating ${selectedReport} report for ${selectedPeriod} period`);
  };

  const handleExportReport = (format) => {
    alert(`Exporting report as ${format.toUpperCase()}`);
  };

  return (
    <div className="dashboard-container">

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
        onMenuClose={() => setIsMobileMenuOpen(false)}
      />

      {isMobileMenuOpen && (
        <div
          className="overlay"
          onClick={() => setIsMobileMenuOpen(false)}
          role="presentation"
        />
      )}

      <main className="main-content">

        <header>
          <h1 className="dashboard-heading">📈 Reports & Analytics</h1>
          <p className="dashboard-subheading">Generate and view system performance reports</p>
        </header>

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
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="report-start">Start Date</label>
                <input
                  type="date"
                  id="report-start"
                  name="startDate"
                  value={dateRange.startDate}
                  onChange={handleDateChange}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label htmlFor="report-end">End Date</label>
                <input
                  type="date"
                  id="report-end"
                  name="endDate"
                  value={dateRange.endDate}
                  onChange={handleDateChange}
                  className="form-control"
                />
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

        <section className="settings-card" aria-label="Report preview">
          <h2 className="section-title">📊 Report Preview</h2>

          {selectedReport === 'vaccine-usage' && (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th scope="col">Vaccine</th>
                    <th scope="col">Administered</th>
                    <th scope="col">Wasted</th>
                    <th scope="col">Remaining</th>
                    <th scope="col">Efficiency</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData['vaccine-usage'].map((row, idx) => (
                    <tr key={idx}>
                      <td><strong>{row.vaccine}</strong></td>
                      <td>{row.administered} doses</td>
                      <td style={{ color: row.wasted > 5 ? '#e53935' : '#666' }}>
                        {row.wasted} doses
                      </td>
                      <td>{row.remaining} doses</td>
                      <td>
                        <span style={{
                          color: row.wasted < 5 ? '#2e7d32' : '#f57f17',
                          fontWeight: 'bold',
                        }}>
                          {((row.administered / (row.administered + row.wasted)) * 100).toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
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
    </div>
  );
};

export default Reports;
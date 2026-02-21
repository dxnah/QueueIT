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

  // Seeded from dashboardData — replace with API call when backend is added
  const [reportData] = useState(reportsData);

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerateReport = () => {
    alert(`Generating ${selectedReport} report for ${selectedPeriod} period from ${dateRange.startDate} to ${dateRange.endDate}`);
  };

  const handleExportReport = (format) => {
    alert(`Exporting report as ${format.toUpperCase()}`);
  };

  return (
    <div className="dashboard-container">

      <button
        className="mobile-menu-toggle"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
        ☰
      </button>

      <Sidebar
        isMobileMenuOpen={isMobileMenuOpen}
        onMenuClose={() => setIsMobileMenuOpen(false)}
      />

      {isMobileMenuOpen && (
        <div className="overlay" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      <div className="main-content">

        <h2 className="dashboard-heading">📈 Reports & Analytics</h2>
        <p className="dashboard-subheading">Generate and view system performance reports</p>

        {/* Report Configuration */}
        <div className="settings-card">
          <h3 className="section-title">📋 Report Configuration</h3>

          <div className="form-row">
            <div className="form-group">
              <label>Report Type</label>
              <select
                value={selectedReport}
                onChange={(e) => setSelectedReport(e.target.value)}
                className="form-control">
                <option value="vaccine-usage">💉 Vaccine Usage Report</option>
                <option value="stock-levels">📦 Stock Levels Report</option>
              </select>
            </div>

            <div className="form-group">
              <label>Time Period</label>
              <select
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
                <label>Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={dateRange.startDate}
                  onChange={handleDateChange}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={dateRange.endDate}
                  onChange={handleDateChange}
                  className="form-control"
                />
              </div>
            </div>
          )}

          <div className="form-actions">
            <button onClick={handleGenerateReport} className="btn btn-primary">
              🔍 Generate Report
            </button>
            <button onClick={() => handleExportReport('pdf')} className="btn btn-secondary">
              📄 Export PDF
            </button>
            <button onClick={() => handleExportReport('excel')} className="btn btn-secondary">
              📊 Export Excel
            </button>
          </div>
        </div>

        {/* Report Preview */}
        <div className="settings-card">
          <h3 className="section-title">📊 Report Preview</h3>

          {selectedReport === 'vaccine-usage' && (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Vaccine</th>
                    <th>Administered</th>
                    <th>Wasted</th>
                    <th>Remaining</th>
                    <th>Efficiency</th>
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
                    <th>Period</th>
                    <th>In Stock</th>
                    <th>Low Stock</th>
                    <th>Out of Stock</th>
                    <th>Stock Health</th>
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
        </div>

      </div>
    </div>
  );
};

export default Reports; 
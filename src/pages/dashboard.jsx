// Dashboard.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import PredictionCard from '../components/PredictionCard';
import InsightToggle from '../components/InsightToggle';
import '../styles/dashboard.css';

import {
  mlPredictions,
  predictionCards,
  mlInsights,
  vaccineData,
} from '../data/dashboardData';

const Dashboard = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // ── DYNAMIC CALCULATIONS ───────────────────────────────
  const totalAvailable  = vaccineData.reduce((sum, v) => sum + v.available, 0);
  const lowStockCount   = vaccineData.filter(v => v.status === 'Low Stock').length;
  const outOfStockCount = vaccineData.filter(v => v.status === 'Out Stock').length;
  const totalToOrder    = vaccineData.reduce((sum, v) => sum + v.mlRecommended, 0);
  const vaccinesToOrder = vaccineData.filter(v =>
    v.status === 'Low Stock' || v.status === 'Out Stock'
  );

  // ── DYNAMIC COLOR HELPERS ──────────────────────────────
  const getAvailableColor  = (total) => total > 500 ? '#26a69a' : total > 100 ? '#f57f17' : '#c62828';
  const getLowStockColor   = (count) => count === 0 ? '#26a69a' : count <= 2 ? '#f57f17' : '#c62828';
  const getOutOfStockColor = (count) => count === 0 ? '#26a69a' : '#c62828';

  const getAvailableBorder  = (total) => `4px solid ${getAvailableColor(total)}`;
  const getLowStockBorder   = (count) => `4px solid ${getLowStockColor(count)}`;
  const getOutOfStockBorder = (count) => `4px solid ${getOutOfStockColor(count)}`;

  const getAvailableLabel  = (total) => total > 500 ? '✅ Stock is sufficient'       : total > 100 ? '⚠️ Stock is getting low'     : '🚨 Stock is critically low';
  const getLowStockLabel   = (count) => count === 0 ? '✅ All vaccines well stocked'  : count <= 2  ? '⚠️ Some vaccines running low' : '🚨 Many vaccines running low';
  const getOutOfStockLabel = (count) => count === 0 ? '✅ All vaccines available'     : '🚨 Immediate restocking needed';

  // ── ORDER URGENCY ──────────────────────────────────────
  const getOrderUrgencyClass = (status) => {
    if (status === 'Out Stock') return 'urgency-out';
    if (status === 'Low Stock') return 'urgency-low';
    return 'urgency-ok';
  };
  const getOrderUrgencyLabel = (status) => {
    if (status === 'Out Stock') return '🚨 Urgent';
    if (status === 'Low Stock') return '⚠️ Soon';
    return '✅ OK';
  };

  // ── VACCINE TABLE HELPERS ──────────────────────────────
  const getVaccineStatusClass = (status) => {
    if (status === 'In Stock')  return 'status-in-stock';
    if (status === 'Low Stock') return 'status-low-stock';
    return 'status-out-stock';
  };

  const getCrowdLevelClass = (level) => {
    if (level === 'High' || level === 'High - Above High') return 'crowd-badge crowd-high';
    if (level === 'Normal - Medium' || level === 'Medium') return 'crowd-badge crowd-normal';
    return 'crowd-badge crowd-low';
  };

  return (
    <div className="dashboard-container">

      {/* Hamburger */}
      <button
        className="mobile-menu-toggle"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
        ☰
      </button>

      {/* Sidebar Component */}
      <Sidebar 
        activeTab="dashboard"
        isMobileMenuOpen={isMobileMenuOpen}
        onMenuClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Overlay */}
      {isMobileMenuOpen && (
        <div className="overlay" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Main Content */}
      <div className="main-content">

        <h2 className="dashboard-heading">📊 Admin Dashboard</h2>
        <p className="dashboard-subheading">Welcome back, Admin</p>

        {/* ── STATS CARDS ── */}
        <div className="stats-container">

          <div className="stat-box" style={{ borderTop: getAvailableBorder(totalAvailable) }}>
            <h3 className="stat-title">Vaccines Available</h3>
            <p className="stat-number" style={{ color: getAvailableColor(totalAvailable) }}>
              {totalAvailable.toLocaleString()}
            </p>
            <p className="stat-note">{getAvailableLabel(totalAvailable)}</p>
          </div>

          <div className="stat-box" style={{ borderTop: '4px solid #e53935' }}>
            <h3 className="stat-title">Vaccines to Order</h3>
            <p className="stat-number" style={{ color: '#e53935' }}>
              {totalToOrder.toLocaleString()}
            </p>
            <p className="stat-note">💊 {vaccinesToOrder.length} vaccine types need restocking</p>
          </div>

          <div className="stat-box" style={{ borderTop: getLowStockBorder(lowStockCount) }}>
            <h3 className="stat-title">Low Stock</h3>
            <p className="stat-number" style={{ color: getLowStockColor(lowStockCount) }}>
              {lowStockCount}
            </p>
            <p className="stat-note">{getLowStockLabel(lowStockCount)}</p>
          </div>

          <div className="stat-box" style={{ borderTop: getOutOfStockBorder(outOfStockCount) }}>
            <h3 className="stat-title">Out of Stock</h3>
            <p className="stat-number" style={{ color: getOutOfStockColor(outOfStockCount) }}>
              {outOfStockCount}
            </p>
            <p className="stat-note">{getOutOfStockLabel(outOfStockCount)}</p>
          </div>

        </div>

        {/* ── Step 2: PredictionCard Components ── */}
        <div className="prediction-row">
          {predictionCards.map((card) => (
            <PredictionCard
              key={card.id}
              label={card.label}
              result={card.result}
              confidence={card.confidence}
              resultColor={card.resultColor}
            />
          ))}
        </div>

        {/* ── Step 4: InsightToggle Component ── */}
        <InsightToggle insights={mlInsights} />

        {/* ── MIDDLE ROW: ML + Vaccine Availability ── */}
        <div className="middle-row">

          {/* ML PREDICTIONS */}
          <div className="ml-card">
            <h3 className="section-title">🤖 ML Predictions in a Month</h3>

            <div className="ml-item">
              <div className="ml-label-group">
                <span className="ml-label">Crowd Level at Normal Operations</span>
              </div>
              <span className={getCrowdLevelClass(mlPredictions.crowdLevelNormal)}>
                {mlPredictions.crowdLevelNormal}
              </span>
            </div>

            <div className="ml-item">
              <div className="ml-label-group">
                <span className="ml-label">Crowd Level during Peak Months</span>
              </div>
              <span className={getCrowdLevelClass(mlPredictions.crowdLevelPeak)}>
                {mlPredictions.crowdLevelPeak}
              </span>
            </div>

            <div className="ml-item">
              <span className="ml-label">Peak Months</span>
              <span className="ml-value-peak">📅 {mlPredictions.peakMonths}</span>
            </div>

            <div className="ml-item">
              <div className="ml-label-group">
                <span className="ml-label">Predicted Vaccines at Normal Operation</span>
              </div>
              <span className="ml-value-normal">
                💉 {mlPredictions.vaccinesAtNormal.toLocaleString()}
              </span>
            </div>

            <div className="ml-item">
              <div className="ml-label-group">
                <span className="ml-label">Predicted Vaccines during Peak Months</span>
              </div>
              <span className="ml-value-peak">
                💉 {mlPredictions.vaccinesAtPeak.toLocaleString()}
              </span>
            </div>
          </div>

          {/* VACCINE AVAILABILITY */}
          <div className="vaccine-card">
            <h3 className="section-title">💉 Vaccine Availability</h3>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Vaccine</th>
                    <th>Available</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {vaccineData.map((vaccine) => (
                    <tr key={vaccine.id}>
                      <td>{vaccine.vaccine}</td>
                      <td>{vaccine.available.toLocaleString()}</td>
                      <td>
                        <span className={getVaccineStatusClass(vaccine.status)}>
                          {vaccine.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="total-row">
                    <td>Total</td>
                    <td>{vaccineData.reduce((sum, v) => sum + v.available, 0).toLocaleString()}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

        </div>

        {/* ── VACCINES TO ORDER TABLE ── */}
        <div className="order-card">
          <div className="order-card-header">
            <div>
              <h3 className="section-title">📦 Vaccines to Order</h3>
              <p className="ml-subtitle">
                ML recommended restock list — {vaccinesToOrder.length} vaccine/s need ordering
              </p>
            </div>
            <div className="order-total-badge">
              Total to Order: <strong>{totalToOrder.toLocaleString()}</strong> doses
            </div>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Vaccine</th>
                  <th>Current Stock</th>
                  <th>Min. Required</th>
                  <th>ML Recommended Order</th>
                  <th>Urgency</th>
                </tr>
              </thead>
              <tbody>
                {vaccinesToOrder.map((vaccine) => (
                  <tr key={vaccine.id}>
                    <td><strong>{vaccine.vaccine}</strong></td>
                    <td>
                      <span style={{
                        color: vaccine.available === 0 ? '#c62828' : '#f57f17',
                        fontWeight: '700',
                      }}>
                        {vaccine.available.toLocaleString()}
                      </span>
                    </td>
                    <td>{vaccine.minStock.toLocaleString()}</td>
                    <td>
                      <strong style={{ color: '#26a69a', fontSize: '14px' }}>
                        💉 {vaccine.mlRecommended.toLocaleString()} doses
                      </strong>
                    </td>
                    <td>
                      <span className={getOrderUrgencyClass(vaccine.status)}>
                        {getOrderUrgencyLabel(vaccine.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="total-row">
                  <td colSpan={3}>Total Doses to Order</td>
                  <td style={{ color: '#e53935' }}>
                    💉 {totalToOrder.toLocaleString()} doses
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
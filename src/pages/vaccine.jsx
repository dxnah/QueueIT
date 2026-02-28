// Vaccine.jsx

import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import VaccineCard from '../components/VaccineCard';
import {
  vaccineData,
  MONTHLY_REQUIREMENTS,
  PEAK_MONTHS,
  getMonthlyRequirement,
  getOrderUrgency,
  getUsedThisMonth,
  logDailyUsage,
} from '../data/dashboardData';
import '../styles/dashboard.css';
import '../styles/vaccine.css';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

const DAYS_IN_MONTH = {
  January:31,February:28,March:31,April:30,May:31,June:30,
  July:31,August:31,September:30,October:31,November:30,December:31,
};

const VaccineManagement = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAddForm, setShowAddForm]           = useState(false);
  const [editingVaccine, setEditingVaccine]     = useState(null);
  const [filterStatus, setFilterStatus]         = useState('all');
  const [searchQuery, setSearchQuery]           = useState('');
  const [saveMessage, setSaveMessage]           = useState('');

  const [selectedMonth, setSelectedMonth] = useState('January');
  const [monthDropOpen, setMonthDropOpen] = useState(false);
  const [refreshKey, setRefreshKey]       = useState(0);

  const [showLogModal, setShowLogModal]   = useState(false);
  const [logDay, setLogDay]               = useState(1);
  const [logAmounts, setLogAmounts]       = useState(
    Object.fromEntries(vaccineData.map(v => [v.vaccine, '']))
  );

  const [vaccines, setVaccines] = useState(
    vaccineData.map(v => ({ ...v, name: v.vaccine }))
  );

  const [formData, setFormData] = useState({
    name: '', available: '', minStock: '', batchNumber: '', expiryDate: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const calculateStatus = (available, minStock) => {
    if (available === 0)      return 'Out Stock';
    if (available < minStock) return 'Low Stock';
    return 'In Stock';
  };

  const handleAddVaccine = (e) => {
    e.preventDefault();
    const avail    = parseInt(formData.available);
    const minStock = parseInt(formData.minStock);
    const newVaccine = {
      id: Date.now(), name: formData.name, vaccine: formData.name,
      available: avail, minStock, batchNumber: formData.batchNumber,
      expiryDate: formData.expiryDate, status: calculateStatus(avail, minStock),
      mlRecommended: Math.max(0, minStock - avail),
    };
    setVaccines(prev => [...prev, newVaccine]);
    setFormData({ name: '', available: '', minStock: '', batchNumber: '', expiryDate: '' });
    setShowAddForm(false);
    setSaveMessage('✅ Vaccine added successfully!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleEditVaccine = (vaccine) => {
    setEditingVaccine(vaccine);
    setFormData({ name: vaccine.name, available: vaccine.available, minStock: vaccine.minStock, batchNumber: vaccine.batchNumber, expiryDate: vaccine.expiryDate });
    setShowAddForm(true);
  };

  const handleUpdateVaccine = (e) => {
    e.preventDefault();
    const avail    = parseInt(formData.available);
    const minStock = parseInt(formData.minStock);
    setVaccines(prev => prev.map(v =>
      v.id === editingVaccine.id
        ? { ...v, name: formData.name, vaccine: formData.name, available: avail, minStock, batchNumber: formData.batchNumber, expiryDate: formData.expiryDate, status: calculateStatus(avail, minStock), mlRecommended: Math.max(0, minStock - avail) }
        : v
    ));
    setEditingVaccine(null);
    setFormData({ name: '', available: '', minStock: '', batchNumber: '', expiryDate: '' });
    setShowAddForm(false);
    setSaveMessage('✅ Vaccine updated successfully!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleDeleteVaccine = (id) => {
    if (window.confirm('Are you sure you want to delete this vaccine?')) {
      setVaccines(prev => prev.filter(v => v.id !== id));
      setSaveMessage('✅ Vaccine deleted successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  const handleLogSave = () => {
    vaccineData.forEach(v => {
      const amt = parseInt(logAmounts[v.vaccine]) || 0;
      if (amt > 0) logDailyUsage(v.vaccine, selectedMonth, logDay, amt);
    });
    setLogAmounts(Object.fromEntries(vaccineData.map(v => [v.vaccine, ''])));
    setShowLogModal(false);
    setRefreshKey(k => k + 1);
    setSaveMessage('✅ Daily usage logged successfully!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const getVaccineMonthlyUrgency = (vaccineName) => {
    const required  = getMonthlyRequirement(vaccineName, selectedMonth);
    const usedSoFar = getUsedThisMonth(vaccineName, selectedMonth);
    const remaining = Math.max(0, required - usedSoFar);
    return getOrderUrgency(remaining, required);
  };

  const isPeak = PEAK_MONTHS.includes(selectedMonth);

  const filteredVaccines = vaccines.filter(v => {
    const matchesStatus = filterStatus === 'all' || v.status === filterStatus;
    const matchesSearch =
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.batchNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalVaccines   = vaccines.length;
  const lowStockCount   = vaccines.filter(v => v.status === 'Low Stock').length;
  const outOfStockCount = vaccines.filter(v => v.status === 'Out Stock').length;
  const totalDoses      = vaccines.reduce((sum, v) => sum + v.available, 0);

  const closeForm = () => {
    setShowAddForm(false);
    setEditingVaccine(null);
    setFormData({ name: '', available: '', minStock: '', batchNumber: '', expiryDate: '' });
  };

  const dropBtnStyle = {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    padding: '7px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '600',
    cursor: 'pointer', border: '1.5px solid #26a69a',
    background: '#26a69a', color: 'white',
  };

  // ── Shared input style ─────────────────────────────────
  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1.5px solid #e0e0e0',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '11px',
    fontWeight: '700',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '6px',
  };

  return (
    <div className="dashboard-container">

      <button className="mobile-menu-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>☰</button>

      <Sidebar isMobileMenuOpen={isMobileMenuOpen} onMenuClose={() => setIsMobileMenuOpen(false)} />

      {isMobileMenuOpen && <div className="overlay" onClick={() => setIsMobileMenuOpen(false)} />}

      {/* ── Log Usage Modal ── */}
      {showLogModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '28px', width: '420px', maxWidth: '95vw', boxShadow: '0 12px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>📋 Log Daily Usage — {selectedMonth}</h3>
              <button onClick={() => setShowLogModal(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#999' }}>✕</button>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Day of {selectedMonth}</label>
              <select value={logDay} onChange={e => setLogDay(parseInt(e.target.value))} style={inputStyle}>
                {Array.from({ length: DAYS_IN_MONTH[selectedMonth] || 30 }, (_, i) => i + 1).map(d => (
                  <option key={d} value={d}>Day {d}</option>
                ))}
              </select>
            </div>
            {vaccineData.map(v => (
              <div key={v.vaccine} style={{ marginBottom: '12px' }}>
                <label style={labelStyle}>{v.vaccine}</label>
                <input type="number" min="0" placeholder="Doses used today"
                  value={logAmounts[v.vaccine]}
                  onChange={e => setLogAmounts(prev => ({ ...prev, [v.vaccine]: e.target.value }))}
                  style={inputStyle} />
              </div>
            ))}
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={handleLogSave} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: '#26a69a', color: 'white', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>💾 Save Usage</button>
              <button onClick={() => setShowLogModal(false)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1.5px solid #e0e0e0', background: 'white', color: '#555', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      {showAddForm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '16px',
        }}>
          <div style={{
            background: 'white', borderRadius: '20px', width: '480px', maxWidth: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.25)', overflow: 'hidden',
          }}>

            {/* Modal header — green bar */}
            <div style={{
              background: '#26a69a', padding: '20px 24px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '18px',
                }}>
                  {editingVaccine ? '✏️' : '➕'}
                </div>
                <div>
                  <h3 style={{ margin: 0, color: 'white', fontSize: '16px', fontWeight: '700' }}>
                    {editingVaccine ? 'Edit Vaccine' : 'Add New Vaccine'}
                  </h3>
                  <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>
                    {editingVaccine ? 'Update vaccine details below' : 'Fill in the vaccine details below'}
                  </p>
                </div>
              </div>
              <button
                onClick={closeForm}
                style={{
                  background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%',
                  width: '32px', height: '32px', cursor: 'pointer', color: 'white',
                  fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >✕</button>
            </div>

            {/* Modal body */}
            <div style={{ padding: '24px' }}>
              <form onSubmit={editingVaccine ? handleUpdateVaccine : handleAddVaccine}>

                {/* Vaccine Name */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={labelStyle}>Vaccine Name</label>
                  <input
                    type="text" name="name" value={formData.name}
                    onChange={handleInputChange} required
                    placeholder="e.g., Anti-Rabies"
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#26a69a'}
                    onBlur={e => e.target.style.borderColor = '#e0e0e0'}
                  />
                </div>

                {/* Available + Min Stock side by side */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                  <div>
                    <label style={labelStyle}>Available Doses</label>
                    <input
                      type="number" name="available" value={formData.available}
                      onChange={handleInputChange} required min="0"
                      placeholder="320"
                      style={inputStyle}
                      onFocus={e => e.target.style.borderColor = '#26a69a'}
                      onBlur={e => e.target.style.borderColor = '#e0e0e0'}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Minimum Stock</label>
                    <input
                      type="number" name="minStock" value={formData.minStock}
                      onChange={handleInputChange} required min="0"
                      placeholder="300"
                      style={inputStyle}
                      onFocus={e => e.target.style.borderColor = '#26a69a'}
                      onBlur={e => e.target.style.borderColor = '#e0e0e0'}
                    />
                  </div>
                </div>

                {/* Batch + Expiry side by side */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '24px' }}>
                  <div>
                    <label style={labelStyle}>Batch Number</label>
                    <input
                      type="text" name="batchNumber" value={formData.batchNumber}
                      onChange={handleInputChange} required
                      placeholder="AR-2024-001"
                      style={inputStyle}
                      onFocus={e => e.target.style.borderColor = '#26a69a'}
                      onBlur={e => e.target.style.borderColor = '#e0e0e0'}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Expiry Date</label>
                    <input
                      type="date" name="expiryDate" value={formData.expiryDate}
                      onChange={handleInputChange} required
                      style={inputStyle}
                      onFocus={e => e.target.style.borderColor = '#26a69a'}
                      onBlur={e => e.target.style.borderColor = '#e0e0e0'}
                    />
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="submit"
                    style={{
                      flex: 1, padding: '12px', borderRadius: '10px', border: 'none',
                      background: '#26a69a', color: 'white', fontWeight: '700',
                      fontSize: '14px', cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(38,166,154,0.35)',
                    }}
                  >
                    {editingVaccine ? '💾 Update Vaccine' : '➕ Add Vaccine'}
                  </button>
                  <button
                    type="button" onClick={closeForm}
                    style={{
                      flex: 1, padding: '12px', borderRadius: '10px',
                      border: '1.5px solid #e0e0e0', background: 'white',
                      color: '#555', fontWeight: '600', fontSize: '14px', cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      )}

      <div className="main-content" key={refreshKey}>

        {/* ── Page header ── */}
        <div className="page-header">
          <div>
            <h2 className="dashboard-heading">💉 Vaccine Management</h2>
            <p className="dashboard-subheading">Manage vaccine inventory and stock levels</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>

            {/* 🔍 Search — moved here from filters row */}
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)',
                fontSize: '14px', pointerEvents: 'none', color: '#aaa',
              }}>🔍</span>
              <input
                type="text"
                placeholder="Search vaccines..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  padding: '7px 14px 7px 32px',
                  borderRadius: '8px',
                  border: '1.5px solid #e0e0e0',
                  fontSize: '13px',
                  outline: 'none',
                  width: '200px',
                  transition: 'border-color 0.2s, width 0.2s',
                  background: 'white',
                }}
                onFocus={e => { e.target.style.borderColor = '#26a69a'; }}
                onBlur={e => { e.target.style.borderColor = '#e0e0e0'; }}
              />
            </div>

            {/* Month selector */}
            <div style={{ position: 'relative' }}>
              <button type="button" style={dropBtnStyle} onClick={() => setMonthDropOpen(v => !v)}>
                📅 {selectedMonth}{isPeak ? ' 🔥' : ''} ▾
              </button>
              {monthDropOpen && (
                <div style={{ position: 'absolute', top: '110%', right: 0, zIndex: 999, background: 'white', border: '1px solid #e0e0e0', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)', minWidth: '180px', padding: '6px 0', overflow: 'hidden' }}>
                  {MONTHS.map(m => {
                    const isPeakM = PEAK_MONTHS.includes(m);
                    return (
                      <div key={m}
                        style={{ padding: '8px 16px', cursor: 'pointer', fontSize: '13px', fontWeight: m === selectedMonth ? '700' : '500', background: m === selectedMonth ? '#e0f7f4' : 'white', color: isPeakM ? '#e53935' : m === selectedMonth ? '#26a69a' : '#333', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                        onMouseEnter={e => e.currentTarget.style.background = isPeakM ? '#fff3e0' : '#f5f5f5'}
                        onMouseLeave={e => e.currentTarget.style.background = m === selectedMonth ? '#e0f7f4' : 'white'}
                        onClick={() => { setSelectedMonth(m); setMonthDropOpen(false); }}
                      >
                        <span>{m}</span>
                        {isPeakM
                          ? <span style={{ fontSize: '10px', background: '#ffebee', color: '#e53935', padding: '2px 6px', borderRadius: '10px', fontWeight: '700' }}>🔥 PEAK</span>
                          : m === selectedMonth ? <span style={{ color: '#26a69a' }}>✓</span> : null
                        }
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Log daily usage */}
            <button type="button"
              onClick={() => setShowLogModal(true)}
              style={{ padding: '7px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', border: '1.5px solid #5c6bc0', background: '#5c6bc0', color: 'white' }}>
              📋 Log Daily Usage
            </button>

          </div>
        </div>

        {saveMessage && <div className="alert alert-success">{saveMessage}</div>}

        {isPeak && (
          <div style={{ marginBottom: '16px', padding: '10px 16px', background: '#fff3e0', borderRadius: '8px', border: '1px solid #ffcc80', fontSize: '13px', color: '#e65100', fontWeight: '600' }}>
            🔥 <strong>Peak Season ({selectedMonth}):</strong> Monthly dose requirements are 1.5× higher. Cards below show adjusted urgency.
          </div>
        )}

        {/* Stats Cards */}
        <div className="stats-container">
          <div className="stat-box" style={{ borderTop: '4px solid #26a69a' }}>
            <h3 className="stat-title">Total Vaccines</h3>
            <p className="stat-number" style={{ color: '#26a69a' }}>{totalVaccines}</p>
            <p className="stat-note">📦 Vaccine types managed</p>
          </div>
          <div className="stat-box" style={{ borderTop: '4px solid #2196F3' }}>
            <h3 className="stat-title">Total Doses</h3>
            <p className="stat-number" style={{ color: '#2196F3' }}>{totalDoses.toLocaleString()}</p>
            <p className="stat-note">💉 Available doses in stock</p>
          </div>
          <div className="stat-box" style={{ borderTop: '4px solid #f57f17' }}>
            <h3 className="stat-title">Low Stock</h3>
            <p className="stat-number" style={{ color: '#f57f17' }}>{lowStockCount}</p>
            <p className="stat-note">⚠️ Vaccines need restocking</p>
          </div>
          <div className="stat-box" style={{ borderTop: '4px solid #e53935' }}>
            <h3 className="stat-title">Out of Stock</h3>
            <p className="stat-number" style={{ color: '#e53935' }}>{outOfStockCount}</p>
            <p className="stat-note">🚨 Critical attention needed</p>
          </div>
        </div>

        {/* Filters — filter buttons only, search is now in the header */}
        <div className="filters-container">
          <div className="filter-buttons">
            {[
              { key: 'all',       label: `All (${vaccines.length})` },
              { key: 'In Stock',  label: '✅ In Stock'              },
              { key: 'Low Stock', label: '⚠️ Low Stock'             },
              { key: 'Out Stock', label: '🚨 Out of Stock'          },
            ].map(f => (
              <button key={f.key} onClick={() => setFilterStatus(f.key)}
                className={filterStatus === f.key ? 'filter-btn active' : 'filter-btn'}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Vaccine Cards Grid */}
        <div className="vaccines-grid" style={{ paddingBottom: '100px' }}>
          {filteredVaccines.length > 0 ? (
            filteredVaccines.map(vaccine => (
              <VaccineCard
                key={vaccine.id}
                vaccine={{
                  ...vaccine,
                  monthlyUrgency: getVaccineMonthlyUrgency(vaccine.vaccine || vaccine.name),
                }}
                onEdit={handleEditVaccine}
                onDelete={handleDeleteVaccine}
              />
            ))
          ) : (
            <div className="empty-state">
              <p>📦 No vaccines found matching your criteria</p>
            </div>
          )}
        </div>

      </div>

      {/* ── Floating Add Button ── */}
      <button
        type="button"
        onClick={() => { setShowAddForm(true); setEditingVaccine(null); }}
        title="Add New Vaccine"
        style={{
          position: 'fixed',
          bottom: '32px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: '#26a69a',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 6px 24px rgba(38,166,154,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateX(-50%) scale(1.1)';
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(38,166,154,0.6)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateX(-50%)';
          e.currentTarget.style.boxShadow = '0 6px 24px rgba(38,166,154,0.5)';
        }}
      >
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="12" y="4" width="4" height="20" rx="2" fill="rgba(255,255,255,0.9)"/>
          <rect x="4" y="12" width="20" height="4" rx="2" fill="rgba(255,255,255,0.9)"/>
        </svg>
      </button>

    </div>
  );
};

export default VaccineManagement;
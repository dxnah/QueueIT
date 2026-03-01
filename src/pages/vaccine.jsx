// vaccine.jsx

import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import VaccineCard from '../components/VaccineCard';
import {
  vaccineData,
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

  return (
    <section className="dashboard-container">

      <button type="button" className="mobile-menu-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>☰</button>

      <Sidebar isMobileMenuOpen={isMobileMenuOpen} onMenuClose={() => setIsMobileMenuOpen(false)} />

      {isMobileMenuOpen && <div className="overlay" onClick={() => setIsMobileMenuOpen(false)} />}

      {/* ── Log Usage Modal ── */}
      {showLogModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h3 className="modal-title">📋 Log Daily Usage — {selectedMonth}</h3>
            </div>
            <div className="modal-field">
              <label className="modal-label">Day of {selectedMonth}</label>
              <select value={logDay} onChange={e => setLogDay(parseInt(e.target.value))} className="modal-input">
                {Array.from({ length: DAYS_IN_MONTH[selectedMonth] || 30 }, (_, i) => i + 1).map(d => (
                  <option key={d} value={d}>Day {d}</option>
                ))}
              </select>
            </div>
            {vaccineData.map(v => (
              <div key={v.vaccine} className="modal-field">
                <label className="modal-label">{v.vaccine}</label>
                <input type="number" min="0" placeholder="Doses used today"
                  value={logAmounts[v.vaccine]}
                  onChange={e => setLogAmounts(prev => ({ ...prev, [v.vaccine]: e.target.value }))}
                  className="modal-input" />
              </div>
            ))}
            <div className="modal-actions">
              <button type="button" onClick={handleLogSave} className="modal-btn-save">💾 Save Usage</button>
              <button type="button" onClick={() => setShowLogModal(false)} className="modal-btn-cancel">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal-box modal-box--wide">

            {/* Modal header — green bar */}
            <div className="modal-green-header">
              <div className="modal-green-header-left">
                <div className="modal-icon-circle">
                  {editingVaccine ? '✏️' : '➕'}
                </div>
                <div>
                  <h3 className="modal-green-title">
                    {editingVaccine ? 'Edit Vaccine' : 'Add New Vaccine'}
                  </h3>
                  <p className="modal-green-subtitle">
                    {editingVaccine ? 'Update vaccine details below' : 'Fill in the vaccine details below'}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal body */}
            <div className="modal-body">
              <form onSubmit={editingVaccine ? handleUpdateVaccine : handleAddVaccine}>

                <div className="modal-field">
                  <label className="modal-label">Vaccine Name</label>
                  <input
                    type="text" name="name" value={formData.name}
                    onChange={handleInputChange} required
                    placeholder="e.g., Anti-Rabies"
                    className="modal-input"
                  />
                </div>

                <div className="modal-grid-2">
                  <div>
                    <label className="modal-label">Available Doses</label>
                    <input
                      type="number" name="available" value={formData.available}
                      onChange={handleInputChange} required min="0"
                      placeholder="320"
                      className="modal-input"
                    />
                  </div>
                  <div>
                    <label className="modal-label">Minimum Stock</label>
                    <input
                      type="number" name="minStock" value={formData.minStock}
                      onChange={handleInputChange} required min="0"
                      placeholder="300"
                      className="modal-input"
                    />
                  </div>
                </div>

                <div className="modal-grid-2 modal-grid-2--mb">
                  <div>
                    <label className="modal-label">Batch Number</label>
                    <input
                      type="text" name="batchNumber" value={formData.batchNumber}
                      onChange={handleInputChange} required
                      placeholder="AR-2024-001"
                      className="modal-input"
                    />
                  </div>
                  <div>
                    <label className="modal-label">Expiry Date</label>
                    <input
                      type="date" name="expiryDate" value={formData.expiryDate}
                      onChange={handleInputChange} required
                      className="modal-input"
                    />
                  </div>
                </div>

                <div className="modal-actions">
                  <button type="submit" className="modal-btn-save">
                    {editingVaccine ? '💾 Update Vaccine' : '➕ Add Vaccine'}
                  </button>
                  <button type="button" onClick={closeForm} className="modal-btn-cancel">
                    Cancel
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      )}

      <main className="main-content" key={refreshKey}>

        {/* ── Page header ── */}
        <div className="page-header">
          <div>
            <h1 className="dashboard-heading">💉 Vaccine Management</h1>
            <p className="dashboard-subheading">Manage vaccine inventory and stock levels</p>
          </div>
          <div className="page-header-actions">

            {/* Search */}
            <div className="search-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search vaccines..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="search-input-field"
              />
            </div>

            {/* Month selector */}
            <div className="dropdown-wrap">
              <button type="button" className="month-drop-btn" onClick={() => setMonthDropOpen(v => !v)}>
                📅 {selectedMonth}{isPeak ? ' 🔥' : ''} ▾
              </button>
              {monthDropOpen && (
                <div className="dropdown-menu">
                  {MONTHS.map(m => {
                    const isPeakM = PEAK_MONTHS.includes(m);
                    return (
                      <div key={m}
                        className={`dropdown-item ${m === selectedMonth ? 'dropdown-item--active' : ''} ${isPeakM ? 'dropdown-item--peak' : ''}`}
                        onMouseEnter={e => e.currentTarget.style.background = isPeakM ? '#fff3e0' : '#f5f5f5'}
                        onMouseLeave={e => e.currentTarget.style.background = m === selectedMonth ? '#e0f7f4' : 'white'}
                        onClick={() => { setSelectedMonth(m); setMonthDropOpen(false); }}
                      >
                        <span>{m}</span>
                        {isPeakM
                          ? <span className="peak-badge">🔥 PEAK</span>
                          : m === selectedMonth ? <span className="check-mark">✓</span> : null
                        }
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Log daily usage */}
            <button type="button" className="btn-log-usage" onClick={() => setShowLogModal(true)}>
              📋 Log Daily Usage
            </button>

          </div>
        </div>

        {saveMessage && <div className="alert alert-success">{saveMessage}</div>}

        {isPeak && (
          <div className="peak-notice">
            🔥 <strong>Peak Season ({selectedMonth}):</strong> Monthly dose requirements are 1.5× higher. Cards below show adjusted urgency.
          </div>
        )}

        {/* Stats Cards */}
        <div className="stats-container">
          <div className="stat-box stat-box--teal">
            <h3 className="stat-title">Total Vaccines</h3>
            <p className="stat-number stat-number--teal">{totalVaccines}</p>
            <p className="stat-note">📦 Vaccine types managed</p>
          </div>
          <div className="stat-box stat-box--blue">
            <h3 className="stat-title">Total Doses</h3>
            <p className="stat-number stat-number--blue">{totalDoses.toLocaleString()}</p>
            <p className="stat-note">💉 Available doses in stock</p>
          </div>
          <div className="stat-box stat-box--orange">
            <h3 className="stat-title">Low Stock</h3>
            <p className="stat-number stat-number--orange">{lowStockCount}</p>
            <p className="stat-note">⚠️ Vaccines need restocking</p>
          </div>
          <div className="stat-box stat-box--red">
            <h3 className="stat-title">Out of Stock</h3>
            <p className="stat-number stat-number--red">{outOfStockCount}</p>
            <p className="stat-note">🚨 Critical attention needed</p>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-container">
          <div className="filter-buttons">
            {[
              { key: 'all',       label: `All (${vaccines.length})` },
              { key: 'In Stock',  label: '✅ In Stock'              },
              { key: 'Low Stock', label: '⚠️ Low Stock'             },
              { key: 'Out Stock', label: '🚨 Out of Stock'          },
            ].map(f => (
              <button type="button" key={f.key} onClick={() => setFilterStatus(f.key)}
                className={filterStatus === f.key ? 'filter-btn active' : 'filter-btn'}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Vaccine Cards Grid */}
        <div className="vaccines-grid vaccines-grid--padded">
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

      </main>

      {/* ── Floating Add Button ── */}
      <button
        type="button"
        onClick={() => { setShowAddForm(true); setEditingVaccine(null); }}
        title="Add New Vaccine"
        className="fab-add-btn">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <rect x="12" y="4" width="4" height="20" rx="2" fill="rgba(255,255,255,0.9)"/>
          <rect x="4" y="12" width="20" height="4" rx="2" fill="rgba(255,255,255,0.9)"/>
        </svg>
      </button>

    </section>
  );
};

export default VaccineManagement;
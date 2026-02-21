// Vaccine.jsx

import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import VaccineCard from '../components/VaccineCard';
import { vaccineData } from '../data/dashboardData';
import '../styles/dashboard.css';
import '../styles/vaccine.css';

const VaccineManagement = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAddForm, setShowAddForm]           = useState(false);
  const [editingVaccine, setEditingVaccine]     = useState(null);
  const [filterStatus, setFilterStatus]         = useState('all');
  const [searchQuery, setSearchQuery]           = useState('');
  const [saveMessage, setSaveMessage]           = useState('');

  // ── Seed from dashboardData — replace useState with API fetch when backend added
  // vaccineData uses `vaccine` key; VaccineCard expects `name` — map on load
  const [vaccines, setVaccines] = useState(
    vaccineData.map(v => ({ ...v, name: v.vaccine }))
  );

  const [formData, setFormData] = useState({
    name:        '',
    available:   '',
    minStock:    '',
    batchNumber: '',
    expiryDate:  '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const calculateStatus = (available, minStock) => {
    if (available === 0)         return 'Out Stock';
    if (available < minStock)    return 'Low Stock';
    return 'In Stock';
  };

  const handleAddVaccine = (e) => {
    e.preventDefault();
    const avail    = parseInt(formData.available);
    const minStock = parseInt(formData.minStock);
    const newVaccine = {
      id:            Date.now(),
      name:          formData.name,
      vaccine:       formData.name,   // keep both keys in sync for dashboardData shape
      available:     avail,
      minStock:      minStock,
      batchNumber:   formData.batchNumber,
      expiryDate:    formData.expiryDate,
      status:        calculateStatus(avail, minStock),
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
    setFormData({
      name:        vaccine.name,
      available:   vaccine.available,
      minStock:    vaccine.minStock,
      batchNumber: vaccine.batchNumber,
      expiryDate:  vaccine.expiryDate,
    });
    setShowAddForm(true);
  };

  const handleUpdateVaccine = (e) => {
    e.preventDefault();
    const avail    = parseInt(formData.available);
    const minStock = parseInt(formData.minStock);
    setVaccines(prev => prev.map(v =>
      v.id === editingVaccine.id
        ? {
            ...v,
            name:          formData.name,
            vaccine:       formData.name,
            available:     avail,
            minStock:      minStock,
            batchNumber:   formData.batchNumber,
            expiryDate:    formData.expiryDate,
            status:        calculateStatus(avail, minStock),
            mlRecommended: Math.max(0, minStock - avail),
          }
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

        <div className="page-header">
          <div>
            <h2 className="dashboard-heading">💉 Vaccine Management</h2>
            <p className="dashboard-subheading">Manage vaccine inventory and stock levels</p>
          </div>

        </div>

        {saveMessage && (
          <div className="alert alert-success">{saveMessage}</div>
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

        {/* Add / Edit Modal */}
        {showAddForm && (
          <div className="form-modal">
            <div className="form-modal-content">
              <div className="form-modal-header">
                <h3>{editingVaccine ? '✏️ Edit Vaccine' : '➕ Add New Vaccine'}</h3>
                <button onClick={closeForm} className="close-btn">✕</button>
              </div>

              <form onSubmit={editingVaccine ? handleUpdateVaccine : handleAddVaccine}>
                <div className="form-group">
                  <label>Vaccine Name</label>
                  <input type="text" name="name" value={formData.name}
                    onChange={handleInputChange} required placeholder="e.g., Anti-Rabies"
                    className="form-control" />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Available Doses</label>
                    <input type="number" name="available" value={formData.available}
                      onChange={handleInputChange} required min="0" placeholder="320"
                      className="form-control" />
                  </div>
                  <div className="form-group">
                    <label>Minimum Stock</label>
                    <input type="number" name="minStock" value={formData.minStock}
                      onChange={handleInputChange} required min="0" placeholder="300"
                      className="form-control" />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Batch Number</label>
                    <input type="text" name="batchNumber" value={formData.batchNumber}
                      onChange={handleInputChange} required placeholder="AR-2024-001"
                      className="form-control" />
                  </div>
                  <div className="form-group">
                    <label>Expiry Date</label>
                    <input type="date" name="expiryDate" value={formData.expiryDate}
                      onChange={handleInputChange} required className="form-control" />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    {editingVaccine ? '💾 Update Vaccine' : '➕ Add Vaccine'}
                  </button>
                  <button type="button" onClick={closeForm} className="btn btn-secondary">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="filters-container">
          <div className="search-box">
            <input type="text" placeholder="🔍 Search vaccines..."
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input" />
          </div>
          <div className="filter-buttons">
            {[
              { key: 'all',       label: `All (${vaccines.length})` },
              { key: 'In Stock',  label: '✅ In Stock' },
              { key: 'Low Stock', label: '⚠️ Low Stock' },
              { key: 'Out Stock', label: '🚨 Out of Stock' },
            ].map(f => (
              <button key={f.key} onClick={() => setFilterStatus(f.key)}
                className={filterStatus === f.key ? 'filter-btn active' : 'filter-btn'}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Vaccine Cards Grid */}
        <div className="vaccines-grid">
          {filteredVaccines.length > 0 ? (
            filteredVaccines.map(vaccine => (
              <VaccineCard
                key={vaccine.id}
                vaccine={vaccine}
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
    </div>
  );
};

export default VaccineManagement;
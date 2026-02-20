// Vaccine.jsx

import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import VaccineCard from '../components/VaccineCard';
import '../styles/dashboard.css';
import '../styles/vaccine.css';

const VaccineManagement = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVaccine, setEditingVaccine] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [saveMessage, setSaveMessage] = useState('');

  // Vaccine inventory state
  const [vaccines, setVaccines] = useState([
    { id: 1, name: 'Anti-Rabies', available: 320, minStock: 300, batchNumber: 'AR-2024-001', expiryDate: '2025-06-15', status: 'In Stock', mlRecommended: 200 },
    { id: 2, name: 'Anti-Tetanus', available: 85, minStock: 200, batchNumber: 'AT-2024-002', expiryDate: '2025-08-20', status: 'Low Stock', mlRecommended: 350 },
    { id: 3, name: 'Booster', available: 0, minStock: 150, batchNumber: 'BS-2024-003', expiryDate: '2025-04-10', status: 'Out Stock', mlRecommended: 500 },
    { id: 4, name: 'Hepatitis B', available: 2, minStock: 100, batchNumber: 'HB-2024-004', expiryDate: '2025-07-25', status: 'Low Stock', mlRecommended: 300 },
    { id: 5, name: 'Flu Shot', available: 150, minStock: 100, batchNumber: 'FL-2024-005', expiryDate: '2025-05-30', status: 'In Stock', mlRecommended: 150 },
  ]);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    available: '',
    minStock: '',
    batchNumber: '',
    expiryDate: '',
  });

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Calculate status based on stock levels
  const calculateStatus = (available, minStock) => {
    if (available === 0) return 'Out Stock';
    if (available < minStock) return 'Low Stock';
    return 'In Stock';
  };

  // Add new vaccine
  const handleAddVaccine = (e) => {
    e.preventDefault();
    
    const newVaccine = {
      id: Date.now(),
      name: formData.name,
      available: parseInt(formData.available),
      minStock: parseInt(formData.minStock),
      batchNumber: formData.batchNumber,
      expiryDate: formData.expiryDate,
      status: calculateStatus(parseInt(formData.available), parseInt(formData.minStock)),
      mlRecommended: Math.max(0, parseInt(formData.minStock) - parseInt(formData.available))
    };

    setVaccines(prev => [...prev, newVaccine]);
    setFormData({ name: '', available: '', minStock: '', batchNumber: '', expiryDate: '' });
    setShowAddForm(false);
    setSaveMessage('✅ Vaccine added successfully!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  // Edit vaccine
  const handleEditVaccine = (vaccine) => {
    setEditingVaccine(vaccine);
    setFormData({
      name: vaccine.name,
      available: vaccine.available,
      minStock: vaccine.minStock,
      batchNumber: vaccine.batchNumber,
      expiryDate: vaccine.expiryDate,
    });
    setShowAddForm(true);
  };

  // Update vaccine
  const handleUpdateVaccine = (e) => {
    e.preventDefault();
    
    setVaccines(prev => prev.map(v => 
      v.id === editingVaccine.id 
        ? {
            ...v,
            name: formData.name,
            available: parseInt(formData.available),
            minStock: parseInt(formData.minStock),
            batchNumber: formData.batchNumber,
            expiryDate: formData.expiryDate,
            status: calculateStatus(parseInt(formData.available), parseInt(formData.minStock)),
            mlRecommended: Math.max(0, parseInt(formData.minStock) - parseInt(formData.available))
          }
        : v
    ));
    
    setEditingVaccine(null);
    setFormData({ name: '', available: '', minStock: '', batchNumber: '', expiryDate: '' });
    setShowAddForm(false);
    setSaveMessage('✅ Vaccine updated successfully!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  // Delete vaccine
  const handleDeleteVaccine = (id) => {
    if (window.confirm('Are you sure you want to delete this vaccine?')) {
      setVaccines(prev => prev.filter(v => v.id !== id));
      setSaveMessage('✅ Vaccine deleted successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  // Filter vaccines
  const filteredVaccines = vaccines.filter(v => {
    const matchesStatus = filterStatus === 'all' || v.status === filterStatus;
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         v.batchNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Calculate stats
  const totalVaccines = vaccines.length;
  const lowStockCount = vaccines.filter(v => v.status === 'Low Stock').length;
  const outOfStockCount = vaccines.filter(v => v.status === 'Out Stock').length;
  const totalDoses = vaccines.reduce((sum, v) => sum + v.available, 0);

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

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="form-modal">
            <div className="form-modal-content">
              <div className="form-modal-header">
                <h3>{editingVaccine ? '✏️ Edit Vaccine' : '➕ Add New Vaccine'}</h3>
                <button 
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingVaccine(null);
                    setFormData({ name: '', available: '', minStock: '', batchNumber: '', expiryDate: '' });
                  }}
                  className="close-btn">
                  ✕
                </button>
              </div>

              <form onSubmit={editingVaccine ? handleUpdateVaccine : handleAddVaccine}>
                <div className="form-group">
                  <label>Vaccine Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Anti-Rabies"
                    className="form-control"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Available Doses</label>
                    <input
                      type="number"
                      name="available"
                      value={formData.available}
                      onChange={handleInputChange}
                      required
                      min="0"
                      placeholder="320"
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label>Minimum Stock</label>
                    <input
                      type="number"
                      name="minStock"
                      value={formData.minStock}
                      onChange={handleInputChange}
                      required
                      min="0"
                      placeholder="300"
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Batch Number</label>
                    <input
                      type="text"
                      name="batchNumber"
                      value={formData.batchNumber}
                      onChange={handleInputChange}
                      required
                      placeholder="AR-2024-001"
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label>Expiry Date</label>
                    <input
                      type="date"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      required
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    {editingVaccine ? '💾 Update Vaccine' : '➕ Add Vaccine'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingVaccine(null);
                      setFormData({ name: '', available: '', minStock: '', batchNumber: '', expiryDate: '' });
                    }}
                    className="btn btn-secondary">
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
            <input
              type="text"
              placeholder="🔍 Search vaccines..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-buttons">
            <button 
              onClick={() => setFilterStatus('all')}
              className={filterStatus === 'all' ? 'filter-btn active' : 'filter-btn'}>
              All ({vaccines.length})
            </button>
            <button 
              onClick={() => setFilterStatus('In Stock')}
              className={filterStatus === 'In Stock' ? 'filter-btn active' : 'filter-btn'}>
              ✅ In Stock
            </button>
            <button 
              onClick={() => setFilterStatus('Low Stock')}
              className={filterStatus === 'Low Stock' ? 'filter-btn active' : 'filter-btn'}>
              ⚠️ Low Stock
            </button>
            <button 
              onClick={() => setFilterStatus('Out Stock')}
              className={filterStatus === 'Out Stock' ? 'filter-btn active' : 'filter-btn'}>
              🚨 Out of Stock
            </button>
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
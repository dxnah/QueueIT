// src/pages/Suppliers.jsx

import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import '../styles/dashboard.css';
import '../styles/suppliers.css';
import { suppliersData } from '../data/dashboardData';

const Suppliers = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [suppliers, setSuppliers] = useState(suppliersData);
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [saveMessage, setSaveMessage] = useState('');

  const emptyForm = { name:'', contact:'', phone:'', address:'', vaccines:'', status:'Active', leadTimeDays:'', notes:'' };
  const [form, setForm] = useState(emptyForm);

  const openAdd = () => { setEditingSupplier(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (s) => {
    setEditingSupplier(s);
    setForm({ ...s, vaccines: s.vaccines.join(', ') });
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...form,
      vaccines: form.vaccines.split(',').map(v => v.trim()).filter(Boolean),
      leadTimeDays: parseInt(form.leadTimeDays) || 0,
    };
    if (editingSupplier) {
      setSuppliers(prev => prev.map(s => s.id === editingSupplier.id ? { ...s, ...data } : s));
      setSaveMessage('✅ Supplier updated!');
    } else {
      setSuppliers(prev => [...prev, { ...data, id: Date.now() }]);
      setSaveMessage('✅ Supplier added!');
    }
    setShowForm(false);
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this supplier?')) return;
    setSuppliers(prev => prev.filter(s => s.id !== id));
    setSaveMessage('✅ Supplier deleted.');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const filtered = suppliers.filter(s =>
    filterStatus === 'all' || s.status === filterStatus
  );

  return (
    <section className="dashboard-container">
      <button type="button" className="mobile-menu-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>☰</button>
      <Sidebar isMobileMenuOpen={isMobileMenuOpen} onMenuClose={() => setIsMobileMenuOpen(false)} />
      {isMobileMenuOpen && <div className="overlay" onClick={() => setIsMobileMenuOpen(false)} />}

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-box modal-box--wide">
            <div className="modal-green-header">
              <div className="modal-green-header-left">
                <div className="modal-icon-circle">{editingSupplier ? '✏️' : '➕'}</div>
                <div>
                  <h3 className="modal-green-title">{editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}</h3>
                  <p className="modal-green-subtitle">Fill in supplier details below</p>
                </div>
              </div>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>

                <div className="modal-field">
                  <label className="modal-label">Supplier Name</label>
                  <input
                    type="text"
                    className="suppliers-input"
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    required
                    placeholder="e.g., MedSource Philippines"
                  />
                </div>

                <div className="modal-grid-2">
                  <div>
                    <label className="modal-label">Email / Contact</label>
                    <input
                      type="email"
                      className="suppliers-input"
                      value={form.contact}
                      onChange={e => setForm(p => ({ ...p, contact: e.target.value }))}
                      required
                      placeholder="info@supplier.ph"
                    />
                  </div>
                  <div>
                    <label className="modal-label">Phone</label>
                    <input
                      type="text"
                      className="suppliers-input"
                      value={form.phone}
                      onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                      placeholder="+63 2 8234 5678"
                    />
                  </div>
                </div>

                <div className="modal-field">
                  <label className="modal-label">Address</label>
                  <input
                    type="text"
                    className="suppliers-input"
                    value={form.address}
                    onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                    placeholder="Full address"
                  />
                </div>

                <div className="modal-grid-2">
                  <div>
                    <label className="modal-label">Vaccines Supplied (comma-separated)</label>
                    <input
                      type="text"
                      className="suppliers-input"
                      value={form.vaccines}
                      onChange={e => setForm(p => ({ ...p, vaccines: e.target.value }))}
                      placeholder="Anti-Rabies, Booster"
                    />
                  </div>
                  <div>
                    <label className="modal-label">Lead Time (days)</label>
                    <input
                      type="number"
                      min="1"
                      className="suppliers-input"
                      value={form.leadTimeDays}
                      onChange={e => setForm(p => ({ ...p, leadTimeDays: e.target.value }))}
                      placeholder="7"
                    />
                  </div>
                </div>

                <div className="modal-grid-2 modal-grid-2--mb">
                  <div>
                    <label className="modal-label">Status</label>
                    <select
                      className="suppliers-input suppliers-select"
                      value={form.status}
                      onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                  <div>
                    <label className="modal-label">Notes</label>
                    <input
                      type="text"
                      className="suppliers-input"
                      value={form.notes}
                      onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                      placeholder="Optional notes"
                    />
                  </div>
                </div>

                <div className="modal-actions">
                  <button type="submit" className="modal-btn-save">
                    {editingSupplier ? '💾 Update' : '➕ Add Supplier'}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="modal-btn-cancel">
                    Cancel
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      )}

      <section className="main-wrapper">
        <TopBar />
        <main className="main-content">

          {/* Page Header */}
          <div className="suppliers-header">
            <div>
              <h1 className="suppliers-heading">🏭 Suppliers</h1>
              <p className="suppliers-subheading">Manage vaccine suppliers and procurement contacts</p>
            </div>
            <button onClick={openAdd} className="suppliers-add-btn">
              ➕ Add Supplier
            </button>
          </div>

          {saveMessage && <div className="alert alert-success">{saveMessage}</div>}

          {/* Filter Buttons */}
          <div className="suppliers-filter-bar">
            {['all', 'Active', 'Inactive'].map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`suppliers-filter-btn ${filterStatus === s ? 'suppliers-filter-btn--active' : ''}`}
              >
                {s === 'all' ? 'All' : s}
              </button>
            ))}
          </div>

          {/* Suppliers Table */}
          <div className="suppliers-table-card">
            {filtered.length === 0 ? (
              <div className="suppliers-empty">
                <div className="suppliers-empty-icon">🏭</div>
                No suppliers found.
              </div>
            ) : (
              <div className="suppliers-table-scroll">
                <table className="suppliers-table">
                  <thead>
                    <tr>
                      {['Supplier Name','Contact','Phone','Address','Vaccines Supplied','Lead Time','Status','Notes','Actions'].map(col => (
                        <th key={col}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((s) => (
                      <tr key={s.id}>
                        <td className="suppliers-td-name">{s.name}</td>
                        <td className="suppliers-td-contact">
                          <a href={`mailto:${s.contact}`}>{s.contact}</a>
                        </td>
                        <td>{s.phone}</td>
                        <td className="suppliers-td-address">{s.address}</td>
                        <td>
                          <div className="suppliers-vaccine-tags">
                            {s.vaccines.map(v => (
                              <span key={v} className="suppliers-vaccine-tag">{v}</span>
                            ))}
                          </div>
                        </td>
                        <td className="suppliers-lead-time">{s.leadTimeDays}d</td>
                        <td>
                          <span className={`suppliers-status-badge ${s.status === 'Active' ? 'suppliers-status-badge--active' : 'suppliers-status-badge--inactive'}`}>
                            {s.status}
                          </span>
                        </td>
                        <td className="suppliers-td-notes">{s.notes || '—'}</td>
                        <td>
                          <div className="suppliers-row-actions">
                            <button onClick={() => openEdit(s)} className="suppliers-btn-edit">✏️ Edit</button>
                            <button onClick={() => handleDelete(s.id)} className="suppliers-btn-delete">🗑️ Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </main>
      </section>
    </section>
  );
};

export default Suppliers;
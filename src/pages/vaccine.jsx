// vaccine.jsx

import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import VaccineCard from '../components/VaccineCard';
import {
  vaccineData,
  PEAK_MONTHS,
  getMonthlyRequirement,
  getOrderUrgency,
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

const MONTH_START_DAYS = {
  January:0,February:3,March:3,April:6,May:1,June:4,
  July:6,August:2,September:5,October:0,November:3,December:5,
};

// ─── Mini Calendar ────────────────────────────────────────────────────────────
const MiniCalendar = ({ month, selectedDay, onSelectDay }) => {
  const totalDays = DAYS_IN_MONTH[month] || 30;
  const startDay  = MONTH_START_DAYS[month] || 0;
  const dayNames  = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const cells     = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);

  return (
    <div style={{ position:'absolute', top:'110%', left:0, zIndex:999, background:'white', border:'1px solid #e0e0e0', borderRadius:'12px', boxShadow:'0 8px 24px rgba(0,0,0,0.15)', padding:'16px', minWidth:'280px' }}>
      <p style={{ margin:'0 0 12px 0', fontWeight:'700', color:'#333', fontSize:'14px', textAlign:'center' }}>📅 {month}</p>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:'2px', textAlign:'center' }}>
        {dayNames.map(d => <div key={d} style={{ fontSize:'11px', fontWeight:'700', color:'#999', padding:'4px 0' }}>{d}</div>)}
        {cells.map((d, i) => (
          <div key={i} onClick={() => d && onSelectDay(d)}
            style={{ padding:'6px 2px', fontSize:'12px', borderRadius:'6px', cursor: d ? 'pointer' : 'default', background: d === selectedDay ? '#26a69a' : 'transparent', color: d === selectedDay ? 'white' : d ? '#333' : 'transparent', fontWeight: d === selectedDay ? '700' : '400', transition:'background 0.15s' }}
            onMouseEnter={e => { if (d && d !== selectedDay) e.target.style.background = '#e0f7f4'; }}
            onMouseLeave={e => { if (d !== selectedDay) e.target.style.background = 'transparent'; }}>
            {d || ''}
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const VaccineManagement = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAddForm,      setShowAddForm]       = useState(false);
  const [editingVaccine,   setEditingVaccine]    = useState(null);
  const [filterStatus,     setFilterStatus]      = useState('all');
  const [searchQuery,      setSearchQuery]       = useState('');
  const [saveMessage,      setSaveMessage]       = useState('');

  // ── Period controls (Monthly / Weekly / Daily) ─────────────────
  const [viewMode,      setViewMode]      = useState('monthly');
  const [selectedMonth, setSelectedMonth] = useState('January');
  const [selectedWeek,  setSelectedWeek]  = useState(0);
  const [selectedDay,   setSelectedDay]   = useState(1);

  const [monthDropOpen, setMonthDropOpen] = useState(false);
  const [weekDropOpen,  setWeekDropOpen]  = useState(false);
  const [calOpen,       setCalOpen]       = useState(false);

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

  const getVaccineMonthlyUrgency = (vaccineName) => {
    const required  = getMonthlyRequirement(vaccineName, selectedMonth);
    const remaining = Math.max(0, required);
    return getOrderUrgency(remaining, required);
  };

  const isPeak = PEAK_MONTHS.includes(selectedMonth);

  const filteredVaccines = vaccines.filter(v => {
    const matchesStatus = filterStatus === 'all' || v.status === filterStatus;
    const matchesSearch =
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.batchNumber || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const closeForm = () => {
    setShowAddForm(false);
    setEditingVaccine(null);
    setFormData({ name: '', available: '', minStock: '', batchNumber: '', expiryDate: '' });
  };

  // ── shared button style ────────────────────────────────────────
  const periodBtnStyle = (active) => ({
    display:'inline-flex', alignItems:'center', gap:'5px',
    padding:'7px 14px', borderRadius:'8px', fontSize:'13px', fontWeight:'600',
    cursor:'pointer', border:'1.5px solid', transition:'all 0.18s',
    background: active ? '#26a69a' : 'white',
    color: active ? 'white' : '#555',
    borderColor: active ? '#26a69a' : '#ddd',
    boxShadow: active ? '0 2px 8px rgba(38,166,154,0.3)' : '0 1px 3px rgba(0,0,0,0.08)',
  });

  const dropItemStyle = (active, isPeakItem = false) => ({
    padding:'8px 16px', cursor:'pointer', fontSize:'13px',
    fontWeight: active ? '700' : '500',
    background: active ? '#e0f7f4' : 'white',
    color: isPeakItem ? '#e53935' : active ? '#26a69a' : '#333',
    display:'flex', alignItems:'center', justifyContent:'space-between', gap:'8px',
    transition:'background 0.12s',
  });

  return (
    <section className="dashboard-container">

      <button type="button" className="mobile-menu-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>☰</button>
      <Sidebar isMobileMenuOpen={isMobileMenuOpen} onMenuClose={() => setIsMobileMenuOpen(false)} />
      {isMobileMenuOpen && <div className="overlay" onClick={() => setIsMobileMenuOpen(false)} />}

      {/* ── Add / Edit Modal ── */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal-box modal-box--wide">
            <div className="modal-green-header">
              <div className="modal-green-header-left">
                <div className="modal-icon-circle">{editingVaccine ? '✏️' : '➕'}</div>
                <div>
                  <h3 className="modal-green-title">{editingVaccine ? 'Edit Vaccine' : 'Add New Vaccine'}</h3>
                  <p className="modal-green-subtitle">{editingVaccine ? 'Update vaccine details below' : 'Fill in the vaccine details below'}</p>
                </div>
              </div>
            </div>
            <div className="modal-body">
              <form onSubmit={editingVaccine ? handleUpdateVaccine : handleAddVaccine}>
                <div className="modal-field">
                  <label className="modal-label">Vaccine Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} required placeholder="e.g., Anti-Rabies" className="modal-input" />
                </div>
                <div className="modal-grid-2">
                  <div>
                    <label className="modal-label">Available Doses</label>
                    <input type="number" name="available" value={formData.available} onChange={handleInputChange} required min="0" placeholder="320" className="modal-input" />
                  </div>
                  <div>
                    <label className="modal-label">Minimum Stock</label>
                    <input type="number" name="minStock" value={formData.minStock} onChange={handleInputChange} required min="0" placeholder="300" className="modal-input" />
                  </div>
                </div>
                <div className="modal-grid-2 modal-grid-2--mb">
                  <div>
                    <label className="modal-label">Batch Number</label>
                    <input type="text" name="batchNumber" value={formData.batchNumber} onChange={handleInputChange} required placeholder="AR-2024-001" className="modal-input" />
                  </div>
                  <div>
                    <label className="modal-label">Expiry Date</label>
                    <input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleInputChange} required className="modal-input" />
                  </div>
                </div>
                <div className="modal-actions">
                  <button type="submit" className="modal-btn-save">{editingVaccine ? '💾 Update Vaccine' : '➕ Add Vaccine'}</button>
                  <button type="button" onClick={closeForm} className="modal-btn-cancel">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <main className="main-content">

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

            {/* ── MONTHLY toggle + dropdown ── */}
            <div style={{ position:'relative' }}>
              <button type="button" style={periodBtnStyle(viewMode === 'monthly')}
                onClick={() => { setViewMode('monthly'); setMonthDropOpen(v => !v); setWeekDropOpen(false); setCalOpen(false); }}>
                📅 Monthly {viewMode === 'monthly' ? `(${selectedMonth.slice(0,3)})` : ''}{isPeak && viewMode === 'monthly' ? ' 🔥' : ''} ▾
              </button>
              {monthDropOpen && (
                <div style={{ position:'absolute', top:'110%', right:0, zIndex:999, background:'white', border:'1px solid #e0e0e0', borderRadius:'10px', boxShadow:'0 8px 24px rgba(0,0,0,0.15)', minWidth:'180px', padding:'6px 0', overflow:'hidden' }}>
                  {MONTHS.map(m => {
                    const isPeakM = PEAK_MONTHS.includes(m);
                    return (
                      <div key={m} style={dropItemStyle(m === selectedMonth, isPeakM)}
                        onMouseEnter={e => e.currentTarget.style.background = isPeakM ? '#fff3e0' : '#f5f5f5'}
                        onMouseLeave={e => e.currentTarget.style.background = m === selectedMonth ? '#e0f7f4' : 'white'}
                        onClick={() => { setSelectedMonth(m); setMonthDropOpen(false); setSelectedWeek(0); setSelectedDay(1); }}>
                        <span>{m}</span>
                        {isPeakM && <span style={{ fontSize:'10px', background:'#ffebee', color:'#e53935', padding:'2px 6px', borderRadius:'10px', fontWeight:'700' }}>🔥 PEAK</span>}
                        {m === selectedMonth && !isPeakM && <span style={{ color:'#26a69a', fontSize:'12px' }}>✓</span>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── WEEKLY toggle ── */}
            <div style={{ position:'relative' }}>
              <button type="button" style={periodBtnStyle(viewMode === 'weekly')}
                onClick={() => { setViewMode('weekly'); setWeekDropOpen(v => !v); setMonthDropOpen(false); setCalOpen(false); }}>
                📆 Weekly {viewMode === 'weekly' ? `(Wk ${selectedWeek + 1})` : ''} ▾
              </button>
              {weekDropOpen && (
                <div style={{ position:'absolute', top:'110%', right:0, zIndex:999, background:'white', border:'1px solid #e0e0e0', borderRadius:'10px', boxShadow:'0 8px 24px rgba(0,0,0,0.15)', minWidth:'160px', padding:'6px 0', overflow:'hidden' }}>
                  {[0, 1, 2, 3].map(wi => (
                    <div key={wi} style={dropItemStyle(selectedWeek === wi)}
                      onMouseEnter={e => e.currentTarget.style.background = selectedWeek === wi ? '#e0f7f4' : '#f5f5f5'}
                      onMouseLeave={e => e.currentTarget.style.background = selectedWeek === wi ? '#e0f7f4' : 'white'}
                      onClick={() => { setSelectedWeek(wi); setWeekDropOpen(false); }}>
                      Week {wi + 1}
                      {selectedWeek === wi && <span style={{ color:'#26a69a', fontSize:'12px' }}>✓</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── DAILY toggle + calendar ── */}
            <div style={{ position:'relative' }}>
              <button type="button" style={periodBtnStyle(viewMode === 'daily')}
                onClick={() => { setViewMode('daily'); setCalOpen(v => !v); setMonthDropOpen(false); setWeekDropOpen(false); }}>
                🗓️ Daily {viewMode === 'daily' ? `(${selectedMonth.slice(0,3)} ${selectedDay})` : ''} ▾
              </button>
              {calOpen && (
                <div style={{ position:'absolute', top:'110%', right:0, zIndex:999 }}>
                  <MiniCalendar month={selectedMonth} selectedDay={selectedDay}
                    onSelectDay={(d) => { setSelectedDay(d); setCalOpen(false); }} />
                </div>
              )}
            </div>

          </div>
        </div>

        {saveMessage && <div className="alert alert-success">{saveMessage}</div>}

        {isPeak && (
          <div className="peak-notice">
            🔥 <strong>Peak Season ({selectedMonth}):</strong> Monthly dose requirements are 1.5× higher. Cards below show adjusted urgency.
          </div>
        )}

        {/* ── Period context label ── */}
        <div style={{ marginBottom:'14px', fontSize:'13px', color:'#888', fontWeight:'500' }}>
          Showing urgency for:{' '}
          <strong style={{ color:'#26a69a' }}>
            {viewMode === 'daily'
              ? `${selectedMonth} — Day ${selectedDay}`
              : viewMode === 'weekly'
              ? `${selectedMonth} — Week ${selectedWeek + 1}`
              : selectedMonth}
          </strong>
        </div>

        {/* ── Filters ── */}
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

        {/* ── Vaccine Cards Grid ── */}
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
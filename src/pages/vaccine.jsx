// src/pages/vaccine.jsx

import React, { useState, useRef, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import { PEAK_MONTHS } from '../data/dashboardData';
import '../styles/dashboard.css';
import '../styles/vaccine.css';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const DAYS_IN_MONTH = {
  January:31, February:28, March:31, April:30, May:31, June:30,
  July:31, August:31, September:30, October:31, November:30, December:31,
};
const MONTH_START_DAYS = {
  January:0, February:3, March:3, April:6, May:1, June:4,
  July:6, August:2, September:5, October:0, November:3, December:5,
};

const SUPPLIERS_LIST = [
  'MedSource Philippines',
  'VaccinePro Asia',
  'GlobalHealth Supply Co.',
  'PhilMed Distribution',
  'BioLogic Partners',
];

const PRICE_PER_DOSE = 1100;

const calcStatus = (available) => {
  if (available === 0)   return 'Out Stock';
  if (available < 100)  return 'Low Stock';
  return 'In Stock';
};

const INITIAL_BATCH_DATA = {
  'Anti-Rabies': [
    { id: 1, batchNumber: 'AR-2025-005', expiryDate: '2029-06-15', available: 320, used: 60, datePurchased: '2025-07-27', supplier: 'MedSource Philippines', mlRecommended: 200 },
  ],
  'Booster': [
    { id: 1, batchNumber: 'BST-2025-001', expiryDate: '2029-06-15', available: 0, used: 60, datePurchased: '2025-07-27', supplier: 'VaccinePro Asia', mlRecommended: 500 },
  ],
};

// ── MiniCalendar ──────────────────────────────────────────────────────────────
const MiniCalendar = ({ month, selectedDay, onSelectDay }) => {
  const totalDays = DAYS_IN_MONTH[month] || 30;
  const startDay  = MONTH_START_DAYS[month] || 0;
  const dayNames  = ['Su','Mo','Tu','We','Th','Fr','Sa'];
  const cells     = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);
  return (
    <div style={{ position:'absolute', top:'110%', left:0, zIndex:1000, background:'white', border:'1px solid #e0e0e0', borderRadius:'12px', boxShadow:'0 8px 24px rgba(0,0,0,0.15)', padding:'16px', minWidth:'280px' }}>
      <p style={{ margin:'0 0 12px 0', fontWeight:'700', color:'#333', fontSize:'14px', textAlign:'center' }}>📅 {month}</p>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:'2px', textAlign:'center' }}>
        {dayNames.map(d => (
          <div key={d} style={{ fontSize:'11px', fontWeight:'700', color:'#999', padding:'4px 0' }}>{d}</div>
        ))}
        {cells.map((d, i) => (
          <div key={i} onClick={() => d && onSelectDay(d)}
            style={{ padding:'6px 2px', fontSize:'12px', borderRadius:'6px', cursor:d?'pointer':'default', background:d===selectedDay?'#26a69a':'transparent', color:d===selectedDay?'white':d?'#333':'transparent', transition:'background 0.15s' }}
            onMouseEnter={e => { if (d && d !== selectedDay) e.target.style.background='#e0f7f4'; }}
            onMouseLeave={e => { if (d !== selectedDay) e.target.style.background='transparent'; }}>
            {d || ''}
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Expiry color helper ───────────────────────────────────────────────────────
const getExpiryColor = (expiryDate) => {
  if (!expiryDate) return '#999';
  const daysLeft = Math.ceil((new Date(expiryDate) - new Date()) / (1000*60*60*24));
  if (daysLeft < 0)   return '#b71c1c';
  if (daysLeft <= 30) return '#c62828';
  if (daysLeft <= 90) return '#f57f17';
  return '#2e7d32';
};

// ── Vaccine Table ─────────────────────────────────────────────────────────────
const VaccineTable = ({ vaccineName, batches, onAddBatch, onEditBatch, onDeleteBatch, mlRecommended }) => {
  const [showAddBatch, setShowAddBatch] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);
  const [batchForm, setBatchForm] = useState({
    batchNumber:'', expiryDate:'', available:'', used:'', datePurchased:'', supplier:'',
  });

  const totalAvailable = batches.reduce((s, b) => s + (b.available || 0), 0);
  const overallStatus  = calcStatus(totalAvailable);

  const statusStyle = (s) => ({
    padding:'3px 10px', borderRadius:'20px', fontSize:'12px', fontWeight:'700',
    background: s==='In Stock' ? '#e8f5e9' : s==='Low Stock' ? '#fff8e1' : '#ffebee',
    color:      s==='In Stock' ? '#2e7d32' : s==='Low Stock' ? '#f57f17' : '#c62828',
    border:     `1.5px solid ${s==='In Stock' ? '#a5d6a7' : s==='Low Stock' ? '#ffe082' : '#ef9a9a'}`,
    whiteSpace: 'nowrap',
  });

  const openAddBatch = () => {
    setEditingBatch(null);
    setBatchForm({ batchNumber:'', expiryDate:'', available:'', used:'', datePurchased:'', supplier:'' });
    setShowAddBatch(true);
  };

  const openEditBatch = (batch) => {
    setEditingBatch(batch);
    setBatchForm({
      batchNumber: batch.batchNumber, expiryDate: batch.expiryDate,
      available: batch.available, used: batch.used,
      datePurchased: batch.datePurchased, supplier: batch.supplier || '',
    });
    setShowAddBatch(true);
  };

  const handleBatchSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...batchForm,
      available: parseInt(batchForm.available) || 0,
      used: parseInt(batchForm.used) || 0,
    };
    if (editingBatch) {
      onEditBatch(vaccineName, editingBatch.id, data);
    } else {
      onAddBatch(vaccineName, { ...data, id: Date.now(), mlRecommended });
    }
    setShowAddBatch(false);
    setEditingBatch(null);
  };

  return (
    <div style={{ background:'white', borderRadius:'12px', marginBottom:'24px', overflow:'hidden', boxShadow:'0 2px 4px rgba(0,0,0,0.06),0 6px 16px rgba(0,0,0,0.10)' }}>

      <div style={{ background:'#26a69a', padding:'12px 20px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <h3 style={{ margin:0, color:'white', fontSize:'16px', fontWeight:'700', letterSpacing:'0.5px', textTransform:'uppercase' }}>
          {vaccineName}
        </h3>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <span style={{ fontSize:'12px', color:'rgba(255,255,255,0.85)' }}>
            {batches.length} batch{batches.length !== 1 ? 'es' : ''} · {totalAvailable.toLocaleString()} doses total
          </span>
          <span style={statusStyle(overallStatus)}>{overallStatus}</span>
        </div>
      </div>

      <div style={{ overflowX:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'13px' }}>
          <thead>
            <tr style={{ background:'#f8f9fa', borderBottom:'2px solid #e0e0e0' }}>
              {['Batch Number','Expiry Date','Available Doses','Used','Date Purchased','Supplier','Status','ML Recommended Order','Actions'].map(col => (
                <th key={col} style={{ padding:'10px 14px', textAlign:'left', fontWeight:'700', fontSize:'11px', color:'#555', textTransform:'uppercase', letterSpacing:'0.4px', whiteSpace:'nowrap' }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {batches.length === 0 && (
              <tr>
                <td colSpan={9} style={{ padding:'24px', textAlign:'center', color:'#aaa', fontSize:'13px', fontStyle:'italic' }}>
                  No batches yet. Click "+ Add new batch" below.
                </td>
              </tr>
            )}
            {batches.map((batch, i) => {
              const expiryColor = getExpiryColor(batch.expiryDate);
              const bStatus     = calcStatus(batch.available);
              return (
                <tr key={batch.id}
                  style={{ borderBottom:'1px solid #f0f0f0', background: i%2===0 ? '#fafafa' : 'white', transition:'background 0.12s' }}
                  onMouseEnter={e => e.currentTarget.style.background='#f0fffe'}
                  onMouseLeave={e => e.currentTarget.style.background=i%2===0?'#fafafa':'white'}>
                  <td style={{ padding:'12px 14px', fontWeight:'700', color:'#333', fontFamily:'monospace', fontSize:'13px' }}>{batch.batchNumber}</td>
                  <td style={{ padding:'12px 14px', color: expiryColor, fontWeight:'600', fontSize:'12px' }}>{batch.expiryDate || '—'}</td>
                  <td style={{ padding:'12px 14px', fontWeight:'700', color: batch.available===0?'#c62828':batch.available<100?'#f57f17':'#26a69a' }}>
                    {batch.available.toLocaleString()}
                  </td>
                  <td style={{ padding:'12px 14px', color:'#5c6bc0', fontWeight:'600' }}>{batch.used || 0}</td>
                  <td style={{ padding:'12px 14px', color:'#666' }}>{batch.datePurchased || '—'}</td>
                  <td style={{ padding:'12px 14px', color:'#555' }}>{batch.supplier || '—'}</td>
                  <td style={{ padding:'12px 14px' }}><span style={statusStyle(bStatus)}>{bStatus}</span></td>
                  <td style={{ padding:'12px 14px', fontWeight:'700', color:'#5c6bc0' }}>
                    {(batch.mlRecommended || mlRecommended).toLocaleString()} doses
                  </td>
                  <td style={{ padding:'12px 14px' }}>
                    <div style={{ display:'flex', gap:'6px' }}>
                      <button onClick={() => openEditBatch(batch)}
                        style={{ padding:'5px 10px', borderRadius:'6px', border:'1.5px solid #26a69a', background:'white', color:'#26a69a', fontSize:'12px', fontWeight:'600', cursor:'pointer', transition:'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background='#26a69a'; e.currentTarget.style.color='white'; }}
                        onMouseLeave={e => { e.currentTarget.style.background='white'; e.currentTarget.style.color='#26a69a'; }}>
                        ✏️ Edit
                      </button>
                      <button onClick={() => onDeleteBatch(vaccineName, batch.id)}
                        style={{ padding:'5px 10px', borderRadius:'6px', border:'1.5px solid #e53935', background:'white', color:'#e53935', fontSize:'12px', fontWeight:'600', cursor:'pointer', transition:'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background='#e53935'; e.currentTarget.style.color='white'; }}
                        onMouseLeave={e => { e.currentTarget.style.background='white'; e.currentTarget.style.color='#e53935'; }}>
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={9} style={{ padding:'12px 14px', borderTop:'1px solid #e0e0e0', textAlign:'center' }}>
                <button onClick={openAddBatch}
                  style={{ background:'none', border:'none', color:'#26a69a', fontSize:'13px', fontWeight:'700', cursor:'pointer', display:'inline-flex', alignItems:'center', justifyContent:'center', gap:'6px', padding:'6px 10px', borderRadius:'6px', transition:'all 0.15s ease' }}
                  onMouseEnter={e => e.currentTarget.style.background='#e0f7f4'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                  ＋ Add new batch
                </button>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {showAddBatch && (
        <div style={{ padding:'20px 24px', borderTop:'2px solid #26a69a', background:'#f8fffe' }}>
          <h4 style={{ margin:'0 0 16px 0', fontSize:'14px', fontWeight:'700', color:'#26a69a' }}>
            {editingBatch ? `✏️ Edit Batch — ${editingBatch.batchNumber}` : `➕ Add New Batch to ${vaccineName}`}
          </h4>
          <form onSubmit={handleBatchSubmit}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:'14px', marginBottom:'16px' }}>
              {[
                { label:'Batch Number',    name:'batchNumber',   type:'text',   placeholder:'e.g. AR-2025-006' },
                { label:'Expiry Date',     name:'expiryDate',    type:'date',   placeholder:'' },
                { label:'Available Doses', name:'available',     type:'number', placeholder:'320' },
                { label:'Used Doses',      name:'used',          type:'number', placeholder:'0' },
                { label:'Date Purchased',  name:'datePurchased', type:'date',   placeholder:'' },
              ].map(f => (
                <div key={f.name}>
                  <label style={{ fontSize:'12px', fontWeight:'600', color:'#555', display:'block', marginBottom:'5px' }}>{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder}
                    value={batchForm[f.name]}
                    onChange={e => setBatchForm(p => ({ ...p, [f.name]: e.target.value }))}
                    required={f.name !== 'used'}
                    style={{ width:'100%', padding:'8px 10px', borderRadius:'8px', border:'1.5px solid #e0e0e0', fontSize:'13px', boxSizing:'border-box', outline:'none' }}
                    onFocus={e => e.target.style.borderColor='#26a69a'}
                    onBlur={e => e.target.style.borderColor='#e0e0e0'} />
                </div>
              ))}
              <div>
                <label style={{ fontSize:'12px', fontWeight:'600', color:'#555', display:'block', marginBottom:'5px' }}>Supplier</label>
                <select value={batchForm.supplier} onChange={e => setBatchForm(p => ({ ...p, supplier: e.target.value }))}
                  style={{ width:'100%', padding:'8px 10px', borderRadius:'8px', border:'1.5px solid #e0e0e0', fontSize:'13px', boxSizing:'border-box', background:'white' }}>
                  <option value="">— Select Supplier —</option>
                  {SUPPLIERS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display:'flex', gap:'10px' }}>
              <button type="submit" style={{ padding:'9px 20px', borderRadius:'8px', border:'none', background:'#26a69a', color:'white', fontWeight:'700', fontSize:'13px', cursor:'pointer' }}>
                {editingBatch ? '💾 Update Batch' : '➕ Add Batch'}
              </button>
              <button type="button" onClick={() => { setShowAddBatch(false); setEditingBatch(null); }}
                style={{ padding:'9px 20px', borderRadius:'8px', border:'1.5px solid #e0e0e0', background:'white', color:'#555', fontWeight:'600', fontSize:'13px', cursor:'pointer' }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

// ── Order Vaccine Form ────────────────────────────────────────────────────────
const OrderVaccineForm = ({ vaccines, onClose, onOrderSubmit }) => {
  const [orderData, setOrderData] = useState({ vaccine:'', supplier:'', amount:'', pricePerPiece: PRICE_PER_DOSE });
  const total = (parseInt(orderData.amount) || 0) * orderData.pricePerPiece;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!orderData.vaccine || !orderData.supplier || !orderData.amount) return;
    onOrderSubmit({
      ...orderData,
      amount: parseInt(orderData.amount),
      total,
      orderedAt: new Date().toISOString(),
      status: 'Pending',
      id: Date.now(),
    });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box modal-box--wide" style={{ maxWidth:'460px' }}>
        <div className="modal-green-header">
          <div className="modal-green-header-left">
            <div className="modal-icon-circle">💰</div>
            <div>
              <h3 className="modal-green-title">Order Vaccine</h3>
              <p className="modal-green-subtitle">Place a vaccine restock order</p>
            </div>
          </div>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="modal-field">
              <label className="modal-label">Vaccine</label>
              <select className="modal-input" value={orderData.vaccine}
                onChange={e => setOrderData(p => ({ ...p, vaccine: e.target.value }))} required style={{ background:'white' }}>
                <option value="">— Select Vaccine —</option>
                {vaccines.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div className="modal-field">
              <label className="modal-label">Supplier</label>
              <select className="modal-input" value={orderData.supplier}
                onChange={e => setOrderData(p => ({ ...p, supplier: e.target.value }))} required style={{ background:'white' }}>
                <option value="">— Select Supplier —</option>
                {SUPPLIERS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="modal-field">
              <label className="modal-label">Amount (doses)</label>
              <input className="modal-input" type="number" min="1" placeholder="e.g. 200"
                value={orderData.amount} onChange={e => setOrderData(p => ({ ...p, amount: e.target.value }))} required />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px', marginBottom:'20px' }}>
              <div>
                <label className="modal-label">Price per piece</label>
                <div style={{ padding:'10px 12px', borderRadius:'8px', border:'1.5px solid #e0e0e0', fontSize:'13px', background:'#f5f5f5', color:'#555', fontWeight:'600' }}>
                  ₱{orderData.pricePerPiece.toLocaleString()}
                </div>
              </div>
              <div>
                <label className="modal-label">TOTAL</label>
                <div style={{ padding:'10px 12px', borderRadius:'8px', border:'1.5px solid #26a69a', fontSize:'16px', background:'#e0f7f4', color:'#26a69a', fontWeight:'800' }}>
                  ₱{total.toLocaleString()}
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button type="submit" className="modal-btn-save">🛒 ORDER</button>
              <button type="button" className="modal-btn-cancel" onClick={onClose}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// ── FAB Options Picker ────────────────────────────────────────────────────────
const FabOptions = ({ onNewVaccine, onOrderVaccine, onClose }) => (
  <>
    <div className="fab-options" onClick={e => e.stopPropagation()}>
      {[
        { label:'New Vaccine',   icon:'💉', onClick: onNewVaccine   },
        { label:'Order Vaccine', icon:'📦', onClick: onOrderVaccine },
      ].map(opt => (
        <button key={opt.label} className="fab-option-card"
          onClick={() => { opt.onClick(); onClose(); }}>
          <span className="fab-option-icon">{opt.icon}</span>
          <span className="fab-option-label">{opt.label}</span>
        </button>
      ))}
    </div>
    <div className="fab-backdrop" onClick={onClose} />
  </>
);

// ── Main Page ─────────────────────────────────────────────────────────────────
const VaccineManagement = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [saveMessage,      setSaveMessage]      = useState('');
  const [filterStatus,     setFilterStatus]     = useState('all');

  const [viewMode,      setViewMode]      = useState('monthly');
  const [selectedMonth, setSelectedMonth] = useState('January');
  const [selectedWeek,  setSelectedWeek]  = useState(0);
  const [selectedDay,   setSelectedDay]   = useState(1);
  const [monthDropOpen, setMonthDropOpen] = useState(false);
  const [weekDropOpen,  setWeekDropOpen]  = useState(false);
  const [calOpen,       setCalOpen]       = useState(false);

  const [vaccineNames,     setVaccineNames]     = useState(['Anti-Rabies', 'Booster']);
  const [batchData,        setBatchData]        = useState(INITIAL_BATCH_DATA);
  const [selectedVaccine,  setSelectedVaccine]  = useState('Anti-Rabies');
  const [vaccineDropOpen,  setVaccineDropOpen]  = useState(false);
  const vaccineDropRef = useRef(null);

  const [fabOpen,          setFabOpen]          = useState(false);
  const [showNewVaccine,   setShowNewVaccine]   = useState(false);
  const [showOrderVaccine, setShowOrderVaccine] = useState(false);

  const [newVaccineForm, setNewVaccineForm] = useState({
    name:'', batchNumber:'', expiryDate:'', available:'', datePurchased:'', supplier:'',
  });

  const addOrder = (order) => {
    const existing = JSON.parse(localStorage.getItem('vaccineOrders') || '[]');
    localStorage.setItem('vaccineOrders', JSON.stringify([order, ...existing]));
    setSaveMessage('✅ Order placed successfully! View in Vaccine Orders.');
    setTimeout(() => setSaveMessage(''), 4000);
  };

  useEffect(() => {
    const handler = (e) => {
      if (vaccineDropRef.current && !vaccineDropRef.current.contains(e.target))
        setVaccineDropOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isPeak = PEAK_MONTHS.includes(selectedMonth);

  const handleAddBatch = (vaccineName, batch) => {
    setBatchData(prev => ({ ...prev, [vaccineName]: [...(prev[vaccineName] || []), batch] }));
    setSaveMessage('✅ Batch added successfully!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleEditBatch = (vaccineName, batchId, data) => {
    setBatchData(prev => ({
      ...prev,
      [vaccineName]: prev[vaccineName].map(b => b.id === batchId ? { ...b, ...data } : b),
    }));
    setSaveMessage('✅ Batch updated successfully!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleDeleteBatch = (vaccineName, batchId) => {
    if (!window.confirm('Delete this batch?')) return;
    setBatchData(prev => ({ ...prev, [vaccineName]: prev[vaccineName].filter(b => b.id !== batchId) }));
    setSaveMessage('✅ Batch deleted.');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleAddNewVaccine = (e) => {
    e.preventDefault();
    const name = newVaccineForm.name.trim();
    if (!name || vaccineNames.includes(name)) {
      alert(vaccineNames.includes(name) ? 'Vaccine already exists.' : 'Enter a vaccine name.');
      return;
    }
    const firstBatch = {
      id: Date.now(),
      batchNumber:   newVaccineForm.batchNumber,
      expiryDate:    newVaccineForm.expiryDate,
      available:     parseInt(newVaccineForm.available) || 0,
      used:          0,
      datePurchased: newVaccineForm.datePurchased,
      supplier:      newVaccineForm.supplier,
      mlRecommended: 200,
    };
    setVaccineNames(prev => [...prev, name]);
    setBatchData(prev => ({ ...prev, [name]: [firstBatch] }));
    setSelectedVaccine(name);
    setNewVaccineForm({ name:'', batchNumber:'', expiryDate:'', available:'', datePurchased:'', supplier:'' });
    setShowNewVaccine(false);
    setSaveMessage(`✅ ${name} added to the system!`);
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const getVaccineStatus = (name) => {
    const batches = batchData[name] || [];
    const total   = batches.reduce((s, b) => s + (b.available || 0), 0);
    return calcStatus(total);
  };

  const filteredVaccineNames = vaccineNames.filter(name =>
    filterStatus === 'all' ? true : getVaccineStatus(name) === filterStatus
  );

  const displayVaccine = filteredVaccineNames.includes(selectedVaccine)
    ? selectedVaccine
    : (filteredVaccineNames[0] || null);

  const periodBtnStyle = (active) => ({
    display:'inline-flex', alignItems:'center', gap:'5px',
    padding:'7px 14px', borderRadius:'8px', fontSize:'13px', fontWeight:'600',
    cursor:'pointer', border:'1.5px solid', transition:'all 0.18s',
    background:   active ? '#26a69a' : 'white',
    color:        active ? 'white' : '#555',
    borderColor:  active ? '#26a69a' : '#ddd',
    boxShadow:    active ? '0 2px 8px rgba(38,166,154,0.3)' : '0 1px 3px rgba(0,0,0,0.08)',
  });

  const dropItemStyle = (active, isPeakItem = false) => ({
    padding:'8px 16px', cursor:'pointer', fontSize:'13px',
    fontWeight:  active ? '700' : '500',
    background:  active ? '#e0f7f4' : 'white',
    color:       isPeakItem ? '#e53935' : active ? '#26a69a' : '#333',
    display:'flex', alignItems:'center', justifyContent:'space-between', gap:'8px',
    transition:'background 0.12s',
  });

  return (
    <section className="dashboard-container">

      <button type="button" className="mobile-menu-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>☰</button>
      <Sidebar isMobileMenuOpen={isMobileMenuOpen} onMenuClose={() => setIsMobileMenuOpen(false)} />
      {isMobileMenuOpen && <div className="overlay" onClick={() => setIsMobileMenuOpen(false)} />}

      {fabOpen && (
        <FabOptions
          onNewVaccine={() => setShowNewVaccine(true)}
          onOrderVaccine={() => setShowOrderVaccine(true)}
          onClose={() => setFabOpen(false)}
        />
      )}

      {/* New Vaccine Modal */}
      {showNewVaccine && (
        <div className="modal-overlay">
          <div className="modal-box modal-box--wide">
            <div className="modal-green-header">
              <div className="modal-green-header-left">
                <div className="modal-icon-circle">➕</div>
                <div>
                  <h3 className="modal-green-title">Add New Vaccine</h3>
                  <p className="modal-green-subtitle">Fill in the vaccine details below</p>
                </div>
              </div>
            </div>
            <div className="modal-body">
              <form onSubmit={handleAddNewVaccine}>
                <div className="modal-field">
                  <label className="modal-label">Vaccine Name</label>
                  <input className="modal-input" type="text" required placeholder="e.g., Hepatitis B"
                    value={newVaccineForm.name}
                    onChange={e => setNewVaccineForm(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="modal-grid-2">
                  <div>
                    <label className="modal-label">Batch Number</label>
                    <input className="modal-input" type="text" required placeholder="e.g., HB-2025-001"
                      value={newVaccineForm.batchNumber}
                      onChange={e => setNewVaccineForm(p => ({ ...p, batchNumber: e.target.value }))} />
                  </div>
                  <div>
                    <label className="modal-label">Available Doses</label>
                    <input className="modal-input" type="number" min="0" required placeholder="0"
                      value={newVaccineForm.available}
                      onChange={e => setNewVaccineForm(p => ({ ...p, available: e.target.value }))} />
                  </div>
                </div>
                <div className="modal-grid-2">
                  <div>
                    <label className="modal-label">Expiry Date</label>
                    <input className="modal-input" type="date" required
                      value={newVaccineForm.expiryDate}
                      onChange={e => setNewVaccineForm(p => ({ ...p, expiryDate: e.target.value }))} />
                  </div>
                  <div>
                    <label className="modal-label">Date Purchased</label>
                    <input className="modal-input" type="date"
                      value={newVaccineForm.datePurchased}
                      onChange={e => setNewVaccineForm(p => ({ ...p, datePurchased: e.target.value }))} />
                  </div>
                </div>
                <div className="modal-field">
                  <label className="modal-label">Supplier</label>
                  <select className="modal-input" style={{ background:'white' }}
                    value={newVaccineForm.supplier}
                    onChange={e => setNewVaccineForm(p => ({ ...p, supplier: e.target.value }))}>
                    <option value="">— Select Supplier —</option>
                    {SUPPLIERS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="modal-actions">
                  <button type="submit" className="modal-btn-save">➕ Add Vaccine</button>
                  <button type="button" className="modal-btn-cancel" onClick={() => setShowNewVaccine(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Order Vaccine Modal */}
      {showOrderVaccine && (
        <OrderVaccineForm
          vaccines={vaccineNames}
          onClose={() => setShowOrderVaccine(false)}
          onOrderSubmit={addOrder}
        />
      )}

      <section className="main-wrapper">
        <TopBar />
        <main className="main-content">

          <div className="page-header">
            <div>
              <h2 className="dashboard-heading" style={{ marginTop:'-20px' }}>💉 Vaccine Management</h2>
              <p className="dashboard-subheading">Manage vaccine inventory and stock levels</p>
            </div>
          </div>

          {saveMessage && <div className="alert alert-success">{saveMessage}</div>}
          {isPeak && (
            <div className="peak-notice">
              🔥 <strong>Peak Season ({selectedMonth}):</strong> Monthly dose requirements are 1.5× higher.
            </div>
          )}

          {/* Filter buttons */}
          <div className="filters-container">
            <div className="filter-buttons">
              {[
                { key:'all',       label:`All (${vaccineNames.length})` },
                { key:'In Stock',  label:'In Stock'    },
                { key:'Low Stock', label:'Low Stock'   },
                { key:'Out Stock', label:'Out of Stock'},
              ].map(f => (
                <button type="button" key={f.key}
                  className={filterStatus === f.key ? 'filter-btn active' : 'filter-btn'}
                  onClick={() => setFilterStatus(f.key)}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Period + Vaccine selector row */}
          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'8px', flexWrap:'wrap' }}>

            {/* MONTHLY */}
            <div style={{ position:'relative' }}>
              <button type="button" style={periodBtnStyle(viewMode==='monthly')}
                onClick={() => { setViewMode('monthly'); setMonthDropOpen(v=>!v); setWeekDropOpen(false); setCalOpen(false); setVaccineDropOpen(false); }}>
                📅 Monthly {viewMode==='monthly' ? `(${selectedMonth.slice(0,3)})` : ''} ▾
              </button>
              {monthDropOpen && (
                <div style={{ position:'absolute', top:'110%', left:0, zIndex:999, background:'white', border:'1px solid #e0e0e0', borderRadius:'10px', boxShadow:'0 8px 24px rgba(0,0,0,0.15)', minWidth:'180px', padding:'6px 0', overflow:'hidden' }}>
                  {MONTHS.map(m => {
                    const isPeakM = PEAK_MONTHS.includes(m);
                    return (
                      <div key={m} style={dropItemStyle(m===selectedMonth, isPeakM)}
                        onMouseEnter={e => e.currentTarget.style.background=isPeakM?'#fff3e0':'#f5f5f5'}
                        onMouseLeave={e => e.currentTarget.style.background=m===selectedMonth?'#e0f7f4':'white'}
                        onClick={() => { setSelectedMonth(m); setMonthDropOpen(false); setSelectedWeek(0); setSelectedDay(1); }}>
                        <span>{m}</span>
                        {isPeakM && <span style={{ fontSize:'10px', background:'#ffebee', color:'#e53935', padding:'2px 6px', borderRadius:'10px', fontWeight:'700' }}>🔥 PEAK</span>}
                        {m===selectedMonth && !isPeakM && <span style={{ color:'#26a69a', fontSize:'12px' }}>✓</span>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* WEEKLY */}
            <div style={{ position:'relative' }}>
              <button type="button" style={periodBtnStyle(viewMode==='weekly')}
                onClick={() => { setViewMode('weekly'); setWeekDropOpen(v=>!v); setMonthDropOpen(false); setCalOpen(false); setVaccineDropOpen(false); }}>
                📆 Weekly {viewMode==='weekly' ? `(Wk ${selectedWeek+1})` : ''} ▾
              </button>
              {weekDropOpen && (
                <div style={{ position:'absolute', top:'110%', left:0, zIndex:999, background:'white', border:'1px solid #e0e0e0', borderRadius:'10px', boxShadow:'0 8px 24px rgba(0,0,0,0.15)', minWidth:'160px', padding:'6px 0', overflow:'hidden' }}>
                  {[0,1,2,3].map(wi => (
                    <div key={wi} style={dropItemStyle(selectedWeek===wi)}
                      onMouseEnter={e => e.currentTarget.style.background='#f5f5f5'}
                      onMouseLeave={e => e.currentTarget.style.background=selectedWeek===wi?'#e0f7f4':'white'}
                      onClick={() => { setSelectedWeek(wi); setWeekDropOpen(false); }}>
                      Week {wi+1} {selectedWeek===wi && <span style={{ color:'#26a69a' }}>✓</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* DAILY */}
            <div style={{ position:'relative' }}>
              <button type="button" style={periodBtnStyle(viewMode==='daily')}
                onClick={() => { setViewMode('daily'); setCalOpen(v=>!v); setMonthDropOpen(false); setWeekDropOpen(false); setVaccineDropOpen(false); }}>
                🗓️ Daily {viewMode==='daily' ? `(${selectedMonth.slice(0,3)} ${selectedDay})` : ''} ▾
              </button>
              {calOpen && (
                <div style={{ position:'absolute', top:'110%', left:0, zIndex:999 }}>
                  <MiniCalendar month={selectedMonth} selectedDay={selectedDay}
                    onSelectDay={d => { setSelectedDay(d); setCalOpen(false); }} />
                </div>
              )}
            </div>

            <div style={{ width:'1px', height:'32px', background:'#e0e0e0', margin:'0 4px' }} />

            {/* Vaccines dropdown */}
            <div ref={vaccineDropRef} style={{ position:'relative' }}>
              <button type="button"
                style={{ ...periodBtnStyle(true), background:'white', color:'#333', borderColor:'#26a69a' }}
                onClick={() => { setVaccineDropOpen(v=>!v); setMonthDropOpen(false); setWeekDropOpen(false); setCalOpen(false); }}>
                💉 {displayVaccine || 'Available Vaccines'} ▾
              </button>
              {vaccineDropOpen && (
                <div style={{ position:'absolute', top:'110%', left:0, zIndex:999, background:'white', border:'1px solid #e0e0e0', borderRadius:'10px', boxShadow:'0 8px 24px rgba(0,0,0,0.15)', minWidth:'220px', padding:'6px 0', overflow:'hidden' }}>
                  <div style={{ padding:'8px 16px 6px 16px', fontSize:'10px', fontWeight:'700', color:'#aaa', textTransform:'uppercase', letterSpacing:'0.5px' }}>
                    Available Vaccines
                  </div>
                  {filteredVaccineNames.length === 0 && (
                    <div style={{ padding:'10px 16px', fontSize:'13px', color:'#aaa' }}>No vaccines match filter</div>
                  )}
                  {filteredVaccineNames.map(name => {
                    const status = getVaccineStatus(name);
                    const dot = status==='In Stock' ? '#26a69a' : status==='Low Stock' ? '#f57f17' : '#e53935';
                    return (
                      <div key={name} style={dropItemStyle(name===displayVaccine)}
                        onMouseEnter={e => e.currentTarget.style.background='#f5f5f5'}
                        onMouseLeave={e => e.currentTarget.style.background=name===displayVaccine?'#e0f7f4':'white'}
                        onClick={() => { setSelectedVaccine(name); setVaccineDropOpen(false); }}>
                        <span style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                          <span style={{ width:'8px', height:'8px', borderRadius:'50%', background:dot, display:'inline-block' }} />
                          {name}
                        </span>
                        {name===displayVaccine && <span style={{ color:'#26a69a', fontSize:'12px' }}>✓</span>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Period context label */}
          <div style={{ marginBottom:'18px', fontSize:'13px', color:'#888', fontWeight:'500' }}>
            Showing urgency for:{' '}
            <strong style={{ color:'#26a69a' }}>
              {viewMode==='daily'
                ? `${selectedMonth} — Day ${selectedDay}`
                : viewMode==='weekly'
                  ? `${selectedMonth} — Week ${selectedWeek+1}`
                  : selectedMonth}
            </strong>
          </div>

          {/* Vaccine Table */}
          {displayVaccine ? (
            <VaccineTable
              key={displayVaccine}
              vaccineName={displayVaccine}
              batches={batchData[displayVaccine] || []}
              onAddBatch={handleAddBatch}
              onEditBatch={handleEditBatch}
              onDeleteBatch={handleDeleteBatch}
              mlRecommended={displayVaccine === 'Anti-Rabies' ? 200 : displayVaccine === 'Booster' ? 500 : 200}
            />
          ) : (
            <div className="empty-state"><p>📦 No vaccines match the current filter.</p></div>
          )}

        </main>
      </section>

      {/* Sticky FAB */}
      <button
        type="button"
        title="Add"
        className={`fab-btn${fabOpen ? ' fab-btn--open' : ''}`}
        onClick={e => { e.stopPropagation(); setFabOpen(v => !v); }}>
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <rect x="12" y="4" width="4" height="20" rx="2" fill="rgba(255,255,255,0.9)"/>
          <rect x="4" y="12" width="20" height="4" rx="2" fill="rgba(255,255,255,0.9)"/>
        </svg>
      </button>

    </section>
  );
};

export default VaccineManagement;
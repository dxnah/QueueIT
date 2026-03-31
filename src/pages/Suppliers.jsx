// Suppliers.jsx
// Save in: src/pages/Suppliers.jsx


import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import '../styles/dashboard.css';
import { suppliersData } from '../data/dashboardData';


const statusStyle = (status) => ({
  padding:'3px 10px', borderRadius:'20px', fontSize:'12px', fontWeight:'700',
  background: status==='Active' ? '#e8f5e9' : '#ffebee',
  color:      status==='Active' ? '#2e7d32' : '#c62828',
  border:     `1.5px solid ${status==='Active' ? '#a5d6a7' : '#ef9a9a'}`,
});


const Suppliers = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [suppliers, setSuppliers] = useState(suppliersData);
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
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
    const data = { ...form, vaccines: form.vaccines.split(',').map(v=>v.trim()).filter(Boolean), leadTimeDays: parseInt(form.leadTimeDays)||0 };
    if (editingSupplier) {
      setSuppliers(prev => prev.map(s => s.id===editingSupplier.id ? { ...s, ...data } : s));
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
    setSuppliers(prev => prev.filter(s => s.id!==id));
    setSaveMessage('✅ Supplier deleted.');
    setTimeout(() => setSaveMessage(''), 3000);
  };


  const filtered = suppliers.filter(s => {
    const matchStatus = filterStatus==='all' || s.status===filterStatus;
    const matchSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.vaccines.some(v => v.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchStatus && matchSearch;
  });


  const inputStyle = { width:'100%', padding:'9px 12px', borderRadius:'8px', border:'1.5px solid #e0e0e0', fontSize:'13px', boxSizing:'border-box', outline:'none' };


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
                <div className="modal-icon-circle">{editingSupplier?'✏️':'➕'}</div>
                <div>
                  <h3 className="modal-green-title">{editingSupplier?'Edit Supplier':'Add New Supplier'}</h3>
                  <p className="modal-green-subtitle">Fill in supplier details below</p>
                </div>
              </div>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="modal-field">
                  <label className="modal-label">Supplier Name</label>
                  <input type="text" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} required placeholder="e.g., MedSource Philippines" style={inputStyle} onFocus={e=>e.target.style.borderColor='#26a69a'} onBlur={e=>e.target.style.borderColor='#e0e0e0'} />
                </div>
                <div className="modal-grid-2">
                  <div>
                    <label className="modal-label">Email / Contact</label>
                    <input type="email" value={form.contact} onChange={e=>setForm(p=>({...p,contact:e.target.value}))} required placeholder="info@supplier.ph" style={inputStyle} onFocus={e=>e.target.style.borderColor='#26a69a'} onBlur={e=>e.target.style.borderColor='#e0e0e0'} />
                  </div>
                  <div>
                    <label className="modal-label">Phone</label>
                    <input type="text" value={form.phone} onChange={e=>setForm(p=>({...p,phone:e.target.value}))} placeholder="+63 2 8234 5678" style={inputStyle} onFocus={e=>e.target.style.borderColor='#26a69a'} onBlur={e=>e.target.style.borderColor='#e0e0e0'} />
                  </div>
                </div>
                <div className="modal-field">
                  <label className="modal-label">Address</label>
                  <input type="text" value={form.address} onChange={e=>setForm(p=>({...p,address:e.target.value}))} placeholder="Full address" style={inputStyle} onFocus={e=>e.target.style.borderColor='#26a69a'} onBlur={e=>e.target.style.borderColor='#e0e0e0'} />
                </div>
                <div className="modal-grid-2">
                  <div>
                    <label className="modal-label">Vaccines Supplied (comma-separated)</label>
                    <input type="text" value={form.vaccines} onChange={e=>setForm(p=>({...p,vaccines:e.target.value}))} placeholder="Anti-Rabies, Booster" style={inputStyle} onFocus={e=>e.target.style.borderColor='#26a69a'} onBlur={e=>e.target.style.borderColor='#e0e0e0'} />
                  </div>
                  <div>
                    <label className="modal-label">Lead Time (days)</label>
                    <input type="number" min="1" value={form.leadTimeDays} onChange={e=>setForm(p=>({...p,leadTimeDays:e.target.value}))} placeholder="7" style={inputStyle} onFocus={e=>e.target.style.borderColor='#26a69a'} onBlur={e=>e.target.style.borderColor='#e0e0e0'} />
                  </div>
                </div>
                <div className="modal-grid-2 modal-grid-2--mb">
                  <div>
                    <label className="modal-label">Status</label>
                    <select value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value}))} style={{ ...inputStyle, background:'white' }}>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                  <div>
                    <label className="modal-label">Notes</label>
                    <input type="text" value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} placeholder="Optional notes" style={inputStyle} onFocus={e=>e.target.style.borderColor='#26a69a'} onBlur={e=>e.target.style.borderColor='#e0e0e0'} />
                  </div>
                </div>
                <div className="modal-actions">
                  <button type="submit" className="modal-btn-save">{editingSupplier?'💾 Update':'➕ Add Supplier'}</button>
                  <button type="button" onClick={()=>setShowForm(false)} className="modal-btn-cancel">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}


      <section className="main-wrapper">
        <TopBar />
        <main className="main-content">


          <div className="page-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'12px' }}>
            <div>
              <h2 className="dashboard-heading" style={{ marginTop:'-20px' }}>🏭 Suppliers</h2>
              <p className="dashboard-subheading">Manage vaccine suppliers and procurement contacts</p>
            </div>
            <button onClick={openAdd}
              style={{ padding:'10px 20px', borderRadius:'8px', border:'none', background:'#26a69a', color:'white', fontWeight:'700', fontSize:'13px', cursor:'pointer', display:'inline-flex', alignItems:'center', gap:'6px' }}>
              ➕ Add Supplier
            </button>
          </div>


          {saveMessage && <div className="alert alert-success">{saveMessage}</div>}


          {/* Search + filter */}
          <div style={{ display:'flex', gap:'10px', marginBottom:'20px', flexWrap:'wrap', alignItems:'center' }}>
            <input type="text" placeholder="🔍 Search suppliers or vaccines..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}
              style={{ padding:'8px 14px', borderRadius:'8px', border:'1.5px solid #e0e0e0', fontSize:'13px', minWidth:'260px', outline:'none' }}
              onFocus={e=>e.target.style.borderColor='#26a69a'} onBlur={e=>e.target.style.borderColor='#e0e0e0'} />
            {['all','Active','Inactive'].map(s => (
              <button key={s} onClick={()=>setFilterStatus(s)}
                style={{ padding:'7px 16px', borderRadius:'20px', border:`1.5px solid ${filterStatus===s?'#26a69a':'#e0e0e0'}`, background:filterStatus===s?'#26a69a':'white', color:filterStatus===s?'white':'#555', fontSize:'13px', fontWeight:'600', cursor:'pointer', transition:'all 0.15s' }}>
                {s==='all'?'All':s}
              </button>
            ))}
          </div>


          {/* Suppliers table */}
          <div style={{ background:'white', borderRadius:'12px', overflow:'hidden', boxShadow:'0 2px 4px rgba(0,0,0,0.06),0 6px 16px rgba(0,0,0,0.10)', marginBottom:'30px' }}>
            {filtered.length === 0 ? (
              <div style={{ padding:'48px', textAlign:'center', color:'#aaa' }}>
                <div style={{ fontSize:'40px', marginBottom:'12px' }}>🏭</div>
                No suppliers found.
              </div>
            ) : (
              <div style={{ overflowX:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'13px' }}>
                  <thead>
                    <tr style={{ background:'#26a69a', color:'white' }}>
                      {['Supplier Name','Contact','Phone','Address','Vaccines Supplied','Lead Time','Status','Notes','Actions'].map(col => (
                        <th key={col} style={{ padding:'11px 14px', textAlign:'left', fontWeight:'700', fontSize:'11px', textTransform:'uppercase', letterSpacing:'0.4px', whiteSpace:'nowrap' }}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((s, i) => (
                      <tr key={s.id} style={{ borderBottom:'1px solid #f0f0f0', background:i%2===0?'#fafafa':'white', transition:'background 0.12s' }}
                        onMouseEnter={e=>e.currentTarget.style.background='#f0fffe'}
                        onMouseLeave={e=>e.currentTarget.style.background=i%2===0?'#fafafa':'white'}>
                        <td style={{ padding:'12px 14px', fontWeight:'700', color:'#333' }}>{s.name}</td>
                        <td style={{ padding:'12px 14px', color:'#26a69a' }}><a href={`mailto:${s.contact}`} style={{ color:'#26a69a', textDecoration:'none' }}>{s.contact}</a></td>
                        <td style={{ padding:'12px 14px', color:'#555' }}>{s.phone}</td>
                        <td style={{ padding:'12px 14px', color:'#666', fontSize:'12px', maxWidth:'200px' }}>{s.address}</td>
                        <td style={{ padding:'12px 14px' }}>
                          <div style={{ display:'flex', flexWrap:'wrap', gap:'4px' }}>
                            {s.vaccines.map(v => (
                              <span key={v} style={{ padding:'2px 8px', borderRadius:'10px', background:'#e0f7f4', color:'#26a69a', fontSize:'11px', fontWeight:'600' }}>{v}</span>
                            ))}
                          </div>
                        </td>
                        <td style={{ padding:'12px 14px', color:'#555', textAlign:'center' }}>{s.leadTimeDays}d</td>
                        <td style={{ padding:'12px 14px' }}><span style={statusStyle(s.status)}>{s.status}</span></td>
                        <td style={{ padding:'12px 14px', color:'#888', fontSize:'12px', maxWidth:'180px', fontStyle:'italic' }}>{s.notes || '—'}</td>
                        <td style={{ padding:'12px 14px' }}>
                          <div style={{ display:'flex', gap:'6px' }}>
                            <button onClick={()=>openEdit(s)}
                              style={{ padding:'5px 10px', borderRadius:'6px', border:'1.5px solid #26a69a', background:'white', color:'#26a69a', fontSize:'12px', fontWeight:'600', cursor:'pointer', transition:'all 0.15s' }}
                              onMouseEnter={e=>{e.currentTarget.style.background='#26a69a';e.currentTarget.style.color='white';}}
                              onMouseLeave={e=>{e.currentTarget.style.background='white';e.currentTarget.style.color='#26a69a';}}>
                              Edit
                            </button>
                            <button onClick={()=>handleDelete(s.id)}
                              style={{ padding:'5px 10px', borderRadius:'6px', border:'1.5px solid #e53935', background:'white', color:'#e53935', fontSize:'12px', fontWeight:'600', cursor:'pointer', transition:'all 0.15s' }}
                              onMouseEnter={e=>{e.currentTarget.style.background='#e53935';e.currentTarget.style.color='white';}}
                              onMouseLeave={e=>{e.currentTarget.style.background='white';e.currentTarget.style.color='#e53935';}}>
                              Delete
                            </button>
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
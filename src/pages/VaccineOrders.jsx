// VaccineOrders.jsx
// Save in: src/pages/VaccineOrders.jsx

import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import '../styles/dashboard.css';

const STATUS_OPTIONS = ['Pending', 'Approved', 'Shipped', 'Delivered', 'Cancelled'];

const statusStyle = (status) => {
  const map = {
    Pending:   { bg:'#fff8e1', color:'#f57f17', border:'#ffe082' },
    Approved:  { bg:'#e3f2fd', color:'#1565c0', border:'#90caf9' },
    Shipped:   { bg:'#f3e5f5', color:'#6a1b9a', border:'#ce93d8' },
    Delivered: { bg:'#e8f5e9', color:'#2e7d32', border:'#a5d6a7' },
    Cancelled: { bg:'#ffebee', color:'#c62828', border:'#ef9a9a' },
  };
  const s = map[status] || map.Pending;
  return {
    padding:'4px 12px', borderRadius:'20px', fontSize:'12px', fontWeight:'700',
    background:s.bg, color:s.color, border:`1.5px solid ${s.border}`, whiteSpace:'nowrap',
  };
};

const VaccineOrders = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [editingOrder, setEditingOrder] = useState(null);

  // Load from localStorage (written by vaccine.jsx)
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('vaccineOrders') || '[]');
    // Add some seed data if empty
    if (stored.length === 0) {
      const seed = [
        { id:1, vaccine:'Anti-Rabies', supplier:'MedSource Philippines', amount:200, pricePerPiece:1100, total:220000, status:'Delivered', orderedAt:'2025-01-10T09:00:00.000Z' },
        { id:2, vaccine:'Booster',     supplier:'VaccinePro Asia',        amount:500, pricePerPiece:1100, total:550000, status:'Pending',   orderedAt:'2025-03-15T14:00:00.000Z' },
      ];
      localStorage.setItem('vaccineOrders', JSON.stringify(seed));
      setOrders(seed);
    } else {
      setOrders(stored);
    }
  }, []);

  const saveOrders = (updated) => {
    setOrders(updated);
    localStorage.setItem('vaccineOrders', JSON.stringify(updated));
  };

  const handleStatusChange = (id, newStatus) => {
    saveOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this order?')) return;
    saveOrders(orders.filter(o => o.id !== id));
  };

  const filtered = filterStatus === 'all' ? orders : orders.filter(o => o.status === filterStatus);

  const counts = STATUS_OPTIONS.reduce((acc, s) => {
    acc[s] = orders.filter(o => o.status === s).length;
    return acc;
  }, {});

  return (
    <section className="dashboard-container">
      <button type="button" className="mobile-menu-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>☰</button>
      <Sidebar isMobileMenuOpen={isMobileMenuOpen} onMenuClose={() => setIsMobileMenuOpen(false)} />
      {isMobileMenuOpen && <div className="overlay" onClick={() => setIsMobileMenuOpen(false)} />}

      <section className="main-wrapper">
        <TopBar />
        <main className="main-content">

          <div className="page-header">
            <div>
              <h1 className="dashboard-heading">📦 Vaccine Orders</h1>
              <p className="dashboard-subheading">Track and manage all vaccine procurement orders</p>
            </div>
          </div>

          {/* Status summary chips */}
          <div style={{ display:'flex', gap:'12px', marginBottom:'24px', flexWrap:'wrap' }}>
            {[{ key:'all', label:'All Orders', count:orders.length, color:'#26a69a' },
              ...STATUS_OPTIONS.map(s => ({ key:s, label:s, count:counts[s]||0, color: s==='Delivered'?'#2e7d32':s==='Pending'?'#f57f17':s==='Cancelled'?'#c62828':s==='Approved'?'#1565c0':'#6a1b9a' }))
            ].map(chip => (
              <button key={chip.key} onClick={() => setFilterStatus(chip.key)}
                style={{
                  padding:'8px 16px', borderRadius:'20px', border:`2px solid ${filterStatus===chip.key ? chip.color : '#e0e0e0'}`,
                  background: filterStatus===chip.key ? chip.color : 'white',
                  color: filterStatus===chip.key ? 'white' : '#555',
                  fontSize:'13px', fontWeight:'600', cursor:'pointer', transition:'all 0.15s',
                  display:'flex', alignItems:'center', gap:'6px',
                }}>
                {chip.label}
                <span style={{ background: filterStatus===chip.key ? 'rgba(255,255,255,0.3)' : '#f0f0f0', color: filterStatus===chip.key ? 'white' : '#888', borderRadius:'10px', padding:'1px 7px', fontSize:'11px', fontWeight:'700' }}>
                  {chip.count}
                </span>
              </button>
            ))}
          </div>

          {/* Orders table */}
          <div style={{ background:'white', borderRadius:'12px', overflow:'hidden', boxShadow:'0 2px 4px rgba(0,0,0,0.06),0 6px 16px rgba(0,0,0,0.10)' }}>
            {filtered.length === 0 ? (
              <div style={{ padding:'48px', textAlign:'center', color:'#aaa', fontSize:'14px' }}>
                <div style={{ fontSize:'40px', marginBottom:'12px' }}>📭</div>
                No orders found.
              </div>
            ) : (
              <div style={{ overflowX:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'13px' }}>
                  <thead>
                    <tr style={{ background:'#26a69a', color:'white' }}>
                      {['Order ID','Vaccine','Supplier','Amount (doses)','Price / dose','Total','Date Ordered','Status','Actions'].map(col => (
                        <th key={col} style={{ padding:'11px 14px', textAlign:'left', fontWeight:'700', fontSize:'12px', whiteSpace:'nowrap' }}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((order, i) => (
                      <tr key={order.id} style={{ borderBottom:'1px solid #f0f0f0', background:i%2===0?'#fafafa':'white', transition:'background 0.12s' }}
                        onMouseEnter={e => e.currentTarget.style.background='#f0fffe'}
                        onMouseLeave={e => e.currentTarget.style.background=i%2===0?'#fafafa':'white'}>
                        <td style={{ padding:'12px 14px', fontWeight:'700', color:'#555', fontFamily:'monospace' }}>#{String(order.id).slice(-6)}</td>
                        <td style={{ padding:'12px 14px', fontWeight:'700', color:'#333' }}>{order.vaccine}</td>
                        <td style={{ padding:'12px 14px', color:'#555' }}>{order.supplier}</td>
                        <td style={{ padding:'12px 14px', fontWeight:'700', color:'#26a69a' }}>{order.amount?.toLocaleString()}</td>
                        <td style={{ padding:'12px 14px', color:'#555' }}>₱{order.pricePerPiece?.toLocaleString()}</td>
                        <td style={{ padding:'12px 14px', fontWeight:'800', color:'#26a69a' }}>₱{order.total?.toLocaleString()}</td>
                        <td style={{ padding:'12px 14px', color:'#666', fontSize:'12px' }}>
                          {new Date(order.orderedAt).toLocaleDateString('en-PH', { year:'numeric', month:'short', day:'numeric' })}
                        </td>
                        <td style={{ padding:'12px 14px' }}>
                          {editingOrder === order.id ? (
                            <select value={order.status} onChange={e => { handleStatusChange(order.id, e.target.value); setEditingOrder(null); }}
                              style={{ padding:'4px 8px', borderRadius:'6px', border:'1.5px solid #26a69a', fontSize:'12px', background:'white' }}>
                              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          ) : (
                            <span style={statusStyle(order.status)} onClick={() => setEditingOrder(order.id)} title="Click to change status" className="cursor-pointer">
                              {order.status}
                            </span>
                          )}
                        </td>
                        <td style={{ padding:'12px 14px' }}>
                          <button onClick={() => handleDelete(order.id)}
                            style={{ padding:'5px 10px', borderRadius:'6px', border:'1.5px solid #e53935', background:'white', color:'#e53935', fontSize:'12px', fontWeight:'600', cursor:'pointer', transition:'all 0.15s' }}
                            onMouseEnter={e => { e.currentTarget.style.background='#e53935'; e.currentTarget.style.color='white'; }}
                            onMouseLeave={e => { e.currentTarget.style.background='white'; e.currentTarget.style.color='#e53935'; }}>
                            🗑️ Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ background:'#f5f5f5', fontWeight:'700', borderTop:'2px solid #e0e0e0' }}>
                      <td colSpan={5} style={{ padding:'12px 14px', color:'#555' }}>
                        {filtered.length} order{filtered.length!==1?'s':''} · Total value
                      </td>
                      <td style={{ padding:'12px 14px', color:'#26a69a', fontSize:'15px' }}>
                        ₱{filtered.reduce((s,o) => s+(o.total||0), 0).toLocaleString()}
                      </td>
                      <td colSpan={3} />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

        </main>
      </section>
    </section>
  );
};

export default VaccineOrders;
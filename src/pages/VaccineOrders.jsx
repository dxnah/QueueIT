import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import { orderAPI } from '../services/api';
import '../styles/dashboard.css';

const STATUS_OPTIONS = ['Pending', 'Approved', 'Shipped', 'Delivered', 'Cancelled'];

const statusStyle = (status) => {
  const map = {
    Pending:   { bg: '#fff8e1', color: '#f57f17', border: '#ffe082' },
    Approved:  { bg: '#e3f2fd', color: '#1565c0', border: '#90caf9' },
    Shipped:   { bg: '#f3e5f5', color: '#6a1b9a', border: '#ce93d8' },
    Delivered: { bg: '#e8f5e9', color: '#2e7d32', border: '#a5d6a7' },
    Cancelled: { bg: '#ffebee', color: '#c62828', border: '#ef9a9a' },
  };
  const s = map[status] || map.Pending;
  return {
    padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700',
    background: s.bg, color: s.color, border: `1.5px solid ${s.border}`,
    whiteSpace: 'nowrap', cursor: 'pointer',
  };
};

const VaccineOrders = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [orders,           setOrders]           = useState([]);
  const [filterStatus,     setFilterStatus]     = useState('all');
  const [searchQuery,      setSearchQuery]      = useState('');
  const [editingOrder,     setEditingOrder]     = useState(null);
  const [loading,          setLoading]          = useState(true);
  const [apiError,         setApiError]         = useState(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setApiError(null);
      const data = await orderAPI.getAll();
      setOrders(data);
    } catch (err) {
      setApiError('Could not connect to server. Check that Django is running on localhost:8000.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadOrders(); }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await orderAPI.updateStatus(id, { status: newStatus });
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
    } catch (err) {
      alert(`Failed to update status: ${err.message}`);
    }
    setEditingOrder(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this order?')) return;
    try {
      await orderAPI.delete(id);
      setOrders(prev => prev.filter(o => o.id !== id));
    } catch (err) {
      alert(`Failed to delete order: ${err.message}`);
    }
  };

  const filtered = orders.filter(o => {
    const matchStatus = filterStatus === 'all' || o.status === filterStatus;
    const q = searchQuery.toLowerCase();
    const matchSearch = !q
      || (o.vaccine  || '').toLowerCase().includes(q)
      || (o.supplier || '').toLowerCase().includes(q)
      || String(o.id).includes(q);
    return matchStatus && matchSearch;
  });

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
              <h2 className="dashboard-heading" style={{ marginTop: '-20px' }}>📦 Vaccine Orders</h2>
              <p className="dashboard-subheading">Track and manage all vaccine procurement orders</p>
            </div>
          </div>

          {apiError && (
            <div style={{ background: '#ffebee', color: '#c62828', border: '1px solid #ef9a9a', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontWeight: '600', fontSize: '13px' }}>
              {apiError}
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#aaa', fontSize: '15px' }}>⏳ Loading orders from server...</div>
          ) : (
            <>
              {/* Status chips */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                {[
                  { key: 'all', label: 'All Orders', count: orders.length, color: '#26a69a' },
                  ...STATUS_OPTIONS.map(s => ({
                    key: s, label: s, count: counts[s] || 0,
                    color: s === 'Delivered' ? '#2e7d32' : s === 'Pending' ? '#f57f17' : s === 'Cancelled' ? '#c62828' : s === 'Approved' ? '#1565c0' : '#6a1b9a',
                  })),
                ].map(chip => (
                  <button key={chip.key} onClick={() => setFilterStatus(chip.key)}
                    style={{
                      padding: '8px 16px', borderRadius: '20px',
                      border: `2px solid ${filterStatus === chip.key ? chip.color : '#e0e0e0'}`,
                      background: filterStatus === chip.key ? chip.color : 'white',
                      color: filterStatus === chip.key ? 'white' : '#555',
                      fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.15s',
                      display: 'flex', alignItems: 'center', gap: '6px',
                    }}>
                    {chip.label}
                    <span style={{
                      background: filterStatus === chip.key ? 'rgba(255,255,255,0.3)' : '#f0f0f0',
                      color: filterStatus === chip.key ? 'white' : '#888',
                      borderRadius: '10px', padding: '1px 7px', fontSize: '11px', fontWeight: '700',
                    }}>{chip.count}</span>
                  </button>
                ))}
              </div>

              {/* Search */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: '1', minWidth: '220px', maxWidth: '360px' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px', pointerEvents: 'none', opacity: 0.5 }}>🔍</span>
                  <input type="text" placeholder="Search vaccine, supplier, order ID..."
                    value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    style={{ width: '100%', padding: '8px 36px', borderRadius: '20px', border: '1.5px solid #e0e0e0', fontSize: '13px', outline: 'none', background: 'white', color: '#333', boxSizing: 'border-box', height: '38px' }}
                    onFocus={e => e.target.style.borderColor = '#26a69a'}
                    onBlur={e => e.target.style.borderColor = '#e0e0e0'} />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')}
                      style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', fontSize: '12px', color: '#aaa', cursor: 'pointer' }}>✕</button>
                  )}
                </div>
                <span style={{ fontSize: '12px', color: '#aaa', whiteSpace: 'nowrap' }}>
                  {filtered.length} of {orders.length} order{orders.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Table */}
              <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.06),0 6px 16px rgba(0,0,0,0.10)' }}>
                {filtered.length === 0 ? (
                  <div style={{ padding: '48px', textAlign: 'center', color: '#aaa', fontSize: '14px' }}>
                    <div style={{ fontSize: '40px', marginBottom: '12px' }}>📭</div>No orders found.
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ background: '#26a69a', color: 'white' }}>
                          {['Order ID', 'Vaccine', 'Supplier', 'Amount (doses)', 'Price / dose', 'Total', 'Date Ordered', 'Status', 'Actions'].map(col => (
                            <th key={col} style={{ padding: '11px 14px', textAlign: 'left', fontWeight: '700', fontSize: '12px', whiteSpace: 'nowrap' }}>{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((order, i) => (
                          <tr key={order.id}
                            style={{ borderBottom: '1px solid #f0f0f0', background: i % 2 === 0 ? '#fafafa' : 'white', transition: 'background 0.12s' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#f0fffe'}
                            onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? '#fafafa' : 'white'}>
                            <td style={{ padding: '12px 14px', fontWeight: '700', color: '#555', fontFamily: 'monospace' }}>#{String(order.id).slice(-6)}</td>
                            <td style={{ padding: '12px 14px', fontWeight: '700', color: '#333' }}>{order.vaccine}</td>
                            <td style={{ padding: '12px 14px', color: '#555' }}>{order.supplier}</td>
                            <td style={{ padding: '12px 14px', fontWeight: '700', color: '#26a69a' }}>{order.amount?.toLocaleString()}</td>
                            {/* Field is price_per_piece on both model and API response */}
                            <td style={{ padding: '12px 14px', color: '#555' }}>₱{Number(order.price_per_piece || 0).toLocaleString()}</td>
                            <td style={{ padding: '12px 14px', fontWeight: '800', color: '#26a69a' }}>₱{Number(order.total || 0).toLocaleString()}</td>
                            <td style={{ padding: '12px 14px', color: '#666', fontSize: '12px' }}>
                              {order.ordered_at
                                ? new Date(order.ordered_at).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })
                                : '—'}
                            </td>
                            <td style={{ padding: '12px 14px' }}>
                              {editingOrder === order.id ? (
                                <select value={order.status}
                                  onChange={e => handleStatusChange(order.id, e.target.value)}
                                  style={{ padding: '4px 8px', borderRadius: '6px', border: '1.5px solid #26a69a', fontSize: '12px', background: 'white' }}>
                                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                              ) : (
                                <span style={statusStyle(order.status)} onClick={() => setEditingOrder(order.id)} title="Click to change status">
                                  {order.status}
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '12px 14px' }}>
                              <button onClick={() => handleDelete(order.id)}
                                style={{ padding: '5px 10px', borderRadius: '6px', border: '1.5px solid #e53935', background: 'white', color: '#e53935', fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.15s' }}
                                onMouseEnter={e => { e.currentTarget.style.background = '#e53935'; e.currentTarget.style.color = 'white'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#e53935'; }}>
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr style={{ background: '#f5f5f5', fontWeight: '700', borderTop: '2px solid #e0e0e0' }}>
                          <td colSpan={5} style={{ padding: '12px 14px', color: '#555' }}>
                            {filtered.length} order{filtered.length !== 1 ? 's' : ''} · Total value
                          </td>
                          <td style={{ padding: '12px 14px', color: '#26a69a', fontSize: '15px' }}>
                            ₱{filtered.reduce((s, o) => s + Number(o.total || 0), 0).toLocaleString()}
                          </td>
                          <td colSpan={3} />
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

        </main>
      </section>
    </section>
  );
};

export default VaccineOrders;
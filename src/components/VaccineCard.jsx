// VaccineCard.jsx


import React, { useState } from 'react';


// ── Expiry info helper ─────────────────────────────────────────────────────────
const getExpiryInfo = (expiryDate) => {
  if (!expiryDate) return { label: 'No date set', color: '#999', daysLeft: null };
  const today    = new Date();
  const expiry   = new Date(expiryDate);
  const daysLeft = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
  if (daysLeft < 0)   return { label: `⛔ Expired ${Math.abs(daysLeft)}d ago`,      color: '#b71c1c', daysLeft };
  if (daysLeft <= 30) return { label: `🔴 Expires in ${daysLeft}d — Urgent`,         color: '#c62828', daysLeft };
  if (daysLeft <= 60) return { label: `🟡 Expires in ${daysLeft}d — Monitor`,        color: '#f57f17', daysLeft };
  if (daysLeft <= 90) return { label: `🟠 Expires in ${daysLeft}d — Plan ahead`,     color: '#e65100', daysLeft };
  return                     { label: `✅ ${expiryDate} · ${daysLeft} days left`,    color: '#2e7d32', daysLeft };
};


// ── Batch Dropdown ─────────────────────────────────────────────────────────────
const BatchDropdown = ({ batches }) => {
  const [open, setOpen]             = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const count = batches.length;


  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>


      {/* Trigger pill */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '5px',
          padding: '4px 10px', borderRadius: '20px', fontSize: '12px',
          fontWeight: '600', cursor: 'pointer',
          background: open ? '#e0f7f4' : '#f5f5f5',
          border: `1.5px solid ${open ? '#26a69a' : '#e0e0e0'}`,
          color: open ? '#26a69a' : '#555',
          transition: 'all 0.15s',
          whiteSpace: 'nowrap',
        }}
      >
        📦 {count} Batch{count !== 1 ? 'es' : ''} {open ? '▴' : '▾'}
      </button>


      {/* Dropdown panel — rendered with high z-index so it floats above the card */}
      {open && (
        <div style={{
          position: 'absolute', top: '110%', left: 0, zIndex: 9999,
          background: 'white', border: '1.5px solid #e0e0e0',
          borderRadius: '12px', boxShadow: '0 8px 28px rgba(0,0,0,0.18)',
          minWidth: '270px', overflow: 'hidden',
        }}>
          {/* Panel header */}
          <div style={{
            background: '#26a69a', padding: '8px 14px',
            fontSize: '11px', fontWeight: '700', color: 'white',
            letterSpacing: '0.4px', textTransform: 'uppercase',
          }}>
            Batch Numbers &amp; Expiry Dates
          </div>


          {batches.length === 0 && (
            <div style={{ padding: '14px', fontSize: '13px', color: '#aaa', textAlign: 'center' }}>
              No batch data available
            </div>
          )}


          {batches.map((b, i) => {
            const expiry    = getExpiryInfo(b.expiryDate);
            const isHovered = hoveredIdx === i;
            return (
              <div
                key={i}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{
                  padding: '10px 14px',
                  borderBottom: i < batches.length - 1 ? '1px solid #f5f5f5' : 'none',
                  background: isHovered ? '#f9fffe' : 'white',
                  transition: 'background 0.12s',
                  cursor: 'default',
                  userSelect: 'none',
                }}
              >
                {/* Batch number + index label */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#333', fontFamily: 'monospace' }}>
                    {b.batchNumber}
                  </span>
                  <span style={{
                    fontSize: '10px', fontWeight: '700', padding: '2px 7px',
                    borderRadius: '10px', background: '#f0f0f0', color: '#888',
                  }}>
                    Batch {i + 1}
                  </span>
                </div>


                {/* Expiry — always rendered but animates in on hover */}
                <div style={{
                  fontSize: '12px',
                  color: expiry.color,
                  fontWeight: '600',
                  maxHeight: isHovered ? '30px' : '0px',
                  opacity: isHovered ? 1 : 0,
                  overflow: 'hidden',
                  marginTop: isHovered ? '5px' : '0px',
                  transition: 'max-height 0.22s ease, opacity 0.2s ease, margin-top 0.2s ease',
                }}>
                  {expiry.label}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};


// ── VaccineCard ────────────────────────────────────────────────────────────────
const VaccineCard = ({ vaccine, onEdit, onDelete }) => {


  const getStatusClass = (status) => {
    if (status === 'In Stock')  return 'status-in-stock';
    if (status === 'Low Stock') return 'status-low-stock';
    return 'status-out-stock';
  };


  const monthlyUrgency = vaccine.monthlyUrgency;
  const getMonthlyBadge = (level) => {
    if (level === 'urgent') return { bg: '#ffebee', color: '#c62828', border: '#ef9a9a', label: '🚨 Urgent — Restock Now'   };
    if (level === 'soon')   return { bg: '#fff8e1', color: '#f57f17', border: '#ffe082', label: '⚠️ Soon — Order This Month' };
    return null;
  };
  const monthlyBadge = monthlyUrgency ? getMonthlyBadge(monthlyUrgency) : null;


  const batches = vaccine.batches && vaccine.batches.length > 0
    ? vaccine.batches
    : vaccine.batchNumber
      ? [{ batchNumber: vaccine.batchNumber, expiryDate: vaccine.expiryDate }]
      : [];


  return (
    // overflow: visible so the batch dropdown can escape the card boundary
    <div className="vaccine-card-item" style={{ padding: 0, overflow: 'visible' }}>


      {/* ── Header: full-width vaccine name ── */}
      <div style={{
        background: '#26a69a',
        padding: '12px 16px',
        textAlign: 'center',
        borderBottom: '1px solid #1e8e83',
        borderRadius: '12px 12px 0 0', // match card's rounded top corners
      }}>
        <h3 style={{
          margin: 0, fontSize: '15px', fontWeight: '700',
          color: 'white', letterSpacing: '0.3px',
        }}>
          {vaccine.name}
        </h3>
      </div>


      {/* ── Sub-header: batch dropdown | status badge ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        borderBottom: '1px solid #e0e0e0',
        position: 'relative', // gives z-index a stacking context
        zIndex: 10,
      }}>
        {/* Left cell — batch */}
        <div style={{
          padding: '8px 14px', display: 'flex', alignItems: 'center',
          justifyContent: 'center', borderRight: '1px solid #e0e0e0',
          overflow: 'visible', // critical: don't clip the dropdown
        }}>
          <BatchDropdown batches={batches} />
        </div>
        {/* Right cell — status */}
        <div style={{
          padding: '8px 14px', display: 'flex', alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span className={getStatusClass(vaccine.status)} style={{ margin: 0 }}>
            {vaccine.status}
          </span>
        </div>
      </div>


      {/* ── Body ── */}
      <div className="vaccine-card-body" style={{ padding: '14px 16px' }}>


        <div className="vaccine-info-row">
          <span className="info-label">Available:</span>
          <span className="info-value">{vaccine.available.toLocaleString()} doses</span>
        </div>


        {vaccine.mlRecommended > 0 && (
          <div className="vaccine-info-row highlight">
            <span className="info-label">🤖 ML Recommended Order:</span>
            <span className="info-value-highlight">{vaccine.mlRecommended.toLocaleString()} doses</span>
          </div>
        )}


        {monthlyBadge && (
          <div style={{
            marginTop: '10px', padding: '7px 12px',
            background: monthlyBadge.bg, border: `1.5px solid ${monthlyBadge.border}`,
            borderRadius: '8px', fontSize: '12px', fontWeight: '700',
            color: monthlyBadge.color,
          }}>
            📦 Monthly Demand: {monthlyBadge.label}
          </div>
        )}
      </div>


      {/* ── Footer ── */}
      <div className="vaccine-card-footer" style={{ padding: '10px 16px' }}>
        <div className="card-actions">
          <button onClick={() => onEdit(vaccine)} className="btn-icon btn-edit" title="Edit">✏️</button>
          <button onClick={() => onDelete(vaccine.id)} className="btn-icon btn-delete" title="Delete">🗑️</button>
        </div>
      </div>


    </div>
  );
};


export default VaccineCard;


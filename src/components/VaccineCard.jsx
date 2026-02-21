// VaccineCard.jsx

import React from 'react';

const VaccineCard = ({ vaccine, onEdit, onDelete }) => {

  const getStatusClass = (status) => {
    if (status === 'In Stock') return 'status-in-stock';
    if (status === 'Low Stock') return 'status-low-stock';
    return 'status-out-stock';
  };

  const getUrgencyClass = (status) => {
    if (status === 'Out Stock') return 'urgency-critical';
    if (status === 'Low Stock') return 'urgency-warning';
    return 'urgency-normal';
  };

  // ── EXPIRY LOGIC ───────────────────────────────────────
  const getExpiryInfo = (expiryDate) => {
    if (!expiryDate) return { label: 'No date set', className: 'expiry-unknown', daysLeft: null };

    const today  = new Date();
    const expiry = new Date(expiryDate);
    const diffMs = expiry - today;
    const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) {
      return {
        label: `⛔ Expired ${Math.abs(daysLeft)} day${Math.abs(daysLeft) !== 1 ? 's' : ''} ago`,
        className: 'expiry-expired',
        daysLeft,
      };
    }
    if (daysLeft <= 30) {
      return {
        label: `🔴 Expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''} — Urgent`,
        className: 'expiry-urgent',
        daysLeft,
      };
    }
    if (daysLeft <= 60) {
      return {
        label: `🟡 Expires in ${daysLeft} days — Monitor`,
        className: 'expiry-soon',
        daysLeft,
      };
    }
    if (daysLeft <= 90) {
      return {
        label: `🟠 Expires in ${daysLeft} days — Plan ahead`,
        className: 'expiry-approaching',
        daysLeft,
      };
    }
    return {
      label: `✅ ${expiryDate} (${daysLeft} days left)`,
      className: 'expiry-ok',
      daysLeft,
    };
  };

  const expiryInfo = getExpiryInfo(vaccine.expiryDate);

  return (
    <div className="vaccine-card-item">

      {/* ── Header ── */}
      <div className="vaccine-card-header">
        <h3 className="vaccine-name">{vaccine.name}</h3>
        <span className={getStatusClass(vaccine.status)}>
          {vaccine.status}
        </span>
      </div>

      {/* ── Body ── */}
      <div className="vaccine-card-body">
        <div className="vaccine-info-row">
          <span className="info-label">Available:</span>
          <span className="info-value">{vaccine.available.toLocaleString()} doses</span>
        </div>
        <div className="vaccine-info-row">
          <span className="info-label">Min. Required:</span>
          <span className="info-value">{vaccine.minStock.toLocaleString()} doses</span>
        </div>
        <div className="vaccine-info-row">
          <span className="info-label">Batch Number:</span>
          <span className="info-value">{vaccine.batchNumber}</span>
        </div>

        {/* ── Expiry Date — colored by urgency ── */}
        <div className={`vaccine-info-row expiry-row ${expiryInfo.className}`}>
          <span className="info-label">Expiry Date:</span>
          <span className={`expiry-value ${expiryInfo.className}`}>
            {expiryInfo.label}
          </span>
        </div>

        {vaccine.mlRecommended > 0 && (
          <div className="vaccine-info-row highlight">
            <span className="info-label">🤖 ML Recommended Order:</span>
            <span className="info-value-highlight">
              {vaccine.mlRecommended.toLocaleString()} doses
            </span>
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="vaccine-card-footer">
        <span className={getUrgencyClass(vaccine.status)}>
          {vaccine.status === 'Out Stock' ? '🚨 Critical' :
           vaccine.status === 'Low Stock' ? '⚠️ Restock Soon' :
           '✅ Sufficient'}
        </span>
        <div className="card-actions">
          <button onClick={() => onEdit(vaccine)} className="btn-icon btn-edit" title="Edit">
            ✏️
          </button>
          <button onClick={() => onDelete(vaccine.id)} className="btn-icon btn-delete" title="Delete">
            🗑️
          </button>
        </div>
      </div>

    </div>
  );
};

export default VaccineCard;
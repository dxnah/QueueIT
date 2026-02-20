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

  return (
    <div className="vaccine-card-item">
      <div className="vaccine-card-header">
        <h3 className="vaccine-name">{vaccine.name}</h3>
        <span className={getStatusClass(vaccine.status)}>
          {vaccine.status}
        </span>
      </div>

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
        <div className="vaccine-info-row">
          <span className="info-label">Expiry Date:</span>
          <span className="info-value">{vaccine.expiryDate}</span>
        </div>
        
        {vaccine.mlRecommended && (
          <div className="vaccine-info-row highlight">
            <span className="info-label">🤖 ML Recommended Order:</span>
            <span className="info-value-highlight">{vaccine.mlRecommended.toLocaleString()} doses</span>
          </div>
        )}
      </div>

      <div className="vaccine-card-footer">
        <span className={getUrgencyClass(vaccine.status)}>
          {vaccine.status === 'Out Stock' ? '🚨 Critical' : 
           vaccine.status === 'Low Stock' ? '⚠️ Restock Soon' : 
           '✅ Adequate'}
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
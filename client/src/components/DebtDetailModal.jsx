import React from 'react';
import { useDebtStates } from '../context/DebtStatesContext';

const DebtDetailModal = ({ isOpen, onClose, debt }) => {
  const { getStateNameById } = useDebtStates();

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (!isOpen || !debt) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Debt Details</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <div className="detail-view">
          <div className="detail-group">
            <span className="detail-label">ID</span>
            <span className="detail-value">#{debt.id}</span>
          </div>
          <div className="detail-group">
            <span className="detail-label">Amount</span>
            <span className="detail-value">{formatCurrency(debt.amount)}</span>
          </div>
          <div className="detail-group">
            <span className="detail-label">Date Created</span>
            <span className="detail-value">{formatDate(debt.creation_date)}</span>
          </div>
          <div className="detail-group">
            <span className="detail-label">Status</span>
            <span className={`status status-${getStateNameById(debt.state_id)?.toLowerCase().replace(' ', '-') || 'unknown'}`}>
              {getStateNameById(debt.state_id) || 'Unknown'}
            </span>
          </div>
          {debt.description && (
            <div className="detail-group">
              <span className="detail-label">Description</span>
              <span className="detail-value">{debt.description}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DebtDetailModal;
import { useState, useEffect } from 'react';
import { useDebtStates } from '../context/DebtStatesContext';
import apiClient from '../services/apiClient';
import Swal from 'sweetalert2';

const DebtModal = ({ isOpen, onClose, mode, debtData, onSuccess }) => {
  const { debtStates } = useDebtStates();
  const [formData, setFormData] = useState({
    amount: '',
    stateId: 1
  });
  const [loading, setLoading] = useState(false);

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && debtData) {
        setFormData({
          amount: debtData.amount || '',
          stateId: debtData.state_id || 1
        });
      } else {
        // Add mode
        setFormData({
          amount: '',
          stateId: 1
        });
      }
    }
  }, [isOpen, mode, debtData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        userId: parseInt(localStorage.getItem('userId')),
        amount: parseFloat(formData.amount),
        stateId: parseInt(formData.stateId)
      };

      if (mode === 'edit') {
        submitData.id = debtData.id;
        await apiClient.put(`/debts/edit/${debtData.id}`, submitData);
      } else {
        await apiClient.post('/debts/create', submitData);
      }

      Swal.fire({
        icon: 'success',
        title: mode === 'edit' ? 'Updated!' : 'Created!',
        text: mode === 'edit' ? 'Debt has been updated successfully.' : 'New debt has been added successfully.',
        timer: 2000,
        showConfirmButton: false
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving debt:', error);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: error.response?.data?.message || 'Something went wrong while saving the debt.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{mode === 'edit' ? 'Edit Debt' : 'Add New Debt'}</h3>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="add-debt-form">
          <div className="form-group">
            <label htmlFor="amount">Amount ($)</label>
            <input
              type="number"
              id="amount"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0.01"
              required
              className="form-input"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="state">Status</label>
            <select
              id="state"
              value={formData.stateId}
              onChange={(e) => handleInputChange('stateId', parseInt(e.target.value))}
              className="form-input"
              required
              disabled={loading}
            >
              {debtStates.map((state) => (
                <option key={state.id} value={state.id}>
                  {state.state_name}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (mode === 'edit' ? 'Updating...' : 'Adding...') : (mode === 'edit' ? 'Update Debt' : 'Add Debt')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DebtModal;
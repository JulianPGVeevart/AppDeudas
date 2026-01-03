import { useDebtStates } from '../context/DebtStatesContext';

const DebtRow = ({ debt, onEdit, onDelete, onViewDetails }) => {
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

  return (
    <tr onClick={() => onViewDetails(debt)}>
      <td className="debt-id" data-label="ID">#{debt.id}</td>
      <td className="debt-amount" data-label="Amount">{formatCurrency(debt.amount)}</td>
      <td data-label="Date">{formatDate(debt.creation_date)}</td>
      <td data-label="Status">
        <span className={`status status-${getStateNameById(debt.state_id)?.toLowerCase().replace(' ', '-') || 'unknown'}`}>
          {getStateNameById(debt.state_id) || 'Unknown'}
        </span>
      </td>
      <td data-label="Actions">
        <div className="action-buttons">
          <button
            className="edit-btn"
            onClick={(e) => onEdit(e, debt)}
            title="Edit debt"
          >
            ✏️
          </button>
          <button
            className="delete-btn"
            onClick={(e) => onDelete(e, debt.id)}
            title="Delete debt"
          >
            🗑️
          </button>
        </div>
      </td>
    </tr>
  );
};

const DebtTable = ({ debts, loading, error, onEdit, onDelete, onViewDetails }) => {
  if (loading) {
    return <p className="loading">Loading debts...</p>;
  }

  if (error) {
    return <p className="error">{error}</p>;
  }

  if (debts.length === 0) {
    return <p className="no-debts">No debts found. You're all caught up!</p>;
  }

  return (
    <div className="table-container">
      <table className="debts-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Amount</th>
            <th>Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {debts.map((debt) => (
            <DebtRow
              key={debt.id}
              debt={debt}
              onEdit={onEdit}
              onDelete={onDelete}
              onViewDetails={onViewDetails}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DebtTable;
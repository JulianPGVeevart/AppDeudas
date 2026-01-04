import { useDebtStates } from '../context/DebtStatesContext';

const AggregationRow = ({ aggregation }) => {
  const { getStateNameById } = useDebtStates();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <tr>
      <td className="debt-amount" data-label="Amount">{formatCurrency(aggregation.total_amount)}</td>
      <td data-label="Status">
        <span className={`status status-${getStateNameById(aggregation.state_id)?.toLowerCase().replace(' ', '-') || 'unknown'}`}>
          {getStateNameById(aggregation.state_id) || 'Unknown'}
        </span>
      </td>
    </tr>
  );
};

const DebtsAggregations = ({ aggregations, loading, error }) => {
  if (loading) {
    return <p className="loading">Loading aggregations...</p>;
  }

  if (error) {
    return <p className="error">{error}</p>;
  }

  if (aggregations.length === 0) {
    return <p className="no-debts">No aggregations found. You're all caught up!</p>;
  }

  return (
    <div className="table-container">
      <table className="debts-table">
        <thead>
          <tr>
            <th>Total Debt Amount</th>
            <th>State</th>
          </tr>
        </thead>
        <tbody>
          {aggregations.map((aggregation) => (
            <AggregationRow
              key={aggregation.state_id}
              aggregation={aggregation}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DebtsAggregations;
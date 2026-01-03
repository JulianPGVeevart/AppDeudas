import { createContext, useState, useContext, useEffect } from 'react';
import apiClient from '../services/apiClient';

export const DebtStatesContext = createContext();

export const DebtStatesProvider = ({ children }) => {
  const [debtStates, setDebtStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDebtStates = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/debts');
      setDebtStates(response.data || []);
    } catch (err) {
      setError('Failed to load debt states');
      console.error('Error fetching debt states:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStateNameById = (stateId) => {
    const state = debtStates.find(state => state.id === stateId);
    return state ? state.state_name : 'Unknown';
  };

  const getStateById = (stateId) => {
    return debtStates.find(state => state.id === stateId) || null;
  };

  useEffect(() => {
    fetchDebtStates();
  }, []);

  return (
    <DebtStatesContext.Provider value={{
      debtStates,
      loading,
      error,
      fetchDebtStates,
      getStateNameById,
      getStateById
    }}>
      {children}
    </DebtStatesContext.Provider>
  );
};

export const useDebtStates = () => {
  const context = useContext(DebtStatesContext);
  if (!context) {
    throw new Error('useDebtStates must be used within a DebtStatesProvider');
  }
  return context;
};
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useDebtStates } from '../../context/DebtStatesContext';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/apiClient';
import DebtModal from '../../components/DebtModal';
import Swal from 'sweetalert2';
import './HomePage.css';

const HomePage = () => {
  const { userId, logout } = useContext(AuthContext);
  const { getStateNameById, debtStates } = useDebtStates();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedDebt, setSelectedDebt] = useState(null);

  // Redirect to login if no userId
  useEffect(() => {
    if (!userId) {
      navigate('/login');
    }
  }, [userId, navigate]);

  const fetchDebts = async () => {
    if (!userId) return;
    try {
      // Try using POST instead of GET with body
      const response = await apiClient.post('/debts', {
        userId: parseInt(userId)
      });
      setDebts(response.data);
    } catch (err) {
      setError('Failed to load debts');
      console.error('Error fetching debts:', err);
      Swal.fire({
        icon: 'error',
        title: 'Connection Error',
        text: 'Unable to load your debts. Please try again later.',
      });
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    setLoading(true);
    fetchDebts();
  }, [userId]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleOpenAddModal = () => {
    setModalMode('add');
    setSelectedDebt(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (debt) => {
    setModalMode('edit');
    setSelectedDebt(debt);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDebt(null);
  };

  const handleDebtSuccess = () => {
    fetchDebts();
  };

  const handleDeleteDebt = async (e, debtId) => {
    e.stopPropagation();
    
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const response = await apiClient.delete(`/debts/delete`, {
          data: {
            userId: parseInt(userId),
            id: parseInt(debtId)
          }
        });
        Swal.fire('Successfully deleted!', response.data.message, 'success');
        fetchDebts();
      } catch (err) {
        console.error('Error deleting debt:', err);
        Swal.fire('Error!', 'Failed to delete debt.', 'error');
      }
    }
  };

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
    <div className="home-container">
      {/* User Panel - Sidebar */}
      <div className="user-panel">
        <div className="user-info">
          <h2>Welcome, User {userId}</h2>
          <p>Your debt management dashboard</p>
        </div>
        <div className="user-actions">
          <button onClick={toggleTheme} className="theme-toggle-btn" title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}>
            {isDarkMode ? '☀️' : '🌙'}
          </button>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Debts Section */}
        <div className="debts-section">
          <h3>Your Debts</h3>

          {loading && <p className="loading">Loading debts...</p>}

          {error && <p className="error">{error}</p>}

          {!loading && !error && debts.length === 0 && (
            <p className="no-debts">No debts found. You're all caught up!</p>
          )}

          {!loading && !error && debts.length > 0 && (
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
                    <tr key={debt.id} onClick={() => handleOpenEditModal(debt)}>
                      <td className="debt-id" data-label="ID">#{debt.id}</td>
                      <td className="debt-amount" data-label="Amount">{formatCurrency(debt.amount)}</td>
                      <td data-label="Date">{formatDate(debt.creation_date)}</td>
                      <td data-label="Status">
                        <span className={`status status-${getStateNameById(debt.state_id)?.toLowerCase().replace(' ', '-') || 'unknown'}`}>
                          {getStateNameById(debt.state_id) || 'Unknown'}
                        </span>
                      </td>
                      <td data-label="Actions">
                        <button 
                          className="delete-btn" 
                          onClick={(e) => handleDeleteDebt(e, debt.id)}
                          title="Delete debt"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Reused Debt Modal */}
      <DebtModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        mode={modalMode}
        debtData={selectedDebt}
        onSuccess={handleDebtSuccess}
        debtStates={debtStates}
      />

      {/* Floating Add Debt Button */}
      <button onClick={handleOpenAddModal} className="floating-add-btn" title="Add new debt">
        ➕
      </button>
    </div>
  );
};

export default HomePage;
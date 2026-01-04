import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useDebtStates } from '../../context/DebtStatesContext';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/apiClient';
import DebtModal from '../../components/DebtModal';
import DebtTable from '../../components/DebtTable';
import DebtDetailModal from '../../components/DebtDetailModal';
import Swal from 'sweetalert2';
import './HomePage.css';

const HomePage = () => {
  const { userId, logout, userEmail } = useContext(AuthContext);
  const { debtStates } = useDebtStates();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedDebt, setSelectedDebt] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedFilterState, setSelectedFilterState] = useState(null);

  // Redirect to login if no userId
  useEffect(() => {
    if (!userId) {
      navigate('/login');
    }
  }, [userId, navigate]);

  const fetchDebts = async (stateId = null) => {
    if (!userId) return;
    setLoading(true);
    try {
      const requestBody = {
        userId: parseInt(userId),
      };
      if (stateId) {
        requestBody.stateId = stateId;
      }
      const response = await apiClient.post('/debts', requestBody);
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
    fetchDebts(selectedFilterState);
  }, [userId, selectedFilterState]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleOpenAddModal = () => {
    setModalMode('add');
    setSelectedDebt(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (e, debt) => {
    e.stopPropagation();
    setModalMode('edit');
    setSelectedDebt(debt);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDebt(null);
  };

  const handleOpenDetailModal = (debt) => {
    setSelectedDebt(debt);
    setIsDetailOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailOpen(false);
    setSelectedDebt(null);
  };

  const handleDebtSuccess = () => {
    fetchDebts(selectedFilterState);
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
        fetchDebts(selectedFilterState);
      } catch (err) {
        console.error('Error deleting debt:', err);
        Swal.fire('Error!', 'Failed to delete debt.', 'error');
      }
    }
  };

  return (
    <div className="home-container">
      {/* User Panel - Sidebar */}
      <div className="user-panel">
        <div className="user-info">
          <h2>Welcome, User {userEmail}</h2>
          <p>Your debt management dashboard</p>
        </div>
        <div className="user-actions">
          <button onClick={toggleTheme} className="theme-toggle-btn" title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}>
            {isDarkMode ? 'Light Mode ☀️' : 'Dark Mode 🌙'}
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

          {/* Filter Section */}
          <div className="filter-section">
            <label htmlFor="state-filter">Filter by Status:</label>
            <select
              id="state-filter"
              value={selectedFilterState || ''}
              onChange={(e) => setSelectedFilterState(e.target.value ? parseInt(e.target.value) : null)}
              className="filter-select"
            >
              <option value="">All</option>
              {debtStates.map((state) => (
                <option key={state.id} value={state.id}>
                  {state.state_name}
                </option>
              ))}
            </select>
          </div>

          <DebtTable
            debts={debts}
            loading={loading}
            error={error}
            onEdit={handleOpenEditModal}
            onDelete={handleDeleteDebt}
            onViewDetails={handleOpenDetailModal}
          />
        </div>
      </div>

      {/* Reused Debt Modal */}
      <DebtModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        mode={modalMode}
        debtData={selectedDebt}
        onSuccess={handleDebtSuccess}
      />

      {/* Detail View Modal */}
      <DebtDetailModal
        isOpen={isDetailOpen}
        onClose={handleCloseDetailModal}
        debt={selectedDebt}
        onEdit={handleOpenEditModal}
        onDelete={handleDeleteDebt}
      />

      {/* Floating Add Debt Button */}
      <button onClick={handleOpenAddModal} className="floating-add-btn" title="Add new debt">
        ➕
      </button>
    </div>
  );
};

export default HomePage;
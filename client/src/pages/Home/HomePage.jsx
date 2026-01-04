import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useDebtStates } from '../../context/DebtStatesContext';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/apiClient';
import DebtModal from '../../components/DebtModal';
import DebtTable from '../../components/DebtTable';
import DebtsAggregations from '../../components/DebtsAggregations';
import DebtDetailModal from '../../components/DebtDetailModal';
import Swal from 'sweetalert2';
import './HomePage.css';
import TopNavbar from '../../components/TopNavBar';

const HomePage = () => {
  const { userId, logout, userEmail } = useContext(AuthContext);
  const { debtStates } = useDebtStates();
  const navigate = useNavigate();
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedDebt, setSelectedDebt] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedFilterState, setSelectedFilterState] = useState(null);
  const [showAggregations, setShowAggregations] = useState(false);
  const [aggregations, setAggregations] = useState([]);

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
      setError('Failed to load debts: '+err.message);
      Swal.fire({
        icon: 'error',
        title: 'Connection Error',
        text: 'Unable to load your debts. Please try again later.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportDebts = () => {
    if (!userId) return;
    setLoading(true);
    apiClient.post(`/debts/JSON`,{userId: parseInt(userId)})
      .then((response) => {
        const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.style = 'display: none;';
        a.download = 'user-debts-data.json';
        document.body.appendChild(a);
        Swal.fire({
          icon: 'question',
          title: 'Export Confirmation',
          text: 'Are you sure you want to export your debts in JSON format?',
          showCancelButton: true,
          confirmButtonText: 'Yes, export it!',
          cancelButtonText: 'Cancel'
          }).then((result) => {
            if (result.isConfirmed) {
              a.click();
              Swal.fire({
                icon: 'success',
                title: 'Export Successful',
                text: 'Your debts have been successfully exported.',
              });
            } else {
              Swal.fire({
                icon: 'info',
                title: 'Export Cancelled',
                text: 'Your debts export has been cancelled.',
              });
            }
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
          });
      })
      .catch((err) => {
        console.error('Error exporting debts:', err);
        Swal.fire({
          icon: 'error',
          title: 'Export Error',
          text: 'Unable to export your debts. Please try again later.',
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const fetchAggregations = async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post(`/debts/state_amounts`,{userId: parseInt(userId)});
      setAggregations(response.data);
    } catch (err) {
      setError('Failed to load aggregations: '+err.message);
      Swal.fire({
        icon: 'error',
        title: 'Connection Error',
        text: 'Failed to get aggregations',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShowAggregations = () => {
    setShowAggregations(prev => !prev);
    fetchAggregations();
  };


  useEffect(() => {
    fetchDebts(selectedFilterState);
  }, [userId, selectedFilterState]);

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
  };

  const handleOpenDetailModal = (debt) => {
    setSelectedDebt(debt);
    setIsDetailOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailOpen(false);
  };

  const handleDebtSuccess = () => {
    fetchDebts(selectedFilterState);
  };

  const handleDeleteDebt = async (e, debt) => {
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
            stateId: parseInt(debt.state_id),
            id: parseInt(debt.id)
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
      <TopNavbar 
        handleShowAggregations={handleShowAggregations}
        handleExportDebts={handleExportDebts}
        showAggregations={showAggregations}
      />

      {/* Main Content */}
      <div className="main-content">
        {/* Debts Section */}
        <div className="debts-section">
          {
            showAggregations &&
            <h3>Debt Amounts by State</h3>
          }
          {
            !showAggregations &&
            <h3>Your Debts</h3>
          }

          { showAggregations && 
            <DebtsAggregations 
              aggregations={aggregations}
              loading={loading}
              error={error}
              debtStates={debtStates}
            />
          }
          { !showAggregations &&
            /* Filter Section */
            <>
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
            </>
          }
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
import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import './TopNavbar.css';


const TopNavbar = (props) => {
    const { userEmail, logout } = useContext(AuthContext);
    const { isDarkMode, toggleTheme } = useTheme();
    const showAggregations = props.showAggregations;
    const [isMenuOpen, setIsMenuOpen] = useState(true);

    const handleShowAggregations = () => {
        props.handleShowAggregations();
    };
    const handleExportDebts = () => {
        props.handleExportDebts();
    };
    const handleLogout = () => {
        logout();
    };

    const handleMenu = () => {
        setIsMenuOpen(prev => !prev);
    };

    return (
        <div className={"user-panel" + (isMenuOpen ? ' show' : '')}>
            <div className="user-info">
                <h2>Welcome, User {userEmail}</h2>
                <p>Your debt management dashboard</p>
                <button onClick={handleShowAggregations} className="user-panel-btn">
                    { showAggregations ? 'Show Debts Table' : 'Show Debt Amounts by State' }
                </button>
                <button onClick={handleExportDebts} className="user-panel-btn">
                    Export debts in JSON
                </button>
            </div>
            <div className="user-actions">
                <button onClick={toggleTheme} className="theme-toggle-btn" title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}>
                    {isDarkMode ? 'Light Mode ☀️' : 'Dark Mode 🌙'}
                </button>
                <button onClick={handleLogout} className="logout-btn">
                    Logout
                </button>
            </div>
            <div className='ham-menu' onClick={handleMenu}>
                <div className='bar'></div>
                <div className='bar'></div>
                <div className='bar'></div>
            </div>
        </div>
    );
};

export default TopNavbar;
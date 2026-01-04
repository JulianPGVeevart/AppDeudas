import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import apiClient from '../../services/apiClient';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

const LoginPage = () => {
  const { login, userId } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect to home if user is already logged in
  useEffect(() => {
    if (userId) {
      navigate('/debts');
    }
  }, [userId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if(isLogin ) {
      handleLogin();
    } else {
      handleRegister();
    }
  };

  const handleLogin = async () => {
    try {
      const response = await apiClient.post('/login', { email, password });
      if (response.data.id) {
        login(response.data);
        navigate('/debts'); // Navigate to home page after successful login
      }
    } catch (err) {
      setError('Login failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      const response = await apiClient.post('/register', { email, password });
      if(response.data.id) {
        login(response.data); // Navigate to home page after successful register
        navigate('/debts');
      }
    } catch (err) {
      if(err.response.data.message) {
        setError(err.response.data.message);
        return;
      }
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const isLogin = window.location.pathname === '/login';
  const loginWord = isLogin ? 'Login' : 'Register';
  const loadingWord = isLogin ? 'Logging in...' : 'Registering...';

  return (
    <div className="login-container">
      <div className="login-content">
        <h1 className="login-title">App Deudas</h1>
        
        <h2 className="login-title">{ loginWord }</h2>
        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="login-input"
            disabled={loading}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="login-input"
            disabled={loading}
          />

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? loadingWord : loginWord}
          </button>

          {isLogin && (
            <div className="register-link">
              <p>Don't have an account?</p>
              <a href="/register">Register</a>
            </div>
          )}
          {!isLogin && (
              <div className="register-link">
                <p>Already have an account?</p>
                <a href="/login">Login</a>
              </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default LoginPage;

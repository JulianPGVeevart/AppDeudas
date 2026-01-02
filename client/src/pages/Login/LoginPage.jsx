import { useState } from 'react';
import './LoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle login logic here
    console.log('Login attempt:', { email, password });
  };
  
  const isLogin = window.location.pathname === '/login';
  const loginWord = isLogin ? 'Login' : 'Register';

  return (
    <div className="login-container">
      <div className="login-content">
        <h1 className="login-title">App Deudas</h1>
        
        <h2 className="login-title">{ loginWord }</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="login-input"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="login-input"
          />

          <button
            type="submit"
            className="login-button"
          >
            {loginWord}
          </button>

          {isLogin && (
            <div className="register-link">
              <p>Don't have an account?</p>
              <a href="/register">Register</a>
            </div>
           )}
        </form>
      </div>
    </div>
  );
};

export default LoginPage;

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../images/logoit.png';
import { authAPI } from '../services/api';
import '../styles/login.css';

const LoginScreen = () => {
  const [username,     setUsername]     = useState('');
  const [password,     setPassword]     = useState('');
  const [error,        setError]        = useState('');
  const [loading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const data = await authAPI.login(username, password);
    localStorage.setItem('lastLogin', new Date().toISOString());
    localStorage.setItem('adminUsername', data.username);
    sessionStorage.setItem('sessionStarted', 'true');
    navigate('/dashboard');
  } catch (err) {
    setError(err.message || 'Invalid username or password');
  }
};

  // ── Eye SVG icons ──────────────────────────────────────────────────────────
  const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );

  const EyeOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );

  return (
    <section className="login-screen">
      <section className="login-container">

        {/* Logo & Title */}
        <section className="logo-section">
          <img src={logo} alt="VaxFlow Logo" className="logo" />
          <section className="title-section">
            <h1 className="system-title">VaxFlow</h1>
            <p className="system-subtitle">
              A Machine Learning Assisted Vaccine Management System
            </p>
          </section>
        </section>

        <h2 className="login-heading">LOG IN</h2>
        <p className="system-subtitle">Input admin credentials to continue</p>

        <form onSubmit={handleLogin}>

          <section className="input-container">
            <label htmlFor="username" className="input-label">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              placeholder="Username"
              className="input-field"
              disabled={loading}
            />
          </section>

          <section className="input-container">
            <label htmlFor="password" className="input-label">Password</label>
            <section className="login-password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="Password"
                className="input-field"
                disabled={loading}
              />
              <button
                type="button"
                className="login-eye-btn"
                onClick={() => setShowPassword(prev => !prev)}
                title={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </section>
          </section>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Logging in...' : 'Log In'}
          </button>

        </form>

        <section className="auth-links">
          <Link to="#forgot-password" className="auth-link">
            Forgot Password?
          </Link>
        </section>

      </section>
    </section>
  );
};

export default LoginScreen;
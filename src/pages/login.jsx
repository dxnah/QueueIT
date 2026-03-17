// login.jsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../images/logoit.png';
import { authData } from '../data/dashboardData';
import '../styles/login.css';

const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // ── Get credentials (localStorage overrides default from dashboardData) ──
  const getStoredUsername = () =>
    localStorage.getItem('adminUsername') || authData.defaultUsername;

  const getStoredPassword = () =>
    localStorage.getItem('adminPassword') || authData.defaultPassword;

  // ── HANDLERS ──
  const handleLogin = (e) => {
    e.preventDefault();
    if (username === getStoredUsername() && password === getStoredPassword()) {
      // ── Stamp login timestamp & start a fresh session ──
      localStorage.setItem('lastLogin', new Date().toISOString());
      sessionStorage.setItem('sessionStarted', 'true');
      navigate('/dashboard');
    } else {
      setError('Invalid username or password');
    }
  };

  const simulateFormFill = () => {
    setUsername(getStoredUsername());
    setPassword(getStoredPassword());
    setError('');
  };

  // ── Eye SVG icons ──
  const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );

  const EyeOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
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

        {/* Heading */}
        <h2 className="login-heading">LOG IN</h2>
        <p className="system-subtitle">Input admin credentials to continue</p>

        {/* Form */}
        <form onSubmit={handleLogin}>

          {/* Username */}
          <section className="input-container">
            <label htmlFor="username" className="input-label">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Username"
              className="input-field"
            />
          </section>

          {/* Password with eye toggle */}
          <section className="input-container">
            <label htmlFor="password" className="input-label">
              Password
            </label>
            <section className="login-password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Password"
                className="input-field"
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

          <button type="submit" className="login-button">
            Log In
          </button>

        </form>

        <Link className="simulate-link" onClick={simulateFormFill}>
          Simulate Log In
        </Link>

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
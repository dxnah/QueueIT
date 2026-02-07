// login

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../images/logoit.png'; 

const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {   
    e.preventDefault();

    if (username === 'admin' && password === 'pass1') {
      navigate('/dashboard'); 
    } else {
      setError('Invalid username or password');  
    }
  };


  const styles = {
    body: {
      fontFamily: "'Arial', sans-serif",
      margin: 0,
      padding: 0,
      backgroundColor: "#f8f8f8",
    },
    loginScreen: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#e6f4f1', 
    },
    loginContainer: {
    backgroundColor: 'white',
    padding: '36px 32px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
    width: '100%',
    maxWidth: '420px',
    },
    logo: {
      width: '120px',
      marginBottom: '18px',
    },
    heading: {
      margin: '10px 0',
      fontSize: '24px',
      color: '#333',
    },
    paragraph: {
      color: '#000000',
      marginBottom: '20px',
      fontSize: '16px',
    },
    inputContainer: {
      marginBottom: '20px',
      textAlign: 'left',
    },
    label: {
      display: 'block',
      fontWeight: 'bold',
      marginBottom: '5px',
    },
    input: {
      width: '100%',
      padding: '12px',
      border: '1px solid #ccc',
      borderRadius: '8px',
      fontSize: '16px',
      marginBottom: '15px',
      boxSizing: 'border-box',
    },
    button: {
      backgroundColor: '#24886E',
      color: 'white',
      border: 'none',
      padding: '12px 20px',
      cursor: 'pointer',
      borderRadius: '8px',
      width: '100%',
      fontSize: '16px',
      boxSizing: 'border-box',
    },
    buttonHover: {
      backgroundColor: '#45a049',
    },
    authLinks: {
      marginTop: '15px',
    },
    authLink: {
      color: '#24886E',
      textDecoration: 'none',
      margin: '5px 0',
      display: 'inline-block',
    },
    errorMessage: {
      color: 'red',
      fontSize: '14px',
      marginTop: '10px',
    },
  };

  return (
    <div style={styles.loginScreen}>
      <div style={styles.loginContainer}>
        <img src={logo} alt="QueueIT Logo" style={styles.logo} />
        <h2 style={styles.heading}>Log in</h2>
        <p style={styles.paragraph}>Input credentials to continue</p>

        <form onSubmit={handleLogin}>
          <div style={styles.inputContainer}>
            <label htmlFor="username" style={styles.label}>Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="juandlc"
              style={styles.input}
            />
          </div>

          <div style={styles.inputContainer}>
            <label htmlFor="password" style={styles.label}>Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Jdlc@123"
              style={styles.input}
            />
          </div>

          {error && <p style={styles.errorMessage}>{error}</p>}

          <button type="submit" style={styles.button}>
            Log In
          </button>
        </form>

        <div style={styles.authLinks}>
          Don't have an account? 
          <Link to="/signup" style={styles.authLink}>Sign up</Link>
          <span style={{ marginLeft: 12, marginRight: 12 }}> | </span>
          <Link to="/forgot-password" style={styles.authLink}>Forgot Password?</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;

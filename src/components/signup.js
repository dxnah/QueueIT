// signup 

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../images/logoit.png'; 

const SignUpScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignUp = (e) => {
    e.preventDefault();

    console.log('User signed up:', { username, password });
    navigate('/login'); 
  };

  const styles = {
    body: {
      fontFamily: "'Arial', sans-serif",
      margin: 0,
      padding: 0,
      backgroundColor: "#f8f8f8",
    },
    signupScreen: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#e6f4f1',
    },
    signupContainer: {
      backgroundColor: 'white',
      padding: '40px 30px',
      borderRadius: '10px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
      textAlign: 'center',
      width: '100%',
      maxWidth: '400px',
      boxSizing: 'border-box',
    },
    logo: {
      width: '120px',
      marginBottom: '20px',
    },
    heading: {
      margin: '10px 0',
      fontSize: '24px',
      color: '#333',
    },
    paragraph: {
      color: '#4caf50',
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
      backgroundColor: '#4caf50',
      color: 'white',
      border: 'none',
      padding: '12px 20px',
      cursor: 'pointer',
      borderRadius: '8px',
      width: '100%',
      fontSize: '16px',
      boxSizing: 'border-box',
    },
    authLinks: {
      marginTop: '15px',
    },
    authLink: {
      color: '#4caf50',
      textDecoration: 'none',
      margin: '5px 0',
      display: 'inline-block',
      fontSize: '14px',
    },
    errorMessage: {
      color: 'red',
      fontSize: '14px',
      marginTop: '10px',
    },
  };

  return (
    <div style={styles.signupScreen}>
      <div style={styles.signupContainer}>
        <img src={logo} alt="QueueIT Logo" style={styles.logo} />
        <h2 style={styles.heading}>Sign Up</h2>
        <p style={styles.paragraph}>A Machine Learning Assisted Queue Management System</p>

        <form onSubmit={handleSignUp}>
          <div style={styles.inputContainer}>
            <label htmlFor="username" style={styles.label}>Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Enter Username"
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
              placeholder="Enter Password"
              style={styles.input}
            />
          </div>

          <button type="submit" style={styles.button}>Sign Up</button>
        </form>

        <div style={styles.authLinks}>
          Already have an account? 
          <Link to="/login" style={styles.authLink}>Log in</Link>
        </div>
      </div>
    </div>
  );
};

export default SignUpScreen;

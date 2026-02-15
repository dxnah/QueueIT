// Login.js 

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../images/logoit.png'; 

const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {   
    e.preventDefault();

    if (username === 'admin' && password === 'pass1') {
      navigate('/dashboard'); 
    } else {
      setError('Invalid username or password');  
    }
  };

  const simulateFormFill = () => {
    setUsername('admin'); 
    setPassword('pass1');  
    setError('');          
  };

  return (
    <div style={styles.loginScreen}>
      <div style={styles.loginContainer}>

        <div style={styles.logoSection}>
          <img src={logo} alt="QueueIT Logo" style={styles.logo} />
          <div style={styles.titleSection}>
          <h1 style={styles.systemTitle}>QueueIT</h1>
          <p style={styles.systemSubtitle}>A Machine Learning Assisted Queue Management System</p>
          </div>
        </div>

        <h2 style={styles.loginHeading}>LOG IN</h2>
        <p style={styles.systemSubtitle}>Input admin credentials to continue</p>
        
        <form onSubmit={handleLogin}>
          <div style={styles.inputContainer}>
          <label htmlFor="username" style={styles.label}>
            Username
          </label>
          <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="admin"
              style={styles.input}/>
          </div>

          <div style={styles.inputContainer}>
          <label htmlFor="password" style={styles.label}>
            Password
          </label>
          <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Password@123"
              style={styles.input}/>
          </div>

          {error && <p style={styles.errorMessage}>{error}</p>}

          <button 
            type="submit" 
            style={isButtonHovered ? {...styles.button, ...styles.buttonHover} : styles.button}
            onMouseEnter={() => setIsButtonHovered(true)}
            onMouseLeave={() => setIsButtonHovered(false)}>
          Log In
          </button>
        </form>

          <Link 
           style={styles.authLink} 
           onClick={simulateFormFill}>
          Simulate Log In
          </Link>

          <div style={styles.authLinks}>
            <Link to="#forgot-password" style={styles.authLink}>
          Forgot Password?</Link>
          </div>

      </div>
    </div>
  );
}

const styles = {
  loginScreen: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#e6f4f1',
    padding: '20px',
  },
  loginContainer: {
    backgroundColor: 'white',
    padding: '40px 32px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
    width: '100%',
    maxWidth: '420px',
  },
  logoSection: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    gap: '15px',
    marginBottom: '30px',
    textAlign: 'left',
  },
  logo: {
    width: '80px',
    height: '80px',
    objectFit: 'contain',
    flexShrink: 0,
  },
  titleSection: {
    flex: 1,
    textAlign: 'left',
  },
  systemTitle: {
    margin: '0 0 5px 0',
    fontSize: '20px',
    fontWeight: '600',
  },
  systemSubtitle: {
    margin: '0',
    fontSize: '12px',
    lineHeight: '1.4',
    fontWeight: 'normal',
  },
  loginHeading: {
    margin: '-30px 0 20px 0',
    fontSize: '18px',
    color: '#333',
    fontWeight: '600',
    letterSpacing: '1px',
    textAlign: 'center',
    marginBottom: '5px',
  },
  inputContainer: {
    marginBottom: '20px',
    textAlign: 'left',
  },
  label: {
    display: 'block',
    fontWeight: '600',
    marginBottom: '8px',
    color: '#333',
    fontSize: '14px',
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '2px solid #e0e0e0',
    borderRadius: '6px',
    fontSize: '14px',
    boxSizing: 'border-box',
    transition: 'border-color 0.3s',
  },
  button: {
    backgroundColor: '#24886E',
    color: 'white',
    border: 'none',
    padding: '14px 20px',
    cursor: 'pointer',
    borderRadius: '6px',
    width: '100%',
    fontSize: '16px',
    fontWeight: '600',
    boxSizing: 'border-box',
    transition: 'all 0.3s ease',
    transform: 'scale(1)',
    marginBottom: '15px',
  },
  buttonHover: {
    backgroundColor: '#1a5f4f',
    transform: 'scale(1.02)',
    boxShadow: '0 4px 15px rgba(36, 136, 110, 0.4)',
  },
  authLinks: {
    marginTop: '10px',
    fontSize: '14px',
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '5px',
  },
  authText: {
    color: '#666',
  },
  authLink: {
    marginTop: '5px',
    marginBottom: '-15px',
    color: '#24886E',
    fontSize: '14px',
    textDecoration: 'none',
    fontWeight: '600',
  },
  separator: {
    color: '#ccc',
    margin: '0 5px',
  },
  errorMessage: {
    color: '#c33',
    backgroundColor: '#fee',
    padding: '10px',
    borderRadius: '6px',
    fontSize: '14px',
    marginBottom: '15px',
    border: '1px solid #fcc',
  },  
};

const styleSheet = document.createElement("style");
styleSheet.innerText = `
  @media (max-width: 480px) {
    .login-container {
      padding: 30px 20px !important;
    }
    
    .logo-section {
      align-items: center !important;
    }
    
    .logo {
      width: 60px !important;
      height: 60px !important;
    }
    
    .system-title {
      font-size: 16px !important;
    }
    
    .system-subtitle {
      font-size: 10px !important;
    }
    
    .auth-links {
      flex-direction: column !important;
      gap: 8px !important;
    }
    
    .auth-links span {
      display: none;
    }
  }

  @media (max-width: 360px) {
    .login-container {
      padding: 25px 15px !important;
    }
    
    .logo {
      width: 50px !important;
      height: 50px !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default LoginScreen;
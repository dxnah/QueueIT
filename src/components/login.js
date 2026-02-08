// login

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

    if (username === 'admin' && password === 'pass') {
      navigate('/dashboard'); 
    } else {
      setError('Invalid username or password');  
    }
  };

  return (
    <div style={styles.loginScreen}>
      <div style={styles.loginContainer}>
        <img src={logo} alt="QueueIT Logo" style={styles.logo} />
        <h5 style={styles.heading}>Welcome to QueueIT</h5>

        <h1 style={styles.heading}>Log in</h1>
        <p style={styles.paragraph}>Input admin credentials to continue</p>

        <form onSubmit={handleLogin}>
          <div style={styles.inputContainer}>
            <label htmlFor="username" style={styles.label}>Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="admin"
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
              placeholder="pass"
              style={styles.input}
            />
          </div>

          {error && <p style={styles.errorMessage}>{error}</p>}

          <button 
            type="submit" 
            style={isButtonHovered ? {...styles.button, ...styles.buttonHover} : styles.button}
            onMouseEnter={() => setIsButtonHovered(true)}
            onMouseLeave={() => setIsButtonHovered(false)}
          >
            Log In
          </button>
        </form>

        <div style={styles.authLinks}>
          Don't have an account? 
          <span style={{ marginLeft: 5, marginRight: 5 }}></span>
          <Link to="/signup" style={styles.authLink}>Sign up</Link>
          <span style={{ marginLeft: 12, marginRight: 12 }}> | </span>
          <Link to="#forgot-password" style={styles.authLink}>Forgot Password?</Link>
        </div>

        <div style={styles.footer}>
          <p><Link to="#terms-of-use" style={styles.authLink}>Terms of Use</Link>   
            <span style={{ marginLeft: 12, marginRight: 12 }}> | </span>
          <Link to="#privacy-policy" style={styles.authLink}>Privacy Policy</Link></p>
        </div>
      </div>
    </div>
  );
}

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
  transition: 'all 0.3s ease',
  transform: 'scale(1)',
},
buttonHover: {
  backgroundColor: '#1a5f4f',
  transform: 'scale(1.02)',
  boxShadow: '0 4px 15px rgba(36, 136, 110, 0.4)',
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
  
    '@media (max-width: 768px)': {
    container: {
      flexDirection: 'column',
    },
    sidebar: {
      width: '100%',
      height: 'auto',
      position: 'relative',
    },
    mainContent: {
      padding: '20px',
    },
    navLink: {
      padding: '10px 15px',
      fontSize: '12px',
    },
    statsContainer: {
      flexDirection: 'column',
      gap: '10px',
    },
  },

};

export default LoginScreen;

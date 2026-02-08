// signup 

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../images/logoit.png'; 

const SignUpScreen = () => {
  const [username, setUsername] = useState('');
  const [fullname, setFullname] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignUp = (e) => {
    e.preventDefault();
    console.log('User signed up:', { username, fullname, password });
    navigate('/login'); 
  };

  return (
    <div style={styles.signupScreen}>
      <div style={styles.signupContainer}>
        <img src={logo} alt="QueueIT Logo" style={styles.logo} />
        <h2 style={styles.heading}>Sign Up</h2>
        <p style={styles.paragraph}>Input credentials to create an account</p>

        <form onSubmit={handleSignUp}>

          <div style={styles.inputContainer}>
            <label htmlFor="username" style={styles.label}>Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="jdlc123"
              style={styles.input}
            />
          </div>


          <div style={styles.inputContainer}>
            <label htmlFor="fullname" style={styles.label}>Full Name</label>
            <input
              type="text"
              id="fullname"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              required
              placeholder="Juan de la Cruz"
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

const styles = {
  signupScreen: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#e6f4f1',
  },
  signupContainer: {
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
    marginBottom: '10px',
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
    marginBottom: '10px',
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
  authLinks: {
    marginTop: '15px',
  },
  authLink: {
    color: '#24886E',
    textDecoration: 'none',
    margin: '5px 0',
    display: 'inline-block',
  },
};

export default SignUpScreen;

// splash

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../images/logoit.png'; 

const SplashScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => {
      navigate('/login'); 
    }, 5000);
    return () => clearTimeout(t);
  }, [navigate]);

  const splashScreenStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',  
    backgroundColor: '#e6f4f1',  
  };

  const logoStyle = {
    maxWidth: '220px',  
    width: '100%',      
  };

  return (
    <div style={splashScreenStyle}>
      <img src={logo} alt="QueueIT Logo" style={logoStyle} />
    </div>
  );
};

export default SplashScreen;

// Sidebar.jsx

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../images/logoit.png';

const Sidebar = ({ isMobileMenuOpen, onMenuClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const handleNavClick = (path) => {
    navigate(path);
    if (onMenuClose) onMenuClose();
  };

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div className={isMobileMenuOpen ? 'sidebar active' : 'sidebar'}>
      
      <div className="logo-container">
        <img src={logo} alt="QueueIT Logo" className="sidebar-logo" />
      </div>

      <nav className="nav">
        <button
          className={isActive('/dashboard') ? 'nav-link nav-link-active' : 'nav-link'}
          onClick={() => handleNavClick('/dashboard')}>
          📊 DASHBOARD
        </button>

        <button
          className={isActive('/vaccine') ? 'nav-link nav-link-active' : 'nav-link'}
          onClick={() => handleNavClick('/vaccine')}>
          💉 VACCINE MANAGEMENT
        </button>

        <button
          className={isActive('/reports') ? 'nav-link nav-link-active' : 'nav-link'}
          onClick={() => handleNavClick('/reports')}>
          📈 REPORTS
        </button>

        <button
          className={isActive('/notifications') ? 'nav-link nav-link-active' : 'nav-link'}
          onClick={() => handleNavClick('/notifications')}>
          🔔 NOTIFICATIONS
        </button>

        <button
          className={isActive('/settings') ? 'nav-link nav-link-active' : 'nav-link'}
          onClick={() => handleNavClick('/settings')}>
          ⚙️ SETTINGS
        </button>

        <button className="nav-link logout-btn" onClick={handleLogout}>
          🚪 LOGOUT
        </button>
      </nav>

    </div>
  );
};

export default Sidebar;
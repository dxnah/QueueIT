// Sidebar.jsx

import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { NotificationsContext } from '../pages/notifications';
import logo from '../images/logoit.png';

const Sidebar = ({ isMobileMenuOpen, onMenuClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const context = useContext(NotificationsContext);
  const unreadCount = context?.unreadCount ?? 0;
  const isActive = (path) => location.pathname === path;

  const handleNavClick = (path) => {
    navigate(path);
    if (onMenuClose) onMenuClose();
  };

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <aside className={isMobileMenuOpen ? 'sidebar active' : 'sidebar'}>

      <header className="logo-container">
        <img src={logo} alt="VaxFlow - Vaccine Management System Logo" className="sidebar-logo" />
        <h1 className="sidebar-title">VaxFlow</h1>
      </header>

      <nav className="nav">
        <button
          type="button"
          className={isActive('/dashboard') ? 'nav-link nav-link-active' : 'nav-link'}
          onClick={() => handleNavClick('/dashboard')}
          aria-current={isActive('/dashboard') ? 'page' : undefined}>
          📊 DASHBOARD
        </button>

        <button
          type="button"
          className={isActive('/vaccine') ? 'nav-link nav-link-active' : 'nav-link'}
          onClick={() => handleNavClick('/vaccine')}
          aria-current={isActive('/vaccine') ? 'page' : undefined}>
          💉 VACCINE MANAGEMENT
        </button>

        {/* ✅ NEW — Demand Forecast page */}
        <button
          type="button"
          className={isActive('/demand-forecast') ? 'nav-link nav-link-active' : 'nav-link'}
          onClick={() => handleNavClick('/demand-forecast')}
          aria-current={isActive('/demand-forecast') ? 'page' : undefined}>
          🤖 DEMAND FORECAST
        </button>

        <button
          type="button"
          className={isActive('/reports') ? 'nav-link nav-link-active' : 'nav-link'}
          onClick={() => handleNavClick('/reports')}
          aria-current={isActive('/reports') ? 'page' : undefined}>
          📈 REPORTS
        </button>

        <button
          type="button"
          className={isActive('/notifications') ? 'nav-link nav-link-active' : 'nav-link'}
          onClick={() => handleNavClick('/notifications')}
          aria-current={isActive('/notifications') ? 'page' : undefined}>
          🔔 NOTIFICATIONS{unreadCount > 0 && (
            <span className="notif-badge">{unreadCount}</span>
          )}
        </button>

        <button
          type="button"
          className={isActive('/settings') ? 'nav-link nav-link-active' : 'nav-link'}
          onClick={() => handleNavClick('/settings')}
          aria-current={isActive('/settings') ? 'page' : undefined}>
          ⚙️ SETTINGS
        </button>

        <button type="button" className="nav-link logout-btn" onClick={handleLogout}>
          🚪 LOGOUT
        </button>
      </nav>

    </aside>
  );
};

export default Sidebar;
// Sidebar.jsx

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
    sessionStorage.removeItem('sessionStarted');
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
          className={isActive('/patientmanagement') ? 'nav-link nav-link-active' : 'nav-link'}
          onClick={() => handleNavClick('/patientmanagement')}
          aria-current={isActive('/patientmanagement') ? 'page' : undefined}>
          🧑‍⚕️ PATIENT MANAGEMENT
        </button>

        <button
          type="button"
          className={isActive('/settings') ? 'nav-link nav-link-active' : 'nav-link'}
          onClick={() => handleNavClick('/settings')}
          aria-current={isActive('/settings') ? 'page' : undefined}>
          ⚙️ SETTINGS
        </button>
      </nav>

      <button type="button" className="nav-link logout-btn" onClick={handleLogout}>
        🚪 LOGOUT
      </button>

    </aside>
  );
};

export default Sidebar;
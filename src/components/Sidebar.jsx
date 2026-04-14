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

  return (
    <aside className={isMobileMenuOpen ? 'sidebar active' : 'sidebar'}>

      <header className="logo-container">
        <img src={logo} alt="VaxFlow - Vaccine Management System Logo" className="sidebar-logo" />
        <h1 className="sidebar-title">VaxFlow</h1>
      </header>

      <nav className="nav">

        <button type="button"
          className={isActive('/dashboard') ? 'nav-link nav-link-active' : 'nav-link'}
          onClick={() => handleNavClick('/dashboard')}
          aria-current={isActive('/dashboard') ? 'page' : undefined}>
          📊 DASHBOARD
        </button>

        <button type="button"
          className={isActive('/vaccine') ? 'nav-link nav-link-active' : 'nav-link'}
          onClick={() => handleNavClick('/vaccine')}
          aria-current={isActive('/vaccine') ? 'page' : undefined}>
          💉 VACCINE MANAGEMENT
        </button>

        <button type="button"
          className={isActive('/vaccine-orders') ? 'nav-link nav-link-active' : 'nav-link'}
          onClick={() => handleNavClick('/vaccine-orders')}
          aria-current={isActive('/vaccine-orders') ? 'page' : undefined}>
          📦 VACCINE ORDERS
        </button>

        <button type="button"
          className={isActive('/suppliers') ? 'nav-link nav-link-active' : 'nav-link'}
          onClick={() => handleNavClick('/suppliers')}
          aria-current={isActive('/suppliers') ? 'page' : undefined}>
          🏭 SUPPLIERS
        </button>

        <button type="button"
          className={isActive('/demand-forecast') ? 'nav-link nav-link-active' : 'nav-link'}
          onClick={() => handleNavClick('/demand-forecast')}
          aria-current={isActive('/demand-forecast') ? 'page' : undefined}>
          🤖 DEMAND FORECAST
        </button>

        <button type="button"
          className={isActive('/reports') ? 'nav-link nav-link-active' : 'nav-link'}
          onClick={() => handleNavClick('/reports')}
          aria-current={isActive('/reports') ? 'page' : undefined}>
          📈 REPORTS
        </button>

        <button type="button"
          className={isActive('/patientmanagement') ? 'nav-link nav-link-active' : 'nav-link'}
          onClick={() => handleNavClick('/patientmanagement')}
          aria-current={isActive('/patientmanagement') ? 'page' : undefined}>
          🧑 PATIENT MANAGEMENT
        </button>

                <button type="button"
          className={isActive('/announcements') ? 'nav-link nav-link-active' : 'nav-link'}
          onClick={() => handleNavClick('/announcements')}
          aria-current={isActive('/announcements') ? 'page' : undefined}>
          📢 ANNOUNCEMENTS
        </button>

        <button type="button"
          className={isActive('/settings') ? 'nav-link nav-link-active' : 'nav-link'}
          onClick={() => handleNavClick('/settings')}
          aria-current={isActive('/settings') ? 'page' : undefined}>
          ⚙️ SETTINGS
        </button>

      </nav>

      <footer style={{
        padding: '14px',
        background: 'linear-gradient(180deg, #89CBB6 0%, #5ba99a 100%)',
        color: '#fff',
        borderTopLeftRadius: '10px',
        borderTopRightRadius: '10px',
        fontSize: '11px',
        textAlign: 'center',
      }}>
        <div style={{ fontWeight: 'bold', fontSize: '13px' }}>VaxFlow</div>
        <div style={{ opacity: 0.8 }}>ML Vaccine Management System</div>
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.3)', margin: '6px 0' }} />
        <div>© {new Date().getFullYear()} VaxFlow. All rights reserved.</div>
        <div style={{ opacity: 0.7, fontStyle: 'italic' }}>Developed by Group 6</div>
      </footer>

    </aside>
  );
};

export default Sidebar;
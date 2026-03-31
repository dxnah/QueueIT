import React, { useState, useContext, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { NotificationsContext } from '../pages/notifications';

const TopBar = () => {
  const navigate    = useNavigate();
  const location    = useLocation();
  const context     = useContext(NotificationsContext);
  const unreadCount = context?.unreadCount ?? 0;

  const [now,         setNow]         = useState(new Date());
  const [showProfile, setShowProfile] = useState(false);

  const profileRef = useRef(null);

  const adminUsername = localStorage.getItem('adminUsername') || 'Admin';
  const adminEmail    = localStorage.getItem('adminEmail')    || 'admin@vaxflow.com';
  const initials      = adminUsername.slice(0, 2).toUpperCase();
  const isOnProfile   = location.pathname === '/profile';

  // ── Live clock ──
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) =>
    date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const formatDate = (date) =>
    date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="topbar">

      {/* ── Date & Time (replaces search) ── */}
      <div style={{
        display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '2px',
      }}>
        <span style={{ fontSize: '16px', fontWeight: '700', color: '#333', letterSpacing: '0.5px' }}>
          {formatTime(now)}
        </span>
        <span style={{ fontSize: '11px', color: '#999' }}>
          {formatDate(now)}
        </span>
      </div>

      {/* ── Right side ── */}
      <div className="topbar-right">

        {/* Notifications bell */}
        <button type="button" className="topbar-icon-btn"
          onClick={() => navigate('/notifications')} title="Notifications">
          🔔
          {unreadCount > 0 && <span className="topbar-badge">{unreadCount}</span>}
        </button>

        <span style={{ width: '0px' }} /> {/* spacer */}

        {/* ── Avatar + dropdown ── */}
        <div className="topbar-profile-wrap" ref={profileRef}>
          <button type="button"
            className={`topbar-avatar${showProfile ? ' topbar-avatar--open' : ''}`}
            onClick={() => setShowProfile(v => !v)} title="Account">
            {initials}
          </button>

          {showProfile && (
            <div className="topbar-profile-dropdown">
              <div className="topbar-profile-header">
                <div className="topbar-profile-header-avatar">{initials}</div>
                <div className="topbar-profile-header-info">
                  <span className="topbar-profile-header-name">{adminUsername}</span>
                  <span className="topbar-profile-header-email">{adminEmail}</span>
                </div>
              </div>
              <div className="topbar-profile-divider" />
              {!isOnProfile && (
                <button type="button" className="topbar-profile-item"
                  onClick={() => { navigate('/profile'); setShowProfile(false); }}>
                  <span className="topbar-profile-item-icon">👤</span>
                  <span>View Profile</span>
                </button>
              )}
              <button type="button"
                className="topbar-profile-item topbar-profile-item--danger"
                onClick={() => navigate('/login')}>
                <span className="topbar-profile-item-icon">🚪</span>
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopBar;
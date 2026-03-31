// components/TopBar.jsx

import React, { useState, useContext, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { NotificationsContext } from '../pages/notifications';
import { vaccineData, notificationsData } from '../data/dashboardData';

const TopBar = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const context   = useContext(NotificationsContext);
  const unreadCount = context?.unreadCount ?? 0;

  const [searchQuery,   setSearchQuery]   = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch,    setShowSearch]    = useState(false);
  const [showProfile,   setShowProfile]   = useState(false);

  const searchRef  = useRef(null);
  const profileRef = useRef(null);

  const adminUsername = localStorage.getItem('adminUsername') || 'Admin';
  const adminEmail    = localStorage.getItem('adminEmail')    || 'admin@vaxflow.com';
  const initials      = adminUsername.slice(0, 2).toUpperCase();

  const isOnProfile = location.pathname === '/profile';

  // ── Searchable pages ──
  const pages = [
    { label: 'Dashboard',          icon: '📊', path: '/dashboard',       keywords: ['dashboard', 'home', 'overview', 'stats'] },
    { label: 'Vaccine Management', icon: '💉', path: '/vaccine',         keywords: ['vaccine', 'stock', 'inventory', 'doses'] },
    { label: 'Demand Forecast',    icon: '🤖', path: '/demand-forecast', keywords: ['forecast', 'demand', 'ml', 'predict', 'order'] },
    { label: 'Reports',            icon: '📈', path: '/reports',         keywords: ['reports', 'analytics', 'usage', 'data'] },
    { label: 'Suppliers',          icon: '🏭', path: '/suppliers',       keywords: ['suppliers', 'procurement', 'vendor', 'contact'] },
    { label: 'Settings',           icon: '⚙️', path: '/settings',        keywords: ['settings', 'preferences', 'dark mode', 'notifications'] },
    { label: 'Profile',            icon: '👤', path: '/profile',         keywords: ['profile', 'account', 'username', 'password', 'email'] },
    { label: 'Notifications',      icon: '🔔', path: '/notifications',   keywords: ['notifications', 'alerts', 'messages'] },
  ];

  // ── Searchable vaccines from mockdata ──
  const vaccineResults = vaccineData.map(v => ({
    label: v.vaccine,
    icon: '💉',
    path: '/vaccine',
    keywords: [v.vaccine.toLowerCase(), v.status.toLowerCase(), 'vaccine', 'stock'],
    meta: v.status,
    metaColor: v.status === 'In Stock' ? '#2e7d32' : v.status === 'Low Stock' ? '#f57f17' : '#c62828',
  }));

  // ── Searchable notifications from mockdata ──
  const notifResults = notificationsData.map(n => ({
    label: n.title,
    icon: n.type === 'critical' ? '🚨' : n.type === 'warning' ? '⚠️' : n.type === 'success' ? '✅' : 'ℹ️',
    path: '/notifications',
    keywords: [n.title.toLowerCase(), n.message.toLowerCase(), 'notification', 'alert'],
    meta: n.time,
    metaColor: '#999',
  }));

  const allSearchItems = [...pages, ...vaccineResults, ...notifResults];

  const handleSearch = (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (q.trim() === '') {
      setSearchResults([]);
      setShowSearch(false);
      return;
    }
    const lower = q.toLowerCase();
    const results = allSearchItems.filter(p =>
      p.label.toLowerCase().includes(lower) ||
      p.keywords.some(k => k.includes(lower))
    );
    setSearchResults(results);
    setShowSearch(true);
  };

  const handleSelect = (path) => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearch(false);
    navigate(path);
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current  && !searchRef.current.contains(e.target))  setShowSearch(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="topbar">

      {/* ── Search ── */}
      <div className="topbar-search" ref={searchRef}>
        <span className="topbar-search-icon">🔍</span>
        <input
          type="text"
          className="topbar-search-input"
          placeholder="Search vaccines, pages, notifications..."
          value={searchQuery}
          onChange={handleSearch}
        />
        {showSearch && (
          <div className="topbar-search-dropdown">
            {searchResults.length > 0 ? (
              searchResults.map((r, i) => (
                <div key={`${r.path}-${i}`} className="topbar-search-item"
                  onClick={() => handleSelect(r.path)}>
                  <span className="topbar-search-item-icon">{r.icon}</span>
                  <div className="topbar-search-item-info">
                    <span className="topbar-search-label">{r.label}</span>
                    <span className="topbar-search-path" style={{ color: r.metaColor || '#999' }}>
                      {r.meta || r.path}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="topbar-search-empty">No results found</div>
            )}
          </div>
        )}
      </div>

      {/* ── Right side ── */}
      <div className="topbar-right">

        {/* Notifications bell */}
        <button type="button" className="topbar-icon-btn"
          onClick={() => navigate('/notifications')}
          title="Notifications">
          🔔
          {unreadCount > 0 && (
            <span className="topbar-badge">{unreadCount}</span>
          )}
        </button>

        {/* ── Avatar + dropdown ── */}
        <div className="topbar-profile-wrap" ref={profileRef}>
          <button
            type="button"
            className={`topbar-avatar${showProfile ? ' topbar-avatar--open' : ''}`}
            onClick={() => setShowProfile(v => !v)}
            title="Account">
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
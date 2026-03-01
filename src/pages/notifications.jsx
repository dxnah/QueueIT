// notifications.jsx

import React, { useState, useEffect, createContext, useContext } from 'react';
import Sidebar from '../components/Sidebar';
import { notificationsData } from '../data/dashboardData';
import '../styles/dashboard.css';
import '../styles/notifications.css';

// ─── Context ────────────────────────────────────────────────────────────────
export const NotificationsContext = createContext();

export const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(notificationsData);
  const unreadCount = notifications.filter(n => !n.read).length;
  return (
    <NotificationsContext.Provider value={{ notifications, setNotifications, unreadCount }}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationsContext);

// ─── Group notifications by date label ──────────────────────────────────────
const getDateGroup = (timeStr = '') => {
  const t = timeStr.toLowerCase();
  if (t.includes('minute') || t.includes('hour') || t === 'just now') return 'Today';
  if (t.includes('1 day') || t === 'yesterday') return 'Yesterday';
  return 'Older';
};

const DATE_GROUP_ORDER = ['Today', 'Yesterday', 'Older'];

const Notifications = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [filterType, setFilterType]             = useState('all');
  const [searchQuery, setSearchQuery]           = useState('');

  const { notifications, setNotifications, unreadCount } = useNotifications();

  useEffect(() => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  }, []);

  const handleMarkAsRead = (id) => {
    setNotifications(prev =>
      prev.map(notif => notif.id === id ? { ...notif, read: true } : notif)
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  };

  const handleDeleteNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all notifications?')) {
      setNotifications([]);
    }
  };

  // ─── Filter + Search ──────────────────────────────────────────────────────
  const filteredNotifications = notifications
    .filter(n => filterType === 'all' || n.type === filterType)
    .filter(n => {
      const q = searchQuery.toLowerCase();
      return (
        !q ||
        n.title.toLowerCase().includes(q) ||
        n.message.toLowerCase().includes(q)
      );
    });

  // ─── Group by date ────────────────────────────────────────────────────────
  const grouped = filteredNotifications.reduce((acc, notif) => {
    const group = getDateGroup(notif.time);
    if (!acc[group]) acc[group] = [];
    acc[group].push(notif);
    return acc;
  }, {});

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'critical': return '🚨';
      case 'warning':  return '⚠️';
      case 'success':  return '✅';
      case 'info':     return 'ℹ️';
      default:         return '📢';
    }
  };

  const getNotificationClass = (type) => {
    switch (type) {
      case 'critical': return 'notification-critical';
      case 'warning':  return 'notification-warning';
      case 'success':  return 'notification-success';
      case 'info':     return 'notification-info';
      default:         return 'notification-default';
    }
  };

  return (
    <div className="dashboard-container">

      <button
        type="button"
        className="mobile-menu-toggle"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
        ☰
      </button>

      <Sidebar
        isMobileMenuOpen={isMobileMenuOpen}
        onMenuClose={() => setIsMobileMenuOpen(false)}/>

      {isMobileMenuOpen && (
        <div className="overlay" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      <section className="main-content">

        {/* ── Header ───────────────────────────────────────────────────── */}
        <div className="page-header">
          <div>
            <h2 className="dashboard-heading">🔔 Notifications</h2>
            <p className="dashboard-subheading">
              {unreadCount > 0
                ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                : 'All caught up!'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button type="button" onClick={handleMarkAllAsRead} className="btn btn-secondary">
              ✓ Mark All Read
            </button>
            <button type="button" onClick={handleClearAll} className="btn btn-secondary">
              🗑️ Clear All
            </button>
          </div>
        </div>

        {/* ── Search Bar ───────────────────────────────────────────────── */}
        <div className="notif-search-wrapper">
          <span className="notif-search-icon">🔍</span>
          <input
            type="text"
            className="notif-search-input"
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="notif-search-clear"
              onClick={() => setSearchQuery('')}
              title="Clear search">
              ✕
            </button>
          )}
        </div>

        {/* ── Filters ──────────────────────────────────────────────────── */}
        <div className="filter-buttons">
          {[
            { key: 'all',      label: `All (${notifications.length})` },
            { key: 'critical', label: '🚨 Critical' },
            { key: 'warning',  label: '⚠️ Warning' },
            { key: 'success',  label: '✅ Success' },
            { key: 'info',     label: 'ℹ️ Info' },
          ].map(f => (
            <button
              type="button"
              key={f.key}
              onClick={() => setFilterType(f.key)}
              className={filterType === f.key ? 'filter-btn active' : 'filter-btn'}>
              {f.label}
            </button>
          ))}
        </div>

        {/* ── Notifications List (grouped by date) ─────────────────────── */}
        <div className="notifications-list">
          {filteredNotifications.length > 0 ? (
            DATE_GROUP_ORDER.filter(g => grouped[g]).map(group => (
              <div key={group}>
                {/* Date group label */}
                <div className="notif-date-label">{group}</div>

                <div className="notif-group">
                  {grouped[group].map(notif => (
                    <div
                      key={notif.id}
                      className={`notification-item ${getNotificationClass(notif.type)} ${notif.read ? 'read' : 'unread'}`}>
                      <div className="notification-icon">
                        {getNotificationIcon(notif.type)}
                      </div>
                      <div className="notification-content">
                        <h4 className="notification-title">{notif.title}</h4>
                        <p className="notification-message">{notif.message}</p>
                        <span className="notification-time">{notif.time}</span>
                      </div>
                      <div className="notification-actions">
                        {!notif.read && (
                          <button
                            type="button"
                            onClick={() => handleMarkAsRead(notif.id)}
                            className="btn-icon"
                            title="Mark as read">
                            ✓
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteNotification(notif.id)}
                          className="btn-icon"
                          title="Delete">
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            /* ── Empty State ─────────────────────────────────────────── */
            <div className="empty-state">
              <div className="empty-state-illustration">🔕</div>
              <h3 className="empty-state-title">
                {searchQuery ? 'No results found' : 'You\'re all caught up!'}
              </h3>
              <p className="empty-state-subtitle">
                {searchQuery
                  ? `No notifications match "${searchQuery}"`
                  : 'No notifications to display right now.'}
              </p>
              {searchQuery && (
                <button type="button" className="btn btn-primary" onClick={() => setSearchQuery('')}>
                  Clear Search
                </button>
              )}
            </div>
          )}
        </div>

      </section>
    </div>
  );
};

export default Notifications;
import React, { useState, useEffect, createContext, useContext } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import { notificationAPI } from '../services/api';
import useNotificationFilter from '../hooks/useNotificationFilter';
import '../styles/dashboard.css';
import '../styles/notifications.css';

// ─── Context ──────────────────────────────────────────────────────────────────
export const NotificationsContext = createContext();

export const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const unreadCount = notifications.filter(n => !n.read).length;

  // Load from backend on mount
  useEffect(() => {
    notificationAPI.getAll()
      .then(data => setNotifications(data))
      .catch(err => console.error('Failed to load notifications:', err));
  }, []);

  return (
    <NotificationsContext.Provider value={{ notifications, setNotifications, unreadCount }}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationsContext);

// ─── Date grouping ─────────────────────────────────────────────────────────────
const getDateGroup = (createdAt) => {
  if (!createdAt) return 'Older';
  const now  = new Date();
  const date = new Date(createdAt);
  const diffMs   = now - date;
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  if (diffDays < 1)  return 'Today';
  if (diffDays < 2)  return 'Yesterday';
  return 'Older';
};

// Friendly relative time label from ISO timestamp
const getTimeLabel = (createdAt) => {
  if (!createdAt) return '';
  const now    = new Date();
  const date   = new Date(createdAt);
  const diffMs = now - date;
  const mins   = Math.floor(diffMs / 60000);
  const hours  = Math.floor(mins / 60);
  const days   = Math.floor(hours / 24);
  if (mins < 1)   return 'Just now';
  if (mins < 60)  return `${mins} minute${mins > 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
};

const DATE_GROUP_ORDER = ['Today', 'Yesterday', 'Older'];

// ─── Main Component ────────────────────────────────────────────────────────────
const Notifications = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading]                   = useState(true);
  const [error, setError]                       = useState(null);

  const { notifications, setNotifications, unreadCount } = useNotifications();

  // Initial fetch (context provider already loads, but handle loading/error state here)
  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        setLoading(true);
        const data = await notificationAPI.getAll();
        setNotifications(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifs();
  }, [setNotifications]);

  // ── Filter + search via hook ───────────────────────────
  const {
    filterType, setFilterType,
    searchTerm, setSearchTerm,
    filtered: filteredNotifications,
  } = useNotificationFilter(notifications);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationAPI.markRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      // Fallback: mark all read locally if endpoint not yet implemented
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      await notificationAPI.delete(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear all notifications?')) return;
    try {
      await notificationAPI.clearAll();
      setNotifications([]);
    } catch (err) {
      // Fallback: clear locally if endpoint not yet implemented
      setNotifications([]);
    }
  };

  const grouped = filteredNotifications.reduce((acc, notif) => {
    const group = getDateGroup(notif.created_at);
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

      <button type="button" className="mobile-menu-toggle"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
        ☰
      </button>

      <Sidebar isMobileMenuOpen={isMobileMenuOpen} onMenuClose={() => setIsMobileMenuOpen(false)} />

      {isMobileMenuOpen && (
        <div className="overlay" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      <section className="main-wrapper">
        <TopBar />

        <section className="main-content">

          {/* HEADER */}
          <div className="page-header">
            <div>
              <h2 className="dashboard-heading" style={{ marginTop: '-20px' }}>🔔 Notifications</h2>
              <p className="dashboard-subheading">
                {loading
                  ? 'Loading...'
                  : unreadCount > 0
                    ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                    : 'All caught up!'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button onClick={handleMarkAllAsRead} className="btn btn-secondary" disabled={loading}>✓ Mark All Read</button>
              <button onClick={handleClearAll}      className="btn btn-secondary" disabled={loading}>🗑️ Clear All</button>
            </div>
          </div>

          {/* ERROR */}
          {error && (
            <div style={{ background: '#ffebee', border: '1px solid #ef9a9a', borderRadius: '10px', padding: '14px 18px', color: '#c62828', marginBottom: '20px' }}>
              ⚠️ Could not load notifications: {error}
            </div>
          )}

          {/* LOADING */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#888' }}>
              ⏳ Loading notifications...
            </div>
          )}

          {!loading && !error && (
            <>
              {/* SEARCH */}
              <div className="notif-search-wrapper">
                <span className="notif-search-icon">🔍</span>
                <input
                  type="text"
                  className="notif-search-input"
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button className="notif-search-clear" onClick={() => setSearchTerm('')}>✖</button>
                )}
              </div>

              {/* FILTERS */}
              <div className="filter-buttons">
                {[
                  { key: 'all',      label: `All (${notifications.length})` },
                  { key: 'critical', label: '🚨 Critical' },
                  { key: 'warning',  label: '⚠️ Warning'  },
                  { key: 'success',  label: '✅ Success'  },
                  { key: 'info',     label: 'ℹ️ Info'     },
                ].map(f => (
                  <button key={f.key} onClick={() => setFilterType(f.key)}
                    className={filterType === f.key ? 'filter-btn active' : 'filter-btn'}>
                    {f.label}
                  </button>
                ))}
              </div>

              {/* LIST */}
              <div className="notifications-list">
                {filteredNotifications.length > 0 ? (
                  DATE_GROUP_ORDER.filter(g => grouped[g]).map(group => (
                    <div key={group}>
                      <div className="notif-date-label">{group}</div>
                      <div className="notif-group">
                        {grouped[group].map(notif => (
                          <div key={notif.id}
                            className={`notification-item ${getNotificationClass(notif.type)} ${notif.read ? 'read' : 'unread'}`}>
                            <div className="notification-icon">{getNotificationIcon(notif.type)}</div>
                            <div className="notification-content">
                              <h3 className="notification-title">{notif.title}</h3>
                              <p className="notification-message">{notif.message}</p>
                              <span className="notification-time">{getTimeLabel(notif.created_at)}</span>
                            </div>
                            <div className="notification-actions">
                              {!notif.read && (
                                <button onClick={() => handleMarkAsRead(notif.id)} className="btn-icon">✓</button>
                              )}
                              <button onClick={() => handleDeleteNotification(notif.id)} className="btn-icon">🗑️</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <div className="empty-state-illustration">🔕</div>
                    <h3 className="empty-state-title">No results found</h3>
                    <p className="empty-state-subtitle">Try a different search or filter.</p>
                  </div>
                )}
              </div>
            </>
          )}

        </section>
      </section>
    </div>
  );
};

export default Notifications;
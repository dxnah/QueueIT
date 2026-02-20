// Notifications.jsx

import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import '../styles/dashboard.css';
import '../styles/notifications.css';

const Notifications = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [filterType, setFilterType] = useState('all');
  
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'critical', title: 'Booster Vaccine Out of Stock', message: 'Immediate restocking required for Booster vaccine.', time: '5 minutes ago', read: false },
    { id: 2, type: 'warning', title: 'Low Stock Alert', message: 'Anti-Tetanus vaccine is running low (85 doses remaining).', time: '1 hour ago', read: false },
    { id: 3, type: 'info', title: 'ML Prediction Update', message: 'Peak crowd expected next week. Recommended stock: 6,000 doses.', time: '2 hours ago', read: false },
    { id: 4, type: 'success', title: 'Restock Completed', message: 'Anti-Rabies vaccine restocked successfully (500 doses added).', time: '5 hours ago', read: true },
    { id: 5, type: 'warning', title: 'Expiring Soon', message: 'Hepatitis B vaccine (Batch HB-2024-004) expires in 30 days.', time: '1 day ago', read: true },
    { id: 6, type: 'info', title: 'System Maintenance', message: 'Scheduled maintenance on Feb 25, 2025 from 2:00 AM - 4:00 AM.', time: '2 days ago', read: true },
  ]);

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

  const filteredNotifications = filterType === 'all' 
    ? notifications 
    : notifications.filter(n => n.type === filterType);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'critical': return '🚨';
      case 'warning': return '⚠️';
      case 'success': return '✅';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  };

  const getNotificationClass = (type) => {
    switch(type) {
      case 'critical': return 'notification-critical';
      case 'warning': return 'notification-warning';
      case 'success': return 'notification-success';
      case 'info': return 'notification-info';
      default: return 'notification-default';
    }
  };

  return (
    <div className="dashboard-container">

      <button
        className="mobile-menu-toggle"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
        ☰
      </button>

      <Sidebar 
        isMobileMenuOpen={isMobileMenuOpen}
        onMenuClose={() => setIsMobileMenuOpen(false)}
      />

      {isMobileMenuOpen && (
        <div className="overlay" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      <div className="main-content">

        <div className="page-header">
          <div>
            <h2 className="dashboard-heading">🔔 Notifications</h2>
            <p className="dashboard-subheading">
              {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={handleMarkAllAsRead} className="btn btn-secondary">
              ✓ Mark All Read
            </button>
            <button onClick={handleClearAll} className="btn btn-secondary">
              🗑️ Clear All
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="filter-buttons">
          <button 
            onClick={() => setFilterType('all')}
            className={filterType === 'all' ? 'filter-btn active' : 'filter-btn'}>
            All ({notifications.length})
          </button>
          <button 
            onClick={() => setFilterType('critical')}
            className={filterType === 'critical' ? 'filter-btn active' : 'filter-btn'}>
            🚨 Critical
          </button>
          <button 
            onClick={() => setFilterType('warning')}
            className={filterType === 'warning' ? 'filter-btn active' : 'filter-btn'}>
            ⚠️ Warning
          </button>
          <button 
            onClick={() => setFilterType('success')}
            className={filterType === 'success' ? 'filter-btn active' : 'filter-btn'}>
            ✅ Success
          </button>
          <button 
            onClick={() => setFilterType('info')}
            className={filterType === 'info' ? 'filter-btn active' : 'filter-btn'}>
            ℹ️ Info
          </button>
        </div>

        {/* Notifications List */}
        <div className="notifications-list">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map(notif => (
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
                      onClick={() => handleMarkAsRead(notif.id)}
                      className="btn-icon"
                      title="Mark as read">
                      ✓
                    </button>
                  )}
                  <button 
                    onClick={() => handleDeleteNotification(notif.id)}
                    className="btn-icon"
                    title="Delete">
                    🗑️
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <p>🔔 No notifications to display</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Notifications;
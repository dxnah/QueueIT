import React, { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

import LoginScreen from './pages/login';
import Dashboard from './pages/dashboard';
import VaccineManagement from './pages/vaccine';
import VaccineOrders from './pages/VaccineOrders';
import Suppliers from './pages/Suppliers';
import DemandForecast from './pages/DemandForecast';
import Reports from './pages/reports';
import Notifications, { NotificationsProvider } from './pages/notifications';
import Settings from './pages/settings';
import Profile from './pages/profile';
import UserManagement from './pages/patientmanagement';
import Announcements from './pages/announcements';
import { prefetchAll } from './services/api';

function App() {
  const intervalRef = useRef(null);

  const startInterval = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    const autoRefresh = localStorage.getItem('autoRefresh');
    if (autoRefresh === 'false') return;

    const seconds = parseInt(localStorage.getItem('refreshInterval') || '30', 10);
    const ms = seconds * 1000;

    intervalRef.current = setInterval(() => {
      prefetchAll();
    }, ms);
  };

  useEffect(() => {
    prefetchAll();
    startInterval();

    const handleFocus = () => startInterval();
    window.addEventListener('focus', handleFocus);

    const handleStorage = (e) => {
      if (e.key === 'refreshInterval' || e.key === 'autoRefresh') {
        startInterval();
      }
    };
    window.addEventListener('storage', handleStorage);

    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme === 'true') {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }

    return () => {
      clearInterval(intervalRef.current);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  return (
    <NotificationsProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LoginScreen />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/vaccine" element={<VaccineManagement />} />
          <Route path="/vaccine-orders" element={<VaccineOrders />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/demand-forecast" element={<DemandForecast />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/patientmanagement" element={<UserManagement />} />
          <Route path="/announcements" element={<Announcements />} />
        </Routes>
      </Router>
    </NotificationsProvider>
  );
}

export default App;
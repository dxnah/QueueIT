// App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

import LoginScreen from './pages/login';
import Dashboard from './pages/dashboard';
import VaccineManagement from './pages/vaccine';
import DemandForecast from './pages/DemandForecast'; // ✅ NEW
import Reports from './pages/reports';
import Notifications, { NotificationsProvider } from './pages/notifications';
import Settings from './pages/settings';

function App() {
  return (
    <NotificationsProvider>
      <Router>
        <Routes>
          <Route path="/"                  element={<LoginScreen />} />
          <Route path="/login"             element={<LoginScreen />} />
          <Route path="/dashboard"         element={<Dashboard />} />
          <Route path="/vaccine"           element={<VaccineManagement />} />
          <Route path="/demand-forecast"   element={<DemandForecast />} /> {/* ✅ NEW */}
          <Route path="/reports"           element={<Reports />} />
          <Route path="/notifications"     element={<Notifications />} />
          <Route path="/settings"          element={<Settings />} />
        </Routes>
      </Router>
    </NotificationsProvider>
  );
}

export default App;
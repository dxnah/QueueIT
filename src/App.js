// App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

import LoginScreen    from './pages/login';
import Dashboard      from './pages/dashboard';
import VaccineManagement from './pages/vaccine';
import VaccineOrders  from 'src/pages/VaccineOrders';  // ✅ NEW
import Suppliers      from 'src/pages/Suppliers';       // ✅ NEW
import DemandForecast from './pages/DemandForecast';
import Reports        from './pages/reports';
import Notifications, { NotificationsProvider } from './pages/notifications';
import Settings       from './pages/settings';
import Profile        from './pages/profile';
import UserManagement from './pages/patientmanagement';

function App() {
  return (
    <NotificationsProvider>
      <Router>
        <Routes>
          <Route path="/"                  element={<LoginScreen />} />
          <Route path="/login"             element={<LoginScreen />} />
          <Route path="/dashboard"         element={<Dashboard />} />
          <Route path="/vaccine"           element={<VaccineManagement />} />
          <Route path="/vaccine-orders"    element={<VaccineOrders />} />   {/* ✅ NEW */}
          <Route path="/suppliers"         element={<Suppliers />} />        {/* ✅ NEW */}
          <Route path="/demand-forecast"   element={<DemandForecast />} />
          <Route path="/reports"           element={<Reports />} />
          <Route path="/notifications"     element={<Notifications />} />
          <Route path="/settings"          element={<Settings />} />
          <Route path="/profile"           element={<Profile />} />
          <Route path="/patientmanagement" element={<UserManagement />} />
        </Routes>
      </Router>
    </NotificationsProvider>
  );
}

export default App;
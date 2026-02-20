// app.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

import LoginScreen from './pages/login';
import Dashboard from './pages/dashboard';
import VaccineManagement from './pages/vaccine';
import Reports from './pages/reports';
import Notifications from './pages/notifications';
import Settings from './pages/settings';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/vaccine" element={<VaccineManagement />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/notifications" element={<Notifications />} />
      </Routes>
    </Router>
  );
}

export default App;

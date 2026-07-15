// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './vistas/Login';
import Dashboard from './vistas/Dashboard';
import DashboardAdmin from './vistas/DashboardAdmin'; // <-- IMPORTAR EL NUEVO DASHBOARD

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* NUEVA RUTA: Panel exclusivo del Administrador */}
        <Route path="/dashboard-admin" element={<DashboardAdmin />} /> 
      </Routes>
    </Router>
  );
}

export default App;
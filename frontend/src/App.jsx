// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './vistas/Login';
import Dashboard from './vistas/Dashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta raíz: Muestra la pantalla de inicio de sesión */}
        <Route path="/" element={<Login />} />
        
        {/* Ruta del panel: Muestra el dashboard del usuario */}
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
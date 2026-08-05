// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './vistas/Login';
import Onboarding from './vistas/Onboarding'; // <-- 1. IMPORTAMOS EL ONBOARDING
import Dashboard from './vistas/Dashboard';
import DashboardAdmin from './vistas/DashboardAdmin';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        
        {/* <-- 2. RUTA AGREGADA PARA RESOLVER EL ERROR */}
        <Route path="/onboarding" element={<Onboarding />} />

        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Panel exclusivo del Administrador */}
        <Route path="/dashboard-admin" element={<DashboardAdmin />} /> 
      </Routes>
    </Router>
  );
}

export default App;
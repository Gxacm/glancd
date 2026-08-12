// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './vistas/Login';
import Onboarding from './vistas/Onboarding';
import Dashboard from './vistas/Dashboard';
import DashboardAdmin from './vistas/DashboardAdmin';
import Explorar from './vistas/Explorar';
import MiBiblioteca from './vistas/MiBiblioteca';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
      
        <Route path="/onboarding" element={<Onboarding />} />

        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/explorar" element={<Explorar />} />
        
        <Route path="/biblioteca" element={<MiBiblioteca />} />
        
        {/* Panel exclusivo del Administrador */}
        <Route path="/dashboard-admin" element={<DashboardAdmin />} /> 
      </Routes>
    </Router>
  );
}

export default App;
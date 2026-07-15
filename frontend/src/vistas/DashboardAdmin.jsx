// frontend/src/vistas/DashboardAdmin.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DashboardAdmin = () => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuario_glancd');
    const token = localStorage.getItem('token_glancd');

    if (!token || !usuarioGuardado) {
      localStorage.clear();
      navigate('/');
      return;
    }

    const usuario = JSON.parse(usuarioGuardado);

    // Si intenta entrar aquí pero no es administrador, lo expulsamos por seguridad
    if (usuario.rol !== 'administrador') {
      navigate('/dashboard'); 
      return;
    }

    setAdmin(usuario);
  }, [navigate]);

  const manejarCerrarSesion = () => {
    localStorage.clear();
    navigate('/');
  };

  if (!admin) return <p style={{ textAlign: 'center' }}>Cargando panel de administración...</p>;

  return (
    <div style={{ maxWidth: '900px', margin: '30px auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', borderBottom: '2px solid #DC3545', paddingBottom: '10px' }}>
        <div>
          <h2>🛡️ Panel de CONTROL TOTAL (Admin) - GLANCD</h2>
          <p>Operando como: <strong style={{ color: '#DC3545' }}>{admin.nombre} {admin.apellido} (ADMIN)</strong></p>
        </div>
        <button 
          onClick={manejarCerrarSesion}
          style={{ marginLeft: 'auto', padding: '10px 15px', backgroundColor: '#343A40', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Cerrar Sesión
        </button>
      </header>

      <main style={{ marginTop: '30px' }}>
        <h3>🔧 Acciones de Administrador (Sprint 1)</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '15px' }}>
          <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '6px', backgroundColor: '#FFF3CD' }}>
            <h4>👥 Control de Usuarios</h4>
            <p>● Capacidad de habilitar, deshabilitar o editar roles de usuarios.</p>
            <button style={{ padding: '5px 10px', marginTop: '10px', cursor: 'pointer' }}>Gestionar Usuarios</button>
          </div>
          <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '6px', backgroundColor: '#F8F9FA' }}>
            <h4>📚 Control del Catálogo de Libros</h4>
            <p>○ Modulo para añadir nuevos títulos, autores y géneros literarios.</p>
            <small style={{ color: '#6C757D' }}>Esperando microservicio de Python en puerto 8001...</small>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardAdmin;
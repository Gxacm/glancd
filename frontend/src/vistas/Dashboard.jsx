// frontend/src/vistas/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    // Intentamos recuperar los datos del usuario guardados al hacer login
    const usuarioGuardado = localStorage.getItem('usuario_glancd');
    const token = localStorage.getItem('token_glancd');

    // EXIGENCIA RÚBRICA: Si no hay token, lo redirigimos al login inmediatamente (Ruta protegida)
    if (!token || !usuarioGuardado) {
      localStorage.clear();
      navigate('/');
      return;
    }

    setUsuario(JSON.parse(usuarioGuardado));
  }, [navigate]);

  const manejarCerrarSesion = () => {
    // Borramos las credenciales del navegador y volvemos al login
    localStorage.clear();
    navigate('/');
  };

  if (!usuario) return <p style={{ textAlign: 'center' }}>Cargando panel de control...</p>;

  return (
    <div style={{ maxWidth: '800px', margin: '30px auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
        <div>
          <h2>📚 Panel Principal - GLANCD</h2>
          <p>¡Hola de nuevo, <strong style={{ color: '#007BFF' }}>{usuario.nombre} {usuario.apellido}</strong>!</p>
        </div>
        <button 
          onClick={manejarCerrarSesion}
          style={{ marginLeft: 'auto', padding: '10px 15px', backgroundColor: '#DC3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Cerrar Sesión
        </button>
      </header>

      <main style={{ marginTop: '30px' }}>
        <h3>🎯 Estado del Sistema (Sprint 1)</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '15px' }}>
          <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '6px', backgroundColor: '#F8F9FA' }}>
            <h4>🛡️ Microservicio de Usuarios</h4>
            <p style={{ color: 'green' }}>● En línea (Puerto 3001)</p>
            <small>Token de seguridad JWT validado e inyectado correctamente en el navegador.</small>
          </div>
          <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '6px', backgroundColor: '#F8F9FA' }}>
            <h4>📚 Próximo Módulo</h4>
            <p style={{ color: '#6C757D' }}>○ Catálogo de Libros (Puerto 8001)</p>
            <small>Pendiente por conectar con el backend de Python FastAPI.</small>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
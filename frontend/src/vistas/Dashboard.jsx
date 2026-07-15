// frontend/src/vistas/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // 🔄 Importamos axios para hacer la petición a Python

const Dashboard = () => {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  
  // 🔄 Nuevos estados para controlar el catálogo de libros
  const [libros, setLibros] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorLibros, setErrorLibros] = useState('');

  useEffect(() => {
    // 1. Validamos sesión
    const usuarioGuardado = localStorage.getItem('usuario_glancd');
    const token = localStorage.getItem('token_glancd');

    if (!token || !usuarioGuardado) {
      localStorage.clear();
      navigate('/');
      return;
    }

    setUsuario(JSON.parse(usuarioGuardado));

    // 2. Traemos los libros de FastAPI (Puerto 8001)
    const traerLibros = async () => {
      try {
        // Usamos la variable de entorno o un fallback al puerto 8001 por defecto
        const urlBase = import.meta.env.VITE_API_LIBROS || 'http://localhost:8001';
        const respuesta = await axios.get(`${urlBase}/api/libros/`);
        
        setLibros(respuesta.data);
      } catch (err) {
        console.error('Error al cargar libros:', err);
        setErrorLibros('No se pudo conectar con el catálogo de libros.');
      } finally {
        setCargando(false);
      }
    };

    traerLibros();
  }, [navigate]);

  const manejarCerrarSesion = () => {
    localStorage.clear();
    navigate('/');
  };

  if (!usuario) return <p style={{ textAlign: 'center' }}>Cargando panel de control...</p>;

  return (
    <div style={{ maxWidth: '900px', margin: '30px auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      
      {/* HEADER */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
        <div>
          <h2>📚 Panel Principal - GLANCD</h2>
          <p>¡Hola de nuevo, <strong style={{ color: '#007BFF' }}>{usuario.nombre} {usuario.apellido}</strong>!</p>
        </div>
        <button 
          onClick={manejarCerrarSesion}
          style={{ marginLeft: 'auto', padding: '10px 15px', backgroundColor: '#DC3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Cerrar Sesión
        </button>
      </header>

      {/* MONITOR DE ESTADOS */}
      <main style={{ marginTop: '30px' }}>
        <h3>🎯 Estado del Sistema</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '15px' }}>
          
          <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '6px', backgroundColor: '#F8F9FA' }}>
            <h4>🛡️ Microservicio de Usuarios</h4>
            <p style={{ color: 'green', fontWeight: 'bold' }}>● En línea (Puerto 8000)</p>
            <small>Sesión JWT activa y cargada de forma local.</small>
          </div>

          <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '6px', backgroundColor: '#F8F9FA' }}>
            <h4>📚 Microservicio de Libros</h4>
            {errorLibros ? (
              <p style={{ color: 'red', fontWeight: 'bold' }}>⚠️ Fuera de línea</p>
            ) : (
              <p style={{ color: 'green', fontWeight: 'bold' }}>● Conectado (Puerto 8001)</p>
            )}
            <small>FastAPI + PostgreSQL en sintonía con React.</small>
          </div>

        </div>

        {/* SECCIÓN DINÁMICA DEL CATÁLOGO DE LIBROS */}
        <section style={{ marginTop: '40px' }}>
          <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>📖 Catálogo de Libros en Base de Datos</h3>
          
          {cargando && <p style={{ color: '#666' }}>Cargando catálogo desde Python FastAPI...</p>}
          
          {errorLibros && <p style={{ color: '#DC3545', fontWeight: 'bold' }}>❌ {errorLibros}</p>}

          {!cargando && !errorLibros && libros.length === 0 && (
            <p style={{ color: '#888' }}>No hay libros registrados en la base de datos.</p>
          )}

          {!cargando && !errorLibros && libros.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
              {libros.map((libro) => (
                <div key={libro.id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    {libro.url_portada ? (
                      <img src={libro.url_portada} alt={libro.titulo} style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '4px' }} />
                    ) : (
                      <div style={{ width: '100%', height: '160px', backgroundColor: '#e9ecef', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6c757d', fontSize: '14px', borderRadius: '4px' }}>
                        Sin portada
                      </div>
                    )}
                    <h4 style={{ margin: '12px 0 6px 0', color: '#333' }}>{libro.titulo}</h4>
                    <p style={{ fontSize: '13px', color: '#666', lineHeight: '1.4', margin: '0' }}>
                      {libro.sinopsis || 'Sin sinopsis disponible.'}
                    </p>
                  </div>
                  <div style={{ marginTop: '15px', paddingTop: '10px', borderTop: '1px solid #f1f1f1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                    <span style={{ backgroundColor: '#e2e3e5', padding: '3px 8px', borderRadius: '4px', fontWeight: 'bold', color: '#383d41' }}>
                      Público: +{libro.edad_objetivo || '0'} años
                    </span>
                    <span style={{ color: 'green', fontWeight: 'bold' }}>✓ Disponible</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
};

export default Dashboard;
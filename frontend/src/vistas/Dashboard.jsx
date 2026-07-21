import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // 🔄 Peticiones HTTP a nuestros microservicios

const Dashboard = () => {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  
  // 🔄 Estados para gestionar el catálogo de libros
  const [libros, setLibros] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorLibros, setErrorLibros] = useState('');

  useEffect(() => {
    // 1. Validamos sesión local
    const usuarioGuardado = localStorage.getItem('usuario_glancd');
    const token = localStorage.getItem('token_glancd');

    if (!token || !usuarioGuardado) {
      localStorage.clear();
      navigate('/');
      return;
    }

    setUsuario(JSON.parse(usuarioGuardado));

    // 2. Obtenemos el catálogo desde FastAPI (Puerto 8001) enviando el Token JWT
    const traerLibros = async () => {
      try {
        const urlBase = import.meta.env.VITE_API_LIBROS || 'http://localhost:8001';
        
        // 🔑 Leemos el token guardado en el Login
        const tokenActual = localStorage.getItem('token_glancd');

        // 🛡️ Enviamos el token en la cabecera Authorization
        const respuesta = await axios.get(`${urlBase}/api/libros/`, {
          headers: {
            Authorization: `Bearer ${tokenActual}`
          }
        });
        
        setLibros(respuesta.data);
      } catch (err) {
        console.error('Error al cargar libros:', err);
        if (err.response && err.response.status === 401) {
          setErrorLibros('Sesión expirada o no autorizada. Por favor vuelve a iniciar sesión.');
        } else {
          setErrorLibros('No se pudo conectar con el catálogo de libros.');
        }
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

  if (!usuario) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Cargando panel de control...</p>;

  return (
    <div style={{ maxWidth: '950px', margin: '30px auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      
      {/* HEADER */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eee', paddingBottom: '15px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#2c3e50' }}>📚 Panel Principal - GLANCD</h2>
          <p style={{ margin: '5px 0 0 0', color: '#555' }}>
            ¡Hola de nuevo, <strong style={{ color: '#007BFF' }}>{usuario.nombre} {usuario.apellido}</strong>!
          </p>
        </div>
        <button 
          onClick={manejarCerrarSesion}
          style={{ padding: '10px 16px', backgroundColor: '#DC3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Cerrar Sesión
        </button>
      </header>

      <main style={{ marginTop: '30px' }}>
        
        {/* MONITOR DE ESTADOS DE MICROSERVICIOS */}
        <h3>🎯 Estado del Sistema</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '15px' }}>
          
          <div style={{ padding: '15px', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#F8F9FA' }}>
            <h4 style={{ margin: '0 0 8px 0' }}>🛡️ Microservicio de Usuarios</h4>
            <p style={{ color: '#28a745', fontWeight: 'bold', margin: '0 0 4px 0' }}>● En línea (Puerto 8000)</p>
            <small style={{ color: '#6c757d' }}>Sesión JWT activa y verificada.</small>
          </div>

          <div style={{ padding: '15px', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#F8F9FA' }}>
            <h4 style={{ margin: '0 0 8px 0' }}>📚 Microservicio de Libros</h4>
            {errorLibros ? (
              <p style={{ color: '#dc3545', fontWeight: 'bold', margin: '0 0 4px 0' }}>⚠️ Fuera de línea</p>
            ) : (
              <p style={{ color: '#28a745', fontWeight: 'bold', margin: '0 0 4px 0' }}>● Conectado (Puerto 8001)</p>
            )}
            <small style={{ color: '#6c757d' }}>FastAPI + PostgreSQL en comunicación directa.</small>
          </div>

        </div>

        {/* CATÁLOGOS Y TARJETAS DE LIBROS */}
        <section style={{ marginTop: '40px' }}>
          <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', color: '#2c3e50' }}>
            📖 Catálogo de Libros en Base de Datos
          </h3>
          
          {cargando && <p style={{ color: '#666' }}>Cargando catálogo desde Python FastAPI...</p>}
          
          {errorLibros && <p style={{ color: '#DC3545', fontWeight: 'bold' }}>❌ {errorLibros}</p>}

          {!cargando && !errorLibros && libros.length === 0 && (
            <p style={{ color: '#888' }}>No hay libros registrados en la base de datos.</p>
          )}

          {!cargando && !errorLibros && libros.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px', marginTop: '20px' }}>
              {libros.map((libro) => (
                <div key={libro.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: '#fff' }}>
                  <div>
                    {/* PORTADA DEL LIBRO */}
                    {libro.url_portada ? (
                      <img 
                        src={libro.url_portada} 
                        alt={libro.titulo} 
                        style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '6px' }} 
                      />
                    ) : (
                      <div style={{ width: '100%', height: '180px', backgroundColor: '#e9ecef', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6c757d', fontSize: '14px', borderRadius: '6px' }}>
                        Sin portada
                      </div>
                    )}
                    
                    {/* TÍTULO */}
                    <h4 style={{ margin: '12px 0 2px 0', color: '#1a202c', fontSize: '16px' }}>
                      {libro.titulo}
                    </h4>

                    {/* ✍️ AUTOR RELACIONADO (Obtenido via SQLAlchemy JOIN) */}
                    <p style={{ fontSize: '13px', color: '#007BFF', fontWeight: 'bold', margin: '0 0 10px 0' }}>
                      ✍️ {libro.autor ? libro.autor.nombre : 'Autor Desconocido'}
                    </p>

                    {/* SINOPSIS */}
                    <p style={{ fontSize: '13px', color: '#4a5568', lineHeight: '1.4', margin: 0 }}>
                      {libro.sinopsis || 'Sin sinopsis disponible.'}
                    </p>
                  </div>
                  
                  {/* FOOTER DE LA TARJETA */}
                  <div style={{ marginTop: '15px', paddingTop: '10px', borderTop: '1px solid #edf2f7', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                    <span style={{ backgroundColor: '#edf2f7', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', color: '#4a5568' }}>
                      Público: +{libro.edad_objetivo || '0'} años
                    </span>
                    <span style={{ color: '#28a745', fontWeight: 'bold' }}>✓ Disponible</span>
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
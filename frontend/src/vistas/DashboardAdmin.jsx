// frontend/src/vistas/AdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  
  // 📚 Estados para el Catálogo de Libros
  const [libros, setLibros] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorLibros, setErrorLibros] = useState('');

  // 📝 Estados para Modal de Libros (Crear / Editar)
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [libroIdEditar, setLibroIdEditar] = useState(null);
  const [formData, setFormData] = useState({
    titulo: '',
    sinopsis: '',
    url_portada: '',
    edad_objetivo: 0
  });

  const urlBase = import.meta.env.VITE_API_LIBROS || 'http://localhost:8001';

  // Obtener Token para las peticiones
  const obtenerConfigAuth = () => {
    const token = localStorage.getItem('token_glancd');
    return {
      headers: { Authorization: `Bearer ${token}` }
    };
  };

  // 1. Obtener libros desde el microservicio
  const traerLibros = async () => {
    try {
      setCargando(true);
      const respuesta = await axios.get(`${urlBase}/api/libros/`, obtenerConfigAuth());
      setLibros(respuesta.data);
      setErrorLibros('');
    } catch (err) {
      console.error('Error al cargar libros:', err);
      setErrorLibros('No se pudo conectar con el microservicio de libros (Puerto 8001).');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuario_glancd');
    const token = localStorage.getItem('token_glancd');

    if (!token || !usuarioGuardado) {
      localStorage.clear();
      navigate('/');
      return;
    }

    const datosUsuario = JSON.parse(usuarioGuardado);

    // 🔒 Seguridad adicional: Si un usuario regular intenta entrar aquí, lo devolvemos
    if (datosUsuario.rol !== 'administrador') {
      navigate('/dashboard');
      return;
    }

    setUsuario(datosUsuario);
    traerLibros();
  }, [navigate]);

  const manejarCerrarSesion = () => {
    localStorage.clear();
    navigate('/');
  };

  // 📝 Funciones para Modal CRUD
  const abrirModalCrear = () => {
    setModoEdicion(false);
    setLibroIdEditar(null);
    setFormData({ titulo: '', sinopsis: '', url_portada: '', edad_objetivo: 0 });
    setMostrarModal(true);
  };

  const abrirModalEditar = (libro) => {
    setModoEdicion(true);
    setLibroIdEditar(libro.id);
    setFormData({
      titulo: libro.titulo || '',
      sinopsis: libro.sinopsis || '',
      url_portada: libro.url_portada || '',
      edad_objetivo: libro.edad_objetivo || 0
    });
    setMostrarModal(true);
  };

  const manejarGuardar = async (e) => {
    e.preventDefault();
    try {
      if (modoEdicion) {
        await axios.put(`${urlBase}/api/libros/${libroIdEditar}`, formData, obtenerConfigAuth());
      } else {
        await axios.post(`${urlBase}/api/libros/`, formData, obtenerConfigAuth());
      }
      setMostrarModal(false);
      traerLibros();
    } catch (err) {
      alert('Error al guardar el libro. Revisa la consola o los datos enviados.');
      console.error(err);
    }
  };

  const manejarEliminar = async (id, titulo) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar "${titulo}"?`)) {
      try {
        await axios.delete(`${urlBase}/api/libros/${id}`, obtenerConfigAuth());
        traerLibros();
      } catch (err) {
        alert('No se pudo eliminar el libro.');
        console.error(err);
      }
    }
  };

  if (!usuario) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Verificando credenciales de Admin...</p>;

  return (
    <div style={{ maxWidth: '1100px', margin: '30px auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      
      {/* HEADER DE ADMINISTRADOR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, color: '#1a202c' }}>🛡️ Panel de CONTROL TOTAL (Admin) - GLANCD</h2>
          <p style={{ margin: '5px 0 0 0', color: '#e53e3e', fontWeight: 'bold' }}>
            Operando como: {usuario.nombre} {usuario.apellido} (ADMIN)
          </p>
        </div>
        <button 
          onClick={manejarCerrarSesion} 
          style={{ padding: '8px 16px', backgroundColor: '#2d3748', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Cerrar Sesión
        </button>
      </div>

      <hr style={{ margin: '20px 0', borderColor: '#e53e3e' }} />

      <h3 style={{ color: '#4a5568', marginBottom: '15px' }}>🔧 Acciones de Administrador</h3>

      {/* DISPOSICIÓN EN DOS COLUMNAS */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px', alignItems: 'start' }}>
        
        {/* COLUMNA 1: CONTROL DE USUARIOS */}
        <div style={{ backgroundColor: '#fefcbf', padding: '20px', borderRadius: '8px', border: '1px solid #faf089' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#744210' }}>👥 Control de Usuarios</h4>
          <p style={{ fontSize: '13px', color: '#975a16', lineHeight: '1.4' }}>
            • Capacidad de habilitar, deshabilitar o editar roles de usuarios.
          </p>
          <button style={{ padding: '8px 14px', backgroundColor: '#fff', border: '1px solid #cbd5e0', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}>
            Gestionar Usuarios
          </button>
        </div>

        {/* COLUMNA 2: CATÁLOGOS Y GESTIÓN EN TIEMPO REAL */}
        <div style={{ backgroundColor: '#f7fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <div>
              <h4 style={{ margin: 0, color: '#2d3748' }}>📚 Control del Catálogo de Libros</h4>
              <p style={{ fontSize: '12px', color: '#718096', margin: '2px 0 0 0' }}>Módulo para añadir, editar o eliminar títulos.</p>
            </div>
            <button 
              onClick={abrirModalCrear} 
              style={{ padding: '8px 14px', backgroundColor: '#38a169', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              ➕ Nuevo Libro
            </button>
          </div>

          {cargando && <p style={{ fontSize: '14px', color: '#718096' }}>Cargando libros desde el servidor Python...</p>}
          {errorLibros && <p style={{ fontSize: '14px', color: '#e53e3e', fontWeight: 'bold' }}>❌ {errorLibros}</p>}

          {!cargando && !errorLibros && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {libros.length === 0 ? (
                <p style={{ fontSize: '14px', color: '#a0aec0', fontStyle: 'italic' }}>No hay libros en la base de datos.</p>
              ) : (
                libros.map((libro) => (
                  <div key={libro.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: '12px 15px', borderRadius: '6px', border: '1px solid #edf2f7', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {libro.url_portada ? (
                        <img src={libro.url_portada} alt={libro.titulo} style={{ width: '40px', height: '55px', objectFit: 'cover', borderRadius: '4px' }} />
                      ) : (
                        <div style={{ width: '40px', height: '55px', backgroundColor: '#edf2f7', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#a0aec0' }}>
                          Sin foto
                        </div>
                      )}
                      <div>
                        <strong style={{ color: '#2d3748', display: 'block', fontSize: '15px' }}>{libro.titulo}</strong>
                        <span style={{ fontSize: '12px', color: '#718096' }}>
                          ✍️ {libro.autor ? libro.autor.nombre : 'Sin autor'} | 🎯 +{libro.edad_objetivo || 0} años
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button 
                        onClick={() => abrirModalEditar(libro)} 
                        title="Editar Libro" 
                        style={{ padding: '6px 10px', backgroundColor: '#ecc94b', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => manejarEliminar(libro.id, libro.titulo)} 
                        title="Eliminar Libro" 
                        style={{ padding: '6px 10px', backgroundColor: '#e53e3e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

        </div>

      </div>

      {/* 🖼️ MODAL FLOTANTE (CREAR / EDITAR) */}
      {mostrarModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '8px', width: '400px', maxWidth: '90%' }}>
            <h3 style={{ marginTop: 0, color: '#2d3748' }}>{modoEdicion ? '✏️ Editar Libro' : '➕ Agregar Nuevo Libro'}</h3>
            <form onSubmit={manejarGuardar}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '12px', display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>Título:</label>
                <input 
                  type="text" 
                  required 
                  value={formData.titulo} 
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })} 
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e0' }} 
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '12px', display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>Sinopsis:</label>
                <textarea 
                  rows="3" 
                  value={formData.sinopsis} 
                  onChange={(e) => setFormData({ ...formData, sinopsis: e.target.value })} 
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e0' }} 
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '12px', display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>URL Portada:</label>
                <input 
                  type="url" 
                  value={formData.url_portada} 
                  onChange={(e) => setFormData({ ...formData, url_portada: e.target.value })} 
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e0' }} 
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '12px', display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>Edad Objetiva:</label>
                <input 
                  type="number" 
                  value={formData.edad_objetivo} 
                  onChange={(e) => setFormData({ ...formData, edad_objetivo: parseInt(e.target.value) || 0 })} 
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e0' }} 
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button 
                  type="button" 
                  onClick={() => setMostrarModal(false)} 
                  style={{ padding: '8px 14px', backgroundColor: '#a0aec0', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  style={{ padding: '8px 14px', backgroundColor: '#3182ce', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  {modoEdicion ? 'Guardar Cambios' : 'Crear Libro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
// frontend/src/vistas/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  
  // 🔄 Estados de libros
  const [libros, setLibros] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorLibros, setErrorLibros] = useState('');

  // 📝 Estados para Formulario / Modal (Crear y Editar)
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

  // 🔒 Determinamos si el usuario es administrador basado en el campo 'rol'
  const esAdmin = usuario?.rol === 'administrador';

  // Obtener la cabecera con el Token
  const obtenerConfigAuth = () => {
    const token = localStorage.getItem('token_glancd');
    return {
      headers: { Authorization: `Bearer ${token}` }
    };
  };

  // 1. Cargar libros desde la API
  const traerLibros = async () => {
    try {
      setCargando(true);
      const respuesta = await axios.get(`${urlBase}/api/libros/`, obtenerConfigAuth());
      setLibros(respuesta.data);
      setErrorLibros('');
    } catch (err) {
      console.error('Error al cargar libros:', err);
      if (err.response && err.response.status === 401) {
        setErrorLibros('Sesión expirada o no autorizada. Vuelve a iniciar sesión.');
      } else {
        setErrorLibros('No se pudo conectar con el catálogo de libros.');
      }
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

    setUsuario(JSON.parse(usuarioGuardado));
    traerLibros();
  }, [navigate]);

  const manejarCerrarSesion = () => {
    localStorage.clear();
    navigate('/');
  };

  // 📝 Abrir modal para Crear (Solo Admin)
  const abrirModalCrear = () => {
    setModoEdicion(false);
    setLibroIdEditar(null);
    setFormData({ titulo: '', sinopsis: '', url_portada: '', edad_objetivo: 0 });
    setMostrarModal(true);
  };

  // ✏️ Abrir modal para Editar (Solo Admin)
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

  // 💾 Guardar (Crear o Editar)
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
      alert('Error al guardar el libro. Verifica la información enviada.');
      console.error(err);
    }
  };

  // 🗑️ Eliminar Libro (Solo Admin)
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

  if (!usuario) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Cargando panel de control...</p>;

  return (
    <div style={{ maxWidth: '950px', margin: '30px auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      
      {/* HEADER */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eee', paddingBottom: '15px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#2c3e50' }}>📚 Panel Principal - GLANCD</h2>
          <p style={{ margin: '5px 0 0 0', color: '#555' }}>
            ¡Hola de nuevo, <strong style={{ color: '#007BFF' }}>{usuario.nombre} {usuario.apellido}</strong>! 
            <span style={{ fontSize: '12px', marginLeft: '10px', backgroundColor: esAdmin ? '#28a745' : '#17a2b8', color: 'white', padding: '2px 8px', borderRadius: '10px' }}>
              {usuario.rol || 'usuario'}
            </span>
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
        
        {/* ENCABEZADO CATÁLOGO Y BOTÓN CREAR (Solo para Administrador) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
          <h3 style={{ margin: 0, color: '#2c3e50' }}>📖 Catálogo de Libros</h3>
          
          {/* 🛡️ Control visual por ROL */}
          {esAdmin && (
            <button
              onClick={abrirModalCrear}
              style={{ padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              ➕ Agregar Nuevo Libro
            </button>
          )}
        </div>

        {cargando && <p style={{ color: '#666', marginTop: '20px' }}>Cargando catálogo...</p>}
        {errorLibros && <p style={{ color: '#DC3545', fontWeight: 'bold', marginTop: '20px' }}>❌ {errorLibros}</p>}

        {/* LISTADO DE TARJETAS */}
        {!cargando && !errorLibros && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px', marginTop: '20px' }}>
            {libros.map((libro) => (
              <div key={libro.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '15px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <div>
                  {libro.url_portada ? (
                    <img src={libro.url_portada} alt={libro.titulo} style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '6px' }} />
                  ) : (
                    <div style={{ width: '100%', height: '180px', backgroundColor: '#e9ecef', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6c757d', borderRadius: '6px' }}>
                      Sin portada
                    </div>
                  )}
                  <h4 style={{ margin: '12px 0 4px 0', color: '#1a202c' }}>{libro.titulo}</h4>
                  <p style={{ fontSize: '13px', color: '#007BFF', fontWeight: 'bold', margin: '0 0 8px 0' }}>
                    ✍️ {libro.autor ? libro.autor.nombre : 'Autor Desconocido'}
                  </p>
                  <p style={{ fontSize: '13px', color: '#4a5568', lineHeight: '1.4', margin: 0 }}>
                    {libro.sinopsis || 'Sin sinopsis disponible.'}
                  </p>
                </div>

                {/* ACCIONES CRUD */}
                <div style={{ marginTop: '15px', paddingTop: '10px', borderTop: '1px solid #edf2f7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', backgroundColor: '#edf2f7', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                    +{libro.edad_objetivo || 0} años
                  </span>

                  {/* 🛡️ Botones de Edición y Eliminación condicionados al ROL */}
                  {esAdmin && (
                    <div>
                      <button 
                        onClick={() => abrirModalEditar(libro)} 
                        style={{ marginRight: '6px', padding: '5px 10px', backgroundColor: '#FFC107', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => manejarEliminar(libro.id, libro.titulo)} 
                        style={{ padding: '5px 10px', backgroundColor: '#DC3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        🗑️
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

      {/* 🖼️ MODAL DE CREACIÓN / EDICIÓN */}
      {mostrarModal && esAdmin && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '8px', width: '400px', maxWidth: '90%' }}>
            <h3 style={{ marginTop: 0 }}>{modoEdicion ? '✏️ Editar Libro' : '➕ Agregar Nuevo Libro'}</h3>
            <form onSubmit={manejarGuardar}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>Título:</label>
                <input 
                  type="text" 
                  required 
                  value={formData.titulo} 
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })} 
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} 
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>Sinopsis:</label>
                <textarea 
                  rows="3" 
                  value={formData.sinopsis} 
                  onChange={(e) => setFormData({ ...formData, sinopsis: e.target.value })} 
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} 
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>URL de Portada:</label>
                <input 
                  type="url" 
                  value={formData.url_portada} 
                  onChange={(e) => setFormData({ ...formData, url_portada: e.target.value })} 
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} 
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>Edad Objetiva:</label>
                <input 
                  type="number" 
                  value={formData.edad_objetivo} 
                  onChange={(e) => setFormData({ ...formData, edad_objetivo: parseInt(e.target.value) || 0 })} 
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} 
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button 
                  type="button" 
                  onClick={() => setMostrarModal(false)} 
                  style={{ padding: '8px 14px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  style={{ padding: '8px 14px', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
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

export default Dashboard;
// frontend/src/vistas/AdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  
  // 📚 Estados Generales
  const [libros, setLibros] = useState([]);
  const [autores, setAutores] = useState([]);
  const [generos, setGeneros] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorGlobal, setErrorGlobal] = useState('');

  // 📝 Estados para Modal de Libros (Principal)
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [libroIdEditar, setLibroIdEditar] = useState(null);
  const [formData, setFormData] = useState({
    titulo: '',
    sinopsis: '',
    url_portada: '',
    edad_objetivo: 0,
    autor_id: '',
    genero_id: ''
  });

  // 👤 Estados para Modal de Autor (Secundaria)
  const [mostrarModalAutor, setMostrarModalAutor] = useState(false);
  const [formDataAutor, setFormDataAutor] = useState({
    nombre: '', apellido: '', biografia: '', url_foto: ''
  });

  // 🎭 Estados para Modal de Género (Secundaria)
  const [mostrarModalGenero, setMostrarModalGenero] = useState(false);
  const [formDataGenero, setFormDataGenero] = useState({
    nombre: '', edad_minima: 0
  });

  const urlBase = import.meta.env.VITE_API_LIBROS || 'http://localhost:8001';

  const obtenerConfigAuth = () => {
    const token = localStorage.getItem('token_glancd');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  // --- FUNCIONES DE CARGA (GET) ---
  const traerDatosIniciales = async () => {
    try {
      setCargando(true);
      const config = obtenerConfigAuth();
      
      const [resLibros, resAutores, resGeneros] = await Promise.all([
        axios.get(`${urlBase}/api/libros/`, config),
        axios.get(`${urlBase}/api/autores/`, config),
        axios.get(`${urlBase}/api/generos/`, config)
      ]);

      setLibros(resLibros.data);
      setAutores(resAutores.data);
      setGeneros(resGeneros.data);
      setErrorGlobal('');
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setErrorGlobal('No se pudo conectar con el microservicio.');
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
    if (datosUsuario.rol !== 'administrador') {
      navigate('/dashboard');
      return;
    }

    setUsuario(datosUsuario);
    traerDatosIniciales();
  }, [navigate]);

  const manejarCerrarSesion = () => {
    localStorage.clear();
    navigate('/');
  };

  // --- FUNCIONES DEL LIBRO (CRUD) ---
  const abrirModalCrear = () => {
    setModoEdicion(false);
    setLibroIdEditar(null);
    setFormData({ titulo: '', sinopsis: '', url_portada: '', edad_objetivo: 0, autor_id: '', genero_id: '' });
    setMostrarModal(true);
  };

  const abrirModalEditar = (libro) => {
    setModoEdicion(true);
    setLibroIdEditar(libro.id);
    setFormData({
      titulo: libro.titulo || '',
      sinopsis: libro.sinopsis || '',
      url_portada: libro.url_portada || '',
      edad_objetivo: libro.edad_objetivo || 0,
      autor_id: libro.autor_id || '',
      genero_id: libro.genero_id || ''
    });
    setMostrarModal(true);
  };

  const manejarGuardarLibro = async (e) => {
    e.preventDefault();
    try {
      // Convertir campos vacíos a null para el backend
      const payload = {
        ...formData,
        autor_id: formData.autor_id === '' ? null : formData.autor_id,
        genero_id: formData.genero_id === '' ? null : parseInt(formData.genero_id)
      };

      if (modoEdicion) {
        await axios.put(`${urlBase}/api/libros/${libroIdEditar}`, payload, obtenerConfigAuth());
      } else {
        await axios.post(`${urlBase}/api/libros/`, payload, obtenerConfigAuth());
      }
      setMostrarModal(false);
      traerDatosIniciales(); // Recargar la tabla
    } catch (err) {
      alert('Error al guardar el libro.');
      console.error(err);
    }
  };

  const manejarEliminarLibro = async (id, titulo) => {
    if (window.confirm(`¿Eliminar "${titulo}"?`)) {
      try {
        await axios.delete(`${urlBase}/api/libros/${id}`, obtenerConfigAuth());
        traerDatosIniciales();
      } catch (err) {
        alert('Error al eliminar.');
      }
    }
  };

  // --- FUNCIONES PARA CREACIÓN RÁPIDA (AUTORES Y GÉNEROS) ---
  const manejarGuardarAutor = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${urlBase}/api/autores/`, formDataAutor, obtenerConfigAuth());
      setAutores([...autores, res.data]); // Agregar a la lista local
      setFormData({ ...formData, autor_id: res.data.id }); // Auto-seleccionar
      setMostrarModalAutor(false);
      setFormDataAutor({ nombre: '', apellido: '', biografia: '', url_foto: '' }); // Limpiar
    } catch (err) {
      alert('Error al crear el autor.');
    }
  };

  const manejarGuardarGenero = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formDataGenero, edad_minima: parseInt(formDataGenero.edad_minima) || 0 };
      const res = await axios.post(`${urlBase}/api/generos/`, payload, obtenerConfigAuth());
      setGeneros([...generos, res.data]);
      setFormData({ ...formData, genero_id: res.data.id });
      setMostrarModalGenero(false);
      setFormDataGenero({ nombre: '', edad_minima: 0 });
    } catch (err) {
      alert('Error al crear el género.');
    }
  };

  if (!usuario) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Verificando credenciales...</p>;

  return (
    <div style={{ maxWidth: '1100px', margin: '30px auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      
      {/* HEADER DE ADMINISTRADOR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, color: '#1a202c' }}>🛡️ Panel de CONTROL TOTAL (Admin)</h2>
          <p style={{ margin: '5px 0 0 0', color: '#e53e3e', fontWeight: 'bold' }}>
            Operando como: {usuario.nombre} (ADMIN)
          </p>
        </div>
        <button onClick={manejarCerrarSesion} style={{ padding: '8px 16px', backgroundColor: '#2d3748', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Cerrar Sesión
        </button>
      </div>
      <hr style={{ margin: '20px 0', borderColor: '#e53e3e' }} />

      {/* DISPOSICIÓN EN DOS COLUMNAS */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px', alignItems: 'start' }}>
        
        {/* COLUMNA 1: CONTROL USUARIOS */}
        <div style={{ backgroundColor: '#fefcbf', padding: '20px', borderRadius: '8px', border: '1px solid #faf089' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#744210' }}>👥 Control de Usuarios</h4>
          <p style={{ fontSize: '13px', color: '#975a16' }}>Gestión de roles y estado de cuentas.</p>
          <button style={{ padding: '8px 14px', backgroundColor: '#fff', border: '1px solid #cbd5e0', borderRadius: '4px', cursor: 'pointer', marginTop: '10px' }}>
            Gestionar Usuarios
          </button>
        </div>

        {/* COLUMNA 2: CATÁLOGO */}
        <div style={{ backgroundColor: '#f7fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h4 style={{ margin: 0, color: '#2d3748' }}>📚 Control de Libros</h4>
            <button onClick={abrirModalCrear} style={{ padding: '8px 14px', backgroundColor: '#38a169', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              ➕ Nuevo Libro
            </button>
          </div>

          {cargando ? <p>Cargando datos...</p> : errorGlobal ? <p style={{color: 'red'}}>{errorGlobal}</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {libros.map((libro) => (
                <div key={libro.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: '12px', border: '1px solid #edf2f7', borderRadius: '6px' }}>
                  <div>
                    <strong style={{ color: '#2d3748', display: 'block' }}>{libro.titulo}</strong>
                    <span style={{ fontSize: '12px', color: '#718096' }}>
                      Autor: {libro.autor ? libro.autor.nombre : 'N/A'} | Género: {libro.genero ? libro.genero.nombre : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <button onClick={() => abrirModalEditar(libro)} style={{ marginRight: '6px', padding: '6px', backgroundColor: '#ecc94b', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>✏️</button>
                    <button onClick={() => manejarEliminarLibro(libro.id, libro.titulo)} style={{ padding: '6px', backgroundColor: '#e53e3e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* =========================================
          🖼️ MODAL PRINCIPAL: LIBRO
          ========================================= */}
      {mostrarModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '8px', width: '450px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginTop: 0 }}>{modoEdicion ? '✏️ Editar Libro' : '➕ Agregar Libro'}</h3>
            <form onSubmit={manejarGuardarLibro}>
              
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Título:</label>
                <input type="text" required value={formData.titulo} onChange={(e) => setFormData({ ...formData, titulo: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e0', borderRadius: '4px', boxSizing: 'border-box' }} />
              </div>

              {/* SELECT DE AUTOR CON BOTÓN + */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Autor:</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select value={formData.autor_id} onChange={(e) => setFormData({ ...formData, autor_id: e.target.value })} style={{ flexGrow: 1, padding: '8px', border: '1px solid #cbd5e0', borderRadius: '4px' }}>
                    <option value="">-- Seleccionar Autor --</option>
                    {autores.map(a => <option key={a.id} value={a.id}>{a.nombre} {a.apellido || ''}</option>)}
                  </select>
                  <button type="button" onClick={() => setMostrarModalAutor(true)} style={{ padding: '8px 12px', backgroundColor: '#4299e1', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }} title="Agregar nuevo autor">+</button>
                </div>
              </div>

              {/* SELECT DE GÉNERO CON BOTÓN + */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Género:</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select value={formData.genero_id} onChange={(e) => setFormData({ ...formData, genero_id: e.target.value })} style={{ flexGrow: 1, padding: '8px', border: '1px solid #cbd5e0', borderRadius: '4px' }}>
                    <option value="">-- Seleccionar Género --</option>
                    {generos.map(g => <option key={g.id} value={g.id}>{g.nombre}</option>)}
                  </select>
                  <button type="button" onClick={() => setMostrarModalGenero(true)} style={{ padding: '8px 12px', backgroundColor: '#4299e1', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }} title="Agregar nuevo género">+</button>
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Sinopsis:</label>
                <textarea rows="3" value={formData.sinopsis} onChange={(e) => setFormData({ ...formData, sinopsis: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e0', borderRadius: '4px', boxSizing: 'border-box' }} />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>URL Portada:</label>
                  <input type="url" value={formData.url_portada} onChange={(e) => setFormData({ ...formData, url_portada: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e0', borderRadius: '4px', boxSizing: 'border-box' }} />
                </div>
                <div style={{ width: '100px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Edad (+):</label>
                  <input type="number" value={formData.edad_objetivo} onChange={(e) => setFormData({ ...formData, edad_objetivo: parseInt(e.target.value) || 0 })} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e0', borderRadius: '4px', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() => setMostrarModal(false)} style={{ padding: '8px 14px', backgroundColor: '#a0aec0', color: 'white', border: 'none', borderRadius: '4px' }}>Cancelar</button>
                <button type="submit" style={{ padding: '8px 14px', backgroundColor: '#38a169', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>Guardar Libro</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================
          👤 SUB-MODAL: NUEVO AUTOR
          ========================================= */}
      {mostrarModalAutor && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1010 }}>
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', width: '350px' }}>
            <h4 style={{ marginTop: 0 }}>👤 Crear Autor Rápido</h4>
            <form onSubmit={manejarGuardarAutor}>
              <div style={{ marginBottom: '10px' }}><input type="text" placeholder="Nombre (Obligatorio)" required value={formDataAutor.nombre} onChange={e => setFormDataAutor({...formDataAutor, nombre: e.target.value})} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} /></div>
              <div style={{ marginBottom: '10px' }}><input type="text" placeholder="Apellido (Opcional)" value={formDataAutor.apellido} onChange={e => setFormDataAutor({...formDataAutor, apellido: e.target.value})} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} /></div>
              <div style={{ marginBottom: '15px' }}><textarea placeholder="Biografía corta..." rows="2" value={formDataAutor.biografia} onChange={e => setFormDataAutor({...formDataAutor, biografia: e.target.value})} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} /></div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() => setMostrarModalAutor(false)} style={{ padding: '6px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" style={{ padding: '6px 12px', backgroundColor: '#3182ce', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Guardar Autor</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================
          🎭 SUB-MODAL: NUEVO GÉNERO
          ========================================= */}
      {mostrarModalGenero && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1010 }}>
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', width: '300px' }}>
            <h4 style={{ marginTop: 0 }}>🎭 Crear Género Rápido</h4>
            <form onSubmit={manejarGuardarGenero}>
              <div style={{ marginBottom: '10px' }}>
                <input type="text" placeholder="Nombre (ej. Fantasía)" required value={formDataGenero.nombre} onChange={e => setFormDataGenero({...formDataGenero, nombre: e.target.value})} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ fontSize: '12px' }}>Edad Mínima Sugerida:</label>
                <input type="number" min="0" value={formDataGenero.edad_minima} onChange={e => setFormDataGenero({...formDataGenero, edad_minima: e.target.value})} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() => setMostrarModalGenero(false)} style={{ padding: '6px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" style={{ padding: '6px 12px', backgroundColor: '#d69e2e', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Guardar Género</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
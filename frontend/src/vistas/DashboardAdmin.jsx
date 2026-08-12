import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const initialBook = { titulo: '', sinopsis: '', url_portada: '', edad_objetivo: 0, autor_id: '', genero_id: '' };

const DashboardAdmin = () => {
  const navigate = useNavigate();
  const [usuario] = useState(() => { 
    const guardado = localStorage.getItem('usuario_glancd'); 
    return guardado ? JSON.parse(guardado) : null; 
  });
  
  const [libros, setLibros] = useState([]); 
  const [autores, setAutores] = useState([]); 
  const [generos, setGeneros] = useState([]);
  const [cargando, setCargando] = useState(true); 
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null); 
  const [bookId, setBookId] = useState(null); 
  const [form, setForm] = useState(initialBook);
  const [autorForm, setAutorForm] = useState({ nombre_completo: '', biografia: '', url_foto: '' }); 
  const [generoForm, setGeneroForm] = useState({ nombre: '', edad_minima: 0 });
  
  const urlBase = import.meta.env.VITE_API_LIBROS || 'http://localhost:8001';
  const config = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token_glancd')}` } });

  const cargar = useCallback(async () => {
    try { 
      setCargando(true); 
      const [a, b, c] = await Promise.all([
        axios.get(`${urlBase}/api/libros/`, config()), 
        axios.get(`${urlBase}/api/autores/`, config()), 
        axios.get(`${urlBase}/api/generos/`, config())
      ]); 
      setLibros(a.data); 
      setAutores(b.data); 
      setGeneros(c.data); 
      setError(''); 
    } catch { 
      setError('No se pudo cargar la información del catálogo.'); 
    } finally { 
      setCargando(false); 
    }
  }, [urlBase]);

  useEffect(() => { 
    const saved = localStorage.getItem('usuario_glancd'); 
    if (!localStorage.getItem('token_glancd') || !saved) { 
      navigate('/'); 
      return; 
    } 
    const data = JSON.parse(saved); 
    if (data.rol !== 'administrador' && data.rol !== 'admin') { 
      navigate('/dashboard'); 
      return; 
    } 
    const timer = window.setTimeout(cargar, 0); 
    return () => window.clearTimeout(timer); 
  }, [navigate, cargar]);

  const abrirLibro = (libro = null) => { 
    setBookId(libro?.id || null); 
    setForm(libro ? { 
      titulo: libro.titulo || '', 
      sinopsis: libro.sinopsis || '', 
      url_portada: libro.url_portada || '', 
      edad_objetivo: libro.edad_objetivo || 0, 
      autor_id: libro.autor_id || '', 
      genero_id: libro.genero_id || '' 
    } : initialBook); 
    setModal('libro'); 
  };

  const guardarLibro = async (event) => { 
    event.preventDefault(); 
    const payload = { ...form, autor_id: form.autor_id || null, genero_id: form.genero_id ? Number(form.genero_id) : null }; 
    try { 
      await (bookId ? axios.put(`${urlBase}/api/libros/${bookId}`, payload, config()) : axios.post(`${urlBase}/api/libros/`, payload, config())); 
      setModal(null); 
      cargar(); 
    } catch { 
      setError('No se pudo guardar el libro. Revisa los datos e inténtalo de nuevo.'); 
    } 
  };

  const eliminar = async (id, titulo) => { 
    if (!window.confirm(`¿Eliminar “${titulo}”?`)) return; 
    try { 
      await axios.delete(`${urlBase}/api/libros/${id}`, config()); 
      cargar(); 
    } catch { 
      setError('No se pudo eliminar el libro.'); 
    } 
  };

  const guardarAutor = async (event) => { 
    event.preventDefault(); 
    try { 
      const respuesta = await axios.post(`${urlBase}/api/autores/`, autorForm, config()); 
      setAutores((actual) => [...actual, respuesta.data]); 
      setForm((actual) => ({ ...actual, autor_id: respuesta.data.id })); 
      setAutorForm({ nombre_completo: '', biografia: '', url_foto: '' }); 
      setModal('libro'); 
    } catch { 
      setError('No se pudo crear el autor.'); 
    } 
  };

  const guardarGenero = async (event) => { 
    event.preventDefault(); 
    try { 
      const respuesta = await axios.post(`${urlBase}/api/generos/`, { ...generoForm, edad_minima: Number(generoForm.edad_minima) || 0 }, config()); 
      setGeneros((actual) => [...actual, respuesta.data]); 
      setForm((actual) => ({ ...actual, genero_id: respuesta.data.id })); 
      setGeneroForm({ nombre: '', edad_minima: 0 }); 
      setModal('libro'); 
    } catch { 
      setError('No se pudo crear el género.'); 
    } 
  };

  if (!usuario) {
    return (
      <div style={{ ...estilos.shell, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <p style={{ color: '#8f9b95', fontSize: '1.2rem' }}>Verificando acceso…</p>
      </div>
    );
  }

  return (
    <div style={estilos.shell}>
      {/* ESTILOS GLOBALES PARA EL ADMIN */}
      <style>{`
        .glancd-input {
          width: 100%;
          padding: 12px 16px;
          background-color: rgba(15, 30, 25, 0.65);
          border: 1px solid rgba(251, 249, 241, 0.2);
          border-radius: 6px;
          color: #fbf9f1;
          font-size: 0.95rem;
          box-sizing: border-box;
          transition: all 0.2s ease;
        }
        .glancd-input:focus {
          outline: none;
          border-color: #e07a5f;
          background-color: rgba(15, 30, 25, 0.9);
        }
        .glancd-btn-primary {
          background-color: #e07a5f;
          color: #ffffff;
          padding: 12px 24px;
          border-radius: 6px;
          border: none;
          font-weight: bold;
          font-size: 0.95rem;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .glancd-btn-primary:hover {
          background-color: #d0694e;
        }
        .glancd-btn-ghost {
          background-color: transparent;
          color: #8f9b95;
          border: 1px solid rgba(251, 249, 241, 0.2);
          padding: 12px 24px;
          border-radius: 6px;
          font-weight: bold;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .glancd-btn-ghost:hover {
          border-color: #e07a5f;
          color: #e07a5f;
          background-color: rgba(224, 122, 95, 0.1);
        }
        .nav-link-admin {
          display: flex;
          justify-content: space-between;
          padding: 12px 16px;
          border-radius: 8px;
          color: #8f9b95;
          text-decoration: none;
          font-weight: 500;
          font-size: 0.95rem;
          transition: all 0.2s ease;
          margin-bottom: 8px;
        }
        .nav-link-admin:hover, .nav-link-admin.active {
          background-color: rgba(224, 122, 95, 0.1);
          color: #e07a5f;
        }
        .nav-link-admin.disabled {
          color: #4a5c54;
          cursor: not-allowed;
        }
        .nav-link-admin.disabled:hover {
          background-color: transparent;
        }
        .admin-table-row {
          display: grid;
          grid-template-columns: 2fr 1.5fr 1fr 0.5fr 1fr;
          gap: 16px;
          align-items: center;
          padding: 16px 0;
          border-bottom: 1px solid rgba(251, 249, 241, 0.08);
          color: #c2c8c5;
          font-size: 0.9rem;
        }
        .admin-table-label {
          color: #8f9b95;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: bold;
          border-bottom: 1px solid rgba(251, 249, 241, 0.2);
          padding-bottom: 12px;
        }
        .table-action-btn {
          background: rgba(251, 249, 241, 0.05);
          border: none;
          color: #fbf9f1;
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .table-action-btn:hover {
          background: rgba(251, 249, 241, 0.15);
        }
        .table-action-btn.danger {
          color: #f2a490;
          background: rgba(224, 122, 95, 0.15);
        }
        .table-action-btn.danger:hover {
          background: rgba(224, 122, 95, 0.3);
        }
        .mini-add-btn {
          background-color: rgba(224, 122, 95, 0.15);
          color: #e07a5f;
          border: 1px solid rgba(224, 122, 95, 0.3);
          border-radius: 6px;
          width: 44px;
          font-size: 1.2rem;
          cursor: pointer;
          display: flex;
          justify-content: center;
          align-items: center;
          transition: all 0.2s;
        }
        .mini-add-btn:hover {
          background-color: #e07a5f;
          color: white;
        }
      `}</style>

      {/* SIDEBAR */}
      <aside style={estilos.sidebar}>
        <a style={estilos.brandLogo} href="/dashboard-admin">
          glancd<span style={{ color: '#e07a5f' }}>.</span>
        </a>
        <p style={estilos.eyebrow}>ADMINISTRACIÓN</p>
        
        <nav style={{ flex: 1, marginTop: '20px' }}>
          <a className="nav-link-admin active" href="#catalogo">Catálogo</a>
          <a className="nav-link-admin" href="#autores">
            Autores <span style={estilos.badge}>{autores.length}</span>
          </a>
          <a className="nav-link-admin" href="#generos">
            Géneros <span style={estilos.badge}>{generos.length}</span>
          </a>
          <a className="nav-link-admin disabled" href="#usuarios">
            Usuarios <span style={estilos.badge}>Pronto</span>
          </a>
        </nav>

        <div style={estilos.adminProfile}>
          <div style={estilos.adminAvatar}>{usuario.nombre?.[0]?.toUpperCase() || 'A'}</div>
          <div>
            <strong style={{ display: 'block', fontSize: '0.9rem', color: '#fbf9f1' }}>{usuario.nombre}</strong>
            <small style={{ color: '#8f9b95', fontSize: '0.75rem' }}>Administrador</small>
          </div>
        </div>
        <button 
          style={estilos.logoutBtn} 
          onClick={() => { localStorage.clear(); navigate('/'); }}
        >
          Cerrar sesión
        </button>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main style={estilos.mainContent}>
        <header style={estilos.headerArea}>
          <div>
            <p style={estilos.eyebrow}>CENTRO DE CONTROL</p>
            <h1 style={estilos.title}>Buenos días, {usuario.nombre}.</h1>
            <p style={estilos.subtitle}>Cuida las historias que llegan a la comunidad.</p>
          </div>
          <button className="glancd-btn-primary" onClick={() => abrirLibro()}>
            + Añadir libro
          </button>
        </header>

        {/* TARJETAS DE ESTADÍSTICAS */}
        <section style={estilos.statsGrid}>
          <div style={estilos.statCard}>
            <span style={estilos.statLabel}>Libros publicados</span>
            <strong style={estilos.statValue}>{libros.length}</strong>
            <small style={estilos.statSub}>en el catálogo</small>
          </div>
          <div style={estilos.statCard}>
            <span style={estilos.statLabel}>Autores</span>
            <strong style={estilos.statValue}>{autores.length}</strong>
            <small style={estilos.statSub}>registrados</small>
          </div>
          <div style={estilos.statCard}>
            <span style={estilos.statLabel}>Géneros</span>
            <strong style={estilos.statValue}>{generos.length}</strong>
            <small style={estilos.statSub}>para explorar</small>
          </div>
        </section>

        {/* TABLA DE CATÁLOGO */}
        <section id="catalogo" style={estilos.managementCard}>
          <div style={estilos.managementHead}>
            <div>
              <h2 style={estilos.cardTitle}>Catálogo editorial</h2>
              <p style={estilos.cardSubtitle}>Gestiona las lecturas visibles en Glancd.</p>
            </div>
            <span style={estilos.catalogCount}>{libros.length} registros</span>
          </div>

          {error && <div style={{ ...estilos.notificacion, ...estilos.errorNotif }}>{error}</div>}
          
          {cargando ? (
            <div style={estilos.emptyState}>Cargando catálogo…</div>
          ) : (
            <div>
              <div className="admin-table-row admin-table-label">
                <span>Libro</span>
                <span>Autor</span>
                <span>Género</span>
                <span>Edad</span>
                <span style={{ textAlign: 'right' }}>Acciones</span>
              </div>
              
              {libros.map((libro) => (
                <div className="admin-table-row" key={libro.id}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={estilos.miniCover}>
                      {libro.url_portada ? (
                        <img src={libro.url_portada} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        libro.titulo?.[0]
                      )}
                    </div>
                    <strong style={{ color: '#fbf9f1' }}>{libro.titulo}</strong>
                  </div>
                  <span>{libro.autor ? libro.autor.nombre_completo : 'Sin autor'}</span>
                  <span>{libro.genero?.nombre || 'Sin género'}</span>
                  <span>+{libro.edad_objetivo || 0}</span>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button className="table-action-btn" onClick={() => abrirLibro(libro)}>Editar</button>
                    <button className="table-action-btn danger" onClick={() => eliminar(libro.id, libro.titulo)}>Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* MODAL: LIBRO */}
      {modal === 'libro' && (
        <div style={estilos.modalBackdrop}>
          <section style={estilos.modalCard}>
            <button style={estilos.cerrarModalBtn} onClick={() => setModal(null)}>✕</button>
            <p style={estilos.eyebrow}>{bookId ? 'EDITAR REGISTRO' : 'NUEVA LECTURA'}</p>
            <h2 style={estilos.modalTitle}>{bookId ? 'Ajusta los detalles.' : 'Añade una historia.'}</h2>
            
            <form style={estilos.formulario} onSubmit={guardarLibro}>
              <label style={estilos.label}>Título
                <input className="glancd-input" required value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
              </label>
              
              <div style={estilos.formPair}>
                <label style={estilos.label}>Autor
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select className="glancd-input" value={form.autor_id} onChange={(e) => setForm({ ...form, autor_id: e.target.value })}>
                      <option value="" style={{ color: '#000' }}>Selecciona un autor</option>
                      {autores.map((a) => <option key={a.id} value={a.id} style={{ color: '#000' }}>{a.nombre_completo}</option>)}
                    </select>
                    <button type="button" className="mini-add-btn" onClick={() => setModal('autor')}>+</button>
                  </div>
                </label>
                <label style={estilos.label}>Género
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select className="glancd-input" value={form.genero_id} onChange={(e) => setForm({ ...form, genero_id: e.target.value })}>
                      <option value="" style={{ color: '#000' }}>Selecciona un género</option>
                      {generos.map((g) => <option key={g.id} value={g.id} style={{ color: '#000' }}>{g.nombre}</option>)}
                    </select>
                    <button type="button" className="mini-add-btn" onClick={() => setModal('genero')}>+</button>
                  </div>
                </label>
              </div>

              <label style={estilos.label}>Sinopsis
                <textarea className="glancd-input" rows="4" value={form.sinopsis} onChange={(e) => setForm({ ...form, sinopsis: e.target.value })} />
              </label>

              <div style={estilos.formPair}>
                <label style={estilos.label}>URL de portada
                  <input className="glancd-input" type="url" value={form.url_portada} onChange={(e) => setForm({ ...form, url_portada: e.target.value })} />
                </label>
                <label style={estilos.label}>Edad sugerida
                  <input className="glancd-input" min="0" type="number" value={form.edad_objetivo} onChange={(e) => setForm({ ...form, edad_objetivo: Number(e.target.value) || 0 })} />
                </label>
              </div>

              <div style={estilos.modalActions}>
                <button className="glancd-btn-ghost" type="button" onClick={() => setModal(null)}>Cancelar</button>
                <button className="glancd-btn-primary" type="submit">Guardar libro</button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* MODAL: AUTOR */}
      {modal === 'autor' && (
        <div style={estilos.modalBackdrop}>
          <section style={{ ...estilos.modalCard, maxWidth: '450px' }}>
            <button style={estilos.cerrarModalBtn} onClick={() => setModal('libro')}>✕</button>
            <p style={estilos.eyebrow}>AUTOR NUEVO</p>
            <h2 style={estilos.modalTitle}>Una nueva voz.</h2>
            <form style={estilos.formulario} onSubmit={guardarAutor}>
              <label style={estilos.label}>Nombre completo
                <input className="glancd-input" required value={autorForm.nombre_completo} onChange={(e) => setAutorForm({ ...autorForm, nombre_completo: e.target.value })} />
              </label>
              <label style={estilos.label}>Biografía
                <textarea className="glancd-input" rows="3" value={autorForm.biografia} onChange={(e) => setAutorForm({ ...autorForm, biografia: e.target.value })} />
              </label>
              <div style={estilos.modalActions}>
                <button className="glancd-btn-ghost" type="button" onClick={() => setModal('libro')}>Volver</button>
                <button className="glancd-btn-primary" type="submit">Guardar autor</button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* MODAL: GÉNERO */}
      {modal === 'genero' && (
        <div style={estilos.modalBackdrop}>
          <section style={{ ...estilos.modalCard, maxWidth: '450px' }}>
            <button style={estilos.cerrarModalBtn} onClick={() => setModal('libro')}>✕</button>
            <p style={estilos.eyebrow}>GÉNERO NUEVO</p>
            <h2 style={estilos.modalTitle}>Abre una categoría.</h2>
            <form style={estilos.formulario} onSubmit={guardarGenero}>
              <label style={estilos.label}>Nombre
                <input className="glancd-input" required value={generoForm.nombre} onChange={(e) => setGeneroForm({ ...generoForm, nombre: e.target.value })} />
              </label>
              <label style={estilos.label}>Edad mínima
                <input className="glancd-input" min="0" type="number" value={generoForm.edad_minima} onChange={(e) => setGeneroForm({ ...generoForm, edad_minima: e.target.value })} />
              </label>
              <div style={estilos.modalActions}>
                <button className="glancd-btn-ghost" type="button" onClick={() => setModal('libro')}>Volver</button>
                <button className="glancd-btn-primary" type="submit">Guardar género</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
};

// ESTILOS ADAPTADOS DEL SISTEMA GLANCD
const estilos = {
  shell: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#0f1e19',
    color: '#fbf9f1',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  sidebar: {
    width: '260px',
    backgroundColor: '#162c25',
    borderRight: '1px solid rgba(251, 249, 241, 0.08)',
    padding: '30px 20px',
    display: 'flex',
    flexDirection: 'column',
    position: 'sticky',
    top: 0,
    height: '100vh',
    boxSizing: 'border-box'
  },
  brandLogo: {
    fontFamily: '"Georgia", serif',
    fontSize: '2.2rem',
    fontWeight: 'bold',
    color: '#fbf9f1',
    textDecoration: 'none',
    letterSpacing: '-0.5px',
    marginBottom: '30px',
    display: 'block'
  },
  eyebrow: {
    color: '#e07a5f',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    letterSpacing: '1.5px',
    margin: '0 0 8px 0',
    textTransform: 'uppercase'
  },
  badge: {
    backgroundColor: 'rgba(251, 249, 241, 0.1)',
    color: '#c2c8c5',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '0.75rem'
  },
  adminProfile: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    paddingTop: '20px',
    marginTop: 'auto',
    borderTop: '1px solid rgba(251, 249, 241, 0.08)'
  },
  adminAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#1f3d34',
    color: '#e07a5f',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontWeight: 'bold',
    fontSize: '1.1rem',
    border: '1px solid rgba(224, 122, 95, 0.3)'
  },
  logoutBtn: {
    background: 'none',
    border: 'none',
    color: '#8f9b95',
    textAlign: 'left',
    padding: '12px 0 0 0',
    fontSize: '0.85rem',
    cursor: 'pointer',
    textDecoration: 'underline'
  },
  mainContent: {
    flex: 1,
    padding: '40px 60px',
    overflowY: 'auto',
    boxSizing: 'border-box'
  },
  headerArea: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: '40px'
  },
  title: {
    fontFamily: '"Georgia", serif',
    fontSize: '2.8rem',
    margin: '4px 0 8px 0',
    color: '#fbf9f1'
  },
  subtitle: {
    fontSize: '1.05rem',
    color: '#c2c8c5',
    margin: 0
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '24px',
    marginBottom: '50px'
  },
  statCard: {
    backgroundColor: '#162c25',
    padding: '24px',
    borderRadius: '12px',
    border: '1px solid rgba(251, 249, 241, 0.08)',
    display: 'flex',
    flexDirection: 'column'
  },
  statLabel: {
    color: '#8f9b95',
    fontSize: '0.85rem',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },
  statValue: {
    fontFamily: '"Georgia", serif',
    fontSize: '2.5rem',
    color: '#e07a5f',
    margin: '8px 0'
  },
  statSub: {
    color: '#c2c8c5',
    fontSize: '0.85rem'
  },
  managementCard: {
    backgroundColor: '#162c25',
    padding: '30px',
    borderRadius: '12px',
    border: '1px solid rgba(251, 249, 241, 0.08)'
  },
  managementHead: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderBottom: '1px solid rgba(251, 249, 241, 0.1)',
    paddingBottom: '20px',
    marginBottom: '20px'
  },
  cardTitle: {
    fontFamily: '"Georgia", serif',
    fontSize: '1.8rem',
    margin: '0 0 6px 0'
  },
  cardSubtitle: {
    color: '#8f9b95',
    margin: 0,
    fontSize: '0.95rem'
  },
  catalogCount: {
    backgroundColor: 'rgba(251, 249, 241, 0.1)',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '0.85rem',
    color: '#c2c8c5'
  },
  miniCover: {
    width: '36px',
    height: '52px',
    backgroundColor: '#0f1e19',
    borderRadius: '4px',
    overflow: 'hidden',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: '"Georgia", serif',
    color: '#8f9b95',
    border: '1px solid rgba(251, 249, 241, 0.1)'
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px',
    color: '#8f9b95',
    border: '1px dashed rgba(251, 249, 241, 0.2)',
    borderRadius: '8px'
  },
  notificacion: {
    padding: '12px 16px',
    borderRadius: '6px',
    fontSize: '0.85rem',
    marginBottom: '20px'
  },
  errorNotif: {
    backgroundColor: 'rgba(224, 122, 95, 0.2)',
    border: '1px solid #e07a5f',
    color: '#f2a490'
  },
  modalBackdrop: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    zIndex: 1000,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px'
  },
  modalCard: {
    position: 'relative',
    width: '100%',
    maxWidth: '650px',
    backgroundColor: 'rgba(31, 61, 52, 0.95)',
    border: '1px solid rgba(251, 249, 241, 0.18)',
    borderRadius: '12px',
    padding: '40px',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.6)',
    maxHeight: '90vh',
    overflowY: 'auto'
  },
  cerrarModalBtn: {
    position: 'absolute',
    top: '20px',
    right: '25px',
    background: 'none',
    border: 'none',
    color: '#fbf9f1',
    fontSize: '1.4rem',
    cursor: 'pointer',
    opacity: 0.7
  },
  modalTitle: {
    fontFamily: '"Georgia", serif',
    fontSize: '2rem',
    margin: '0 0 24px 0',
    color: '#fbf9f1'
  },
  formulario: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  formPair: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px'
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    color: '#c2c8c5',
    fontSize: '0.85rem',
    fontWeight: 'bold'
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '10px',
    paddingTop: '20px',
    borderTop: '1px solid rgba(251, 249, 241, 0.1)'
  }
};

export default DashboardAdmin;
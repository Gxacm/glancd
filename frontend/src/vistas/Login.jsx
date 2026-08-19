import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();

  // Estado para controlar la vista del modal y su modo
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoRegistro, setModoRegistro] = useState(false);

  // Estados del formulario
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');

  // Mensajes de estado
  const [error, setError] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');

  // Libros Populares (Catálogo de vista previa)
  const [librosPopulares, setLibrosPopulares] = useState([]);
  const [cargandoLibros, setCargandoLibros] = useState(true);

  // Cargar tendencias desde la API al cargar el componente
  useEffect(() => {
    const cargarTendencias = async () => {
      try {
        const res = await axios.get(
          'https://www.googleapis.com/books/v1/volumes?q=subject:fiction&orderBy=relevance&maxResults=10'
        );
        
        if (res.data && res.data.items) {
          const librosFormateados = res.data.items.map((item) => ({
            id: item.id,
            titulo: item.volumeInfo.title || 'Sin título',
            autor: item.volumeInfo.authors ? item.volumeInfo.authors.join(', ') : 'Autor desconocido',
            portada: item.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:') || 
                     'https://via.placeholder.com/150x220?text=Sin+Portada'
          }));
          setLibrosPopulares(librosFormateados);
        }
      } catch (err) {
        console.error("Error cargando catálogo de vista previa:", err);
      } finally {
        setCargandoLibros(false);
      }
    };

    cargarTendencias();
  }, []);

  // Lógica de autenticación enviada a Axios
  const manejarAuth = async (event) => {
    event.preventDefault();
    setError('');
    setMensajeExito('');

    const url = modoRegistro
      ? `${import.meta.env.VITE_API_USUARIOS}/registrar`
      : `${import.meta.env.VITE_API_USUARIOS}/login`;

    const payload = modoRegistro
      ? { nombre, apellido, email, contrasena, fecha_nacimiento: fechaNacimiento }
      : { email, contrasena };

    try {
      const respuesta = await axios.post(url, payload);

      if (modoRegistro) {
        if (respuesta.data.token) {
          localStorage.setItem('token_glancd', respuesta.data.token);
        }
        localStorage.setItem('userId', respuesta.data.usuario.id);
        localStorage.setItem('usuario_glancd', JSON.stringify(respuesta.data.usuario));

        setMensajeExito('¡Cuenta creada con éxito! Redirigiendo al selector de géneros...');
        window.setTimeout(() => navigate('/onboarding'), 800);
      } else {
        localStorage.setItem('token_glancd', respuesta.data.token);
        localStorage.setItem('usuario_glancd', JSON.stringify(respuesta.data.usuario));
        localStorage.setItem('userId', respuesta.data.usuario.id);
        localStorage.setItem('token', respuesta.data.token); //

        setMensajeExito(`Bienvenido/a, ${respuesta.data.usuario.nombre}.`);

        const esAdmin = respuesta.data.usuario.rol === 'administrador' || respuesta.data.usuario.rol === 'admin';
        window.setTimeout(() => navigate(esAdmin ? '/dashboard-admin' : '/dashboard'), 700);
      }
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No fue posible conectar con el servicio de autenticación.');
    }
  };

  // Métodos para abrir el modal según el botón seleccionado
  const abrirLogin = () => {
    setModoRegistro(false);
    setError('');
    setMensajeExito('');
    setMostrarModal(true);
  };

  const abrirRegistro = () => {
    setModoRegistro(true);
    setError('');
    setMensajeExito('');
    setMostrarModal(true);
  };

  const alternarModo = () => {
    setModoRegistro(!modoRegistro);
    setError('');
    setMensajeExito('');
  };

  return (
    <div style={estilos.contenedorPagina}>
      {/* Estilos dinámicos para hovers y estados de inputs */}
      <style>{`
        .glancd-input {
          width: 100%;
          padding: 14px 16px;
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
        .glancd-input::placeholder {
          color: #8f9b95;
        }
        .glancd-btn-primary {
          background-color: #e07a5f;
          color: #ffffff;
          padding: 16px 32px;
          border-radius: 6px;
          border: none;
          font-weight: bold;
          font-size: 1.05rem;
          cursor: pointer;
          transition: background-color 0.2s, transform 0.1s;
        }
        .glancd-btn-primary:hover {
          background-color: #d0694e;
        }
        .glancd-btn-primary:active {
          transform: scale(0.98);
        }
        .glancd-btn-secondary {
          background-color: transparent;
          color: #fbf9f1;
          border: 1px solid rgba(251, 249, 241, 0.4);
          padding: 16px 32px;
          border-radius: 6px;
          font-weight: bold;
          font-size: 1.05rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .glancd-btn-secondary:hover {
          border-color: #e07a5f;
          color: #e07a5f;
          background-color: rgba(224, 122, 95, 0.1);
        }
        .glancd-link-btn {
          background: none;
          border: none;
          color: #fbf9f1;
          font-weight: bold;
          cursor: pointer;
          text-decoration: underline;
          padding: 0;
          font-size: 0.9rem;
        }
        .glancd-link-btn:hover {
          color: #e07a5f;
        }
        .glancd-card-hover {
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .glancd-card-hover:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.5);
        }
      `}</style>

      {/* HEADER SUPERIOR SOLO CON LOGO */}
      <header style={estilos.header}>
        <a style={estilos.brandLogo} href="/">
          glancd<span style={{ color: '#e07a5f' }}>.</span>
        </a>
      </header>

      {/* HERO PRINCIPAL */}
      <section style={estilos.heroSection}>
        <div style={estilos.heroOverlay}></div>

        <div style={estilos.heroContent}>
          <span style={estilos.heroEyebrow}>TU BIBLIOTECA DIGITAL PERSONAL</span>
          <h1 style={estilos.heroTitle}>
            Todas las historias que imaginas.<br />En un solo lugar.
          </h1>
          <p style={estilos.heroSubtitle}>
            Encuentra tendencias, guarda tus próximas lecturas y comparte lo que te dejaron los libros.
          </p>

          {/* ÚNICOS BOTONES DE ACCIÓN */}
          <div style={estilos.heroActions}>
            <button className="glancd-btn-primary" onClick={abrirRegistro}>
              Registrarse <span>→</span>
            </button>
            <button className="glancd-btn-secondary" onClick={abrirLogin}>
              Iniciar sesión
            </button>
          </div>
        </div>
      </section>

      {/* SECCIÓN DE LIBROS POPULARES */}
      <main style={estilos.mainContent}>
        <section>
          <div style={estilos.sectionHeader}>
            <p style={estilos.sectionEyebrow}>DESCUBRIMIENTO</p>
            <h2 style={estilos.sectionTitle}>Libros populares en tendencia</h2>
          </div>

          {cargandoLibros ? (
            <div style={{ textAlign: 'center', padding: '50px', color: '#8f9b95' }}>
              Cargando catálogo en tendencia...
            </div>
          ) : (
            <div style={estilos.gridLibros}>
              {librosPopulares.map((libro) => (
                <div 
                  key={libro.id} 
                  className="glancd-card-hover" 
                  style={estilos.cardLibro}
                  onClick={abrirLogin}
                >
                  <div style={estilos.coverContainer}>
                    <img
                      src={libro.portada}
                      alt={libro.titulo}
                      style={estilos.coverImage}
                    />
                  </div>
                  <div style={{ padding: '12px' }}>
                    <h3 style={estilos.libroTitulo}>{libro.titulo}</h3>
                    <p style={estilos.libroAutor}>{libro.autor}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* FOOTER */}
      <footer style={estilos.footer}>
        <p style={{ margin: 0 }}>glancd. — Un lugar para leer despacio y recordar siempre.</p>
      </footer>

      {/* MODAL CON FORMULARIO */}
      {mostrarModal && (
        <div style={estilos.modalBackdrop} onClick={() => setMostrarModal(false)}>
          <div style={estilos.card} onClick={(e) => e.stopPropagation()}>
            <button 
              style={estilos.cerrarModalBtn} 
              onClick={() => setMostrarModal(false)}
            >
              ✕
            </button>

            <h2 style={estilos.titulo}>
              {modoRegistro ? 'Crea tu cuenta' : 'Inicia sesión'}
            </h2>
            
            <p style={estilos.subtitulo}>
              {modoRegistro
                ? 'Empieza a guardar e interactuar con tus libros.'
                : 'Tus lecturas y reseñas te están esperando.'}
            </p>

            {/* Mensajes de Notificación */}
            {error && <div style={{ ...estilos.notificacion, ...estilos.errorNotif }}>{error}</div>}
            {mensajeExito && <div style={{ ...estilos.notificacion, ...estilos.exitoNotif }}>{mensajeExito}</div>}

            {/* Formulario */}
            <form style={estilos.formulario} onSubmit={manejarAuth}>
              {modoRegistro && (
                <>
                  <div>
                    <input
                      className="glancd-input"
                      type="text"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Nombre"
                      required
                    />
                  </div>
                  <div>
                    <input
                      className="glancd-input"
                      type="text"
                      value={apellido}
                      onChange={(e) => setApellido(e.target.value)}
                      placeholder="Apellido"
                      required
                    />
                  </div>
                  <div>
                    <input
                      className="glancd-input"
                      type="date"
                      value={fechaNacimiento}
                      onChange={(e) => setFechaNacimiento(e.target.value)}
                      required
                    />
                  </div>
                </>
              )}

              <div>
                <input
                  className="glancd-input"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Correo electrónico"
                  required
                />
              </div>

              <div>
                <input
                  className="glancd-input"
                  type="password"
                  value={contrasena}
                  onChange={(event) => setContrasena(event.target.value)}
                  placeholder="Contraseña"
                  required
                />
              </div>

              <button className="glancd-btn-primary" type="submit" style={{ width: '100%', marginTop: '10px' }}>
                {modoRegistro ? 'Registrarme ahora' : 'Iniciar sesión'}
              </button>
            </form>

            {/* Alternar dentro del modal */}
            <div style={estilos.cardFooter}>
              <p style={{ margin: 0 }}>
                {modoRegistro ? '¿Ya tienes cuenta en Glancd? ' : '¿Primera vez en Glancd? '}
                <button type="button" onClick={alternarModo} className="glancd-link-btn">
                  {modoRegistro ? 'Inicia sesión aquí.' : 'Regístrate ahora.'}
                </button>
              </p>

              <span style={estilos.cita}>
                “Los libros son espejos: solo se ve en ellos lo que uno ya lleva dentro.”
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ESTILOS EN LÍNEA
const estilos = {
  contenedorPagina: {
    backgroundColor: '#0f1e19',
    color: '#fbf9f1',
    minHeight: '100vh',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    position: 'relative'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px 50px',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20
  },
  brandLogo: {
    fontFamily: '"Georgia", serif',
    fontSize: '2.4rem',
    fontWeight: 'bold',
    color: '#fbf9f1',
    textDecoration: 'none',
    letterSpacing: '-0.5px'
  },
  heroSection: {
    position: 'relative',
    height: '75vh',
    minHeight: '480px',
    backgroundImage: `url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2000&auto=format&fit=crop')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '0 20px'
  },
  heroOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'radial-gradient(circle, rgba(15,30,25,0.65) 0%, rgba(15,30,25,0.98) 100%)',
    zIndex: 1
  },
  heroContent: {
    position: 'relative',
    zIndex: 2,
    maxWidth: '750px'
  },
  heroEyebrow: {
    color: '#e07a5f',
    fontSize: '0.85rem',
    fontWeight: 'bold',
    letterSpacing: '2px',
    marginBottom: '12px',
    display: 'block'
  },
  heroTitle: {
    fontFamily: '"Georgia", serif',
    fontSize: '3.2rem',
    fontWeight: '700',
    lineHeight: '1.2',
    margin: '0 0 16px 0',
    color: '#fbf9f1'
  },
  heroSubtitle: {
    fontSize: '1.2rem',
    color: '#c2c8c5',
    marginBottom: '35px'
  },
  heroActions: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  mainContent: {
    padding: '60px 50px',
    maxWidth: '1300px',
    margin: '0 auto'
  },
  sectionHeader: {
    marginBottom: '25px'
  },
  sectionEyebrow: {
    color: '#e07a5f',
    fontSize: '0.8rem',
    fontWeight: 'bold',
    letterSpacing: '1.5px',
    margin: 0,
    textTransform: 'uppercase'
  },
  sectionTitle: {
    fontFamily: '"Georgia", serif',
    fontSize: '2rem',
    margin: '6px 0 0 0',
    color: '#fbf9f1'
  },
  gridLibros: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
    gap: '24px'
  },
  cardLibro: {
    backgroundColor: '#162c25',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid rgba(251, 249, 241, 0.08)',
    cursor: 'pointer'
  },
  coverContainer: {
    height: '240px',
    overflow: 'hidden',
    backgroundColor: '#0f1e19'
  },
  coverImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  libroTitulo: {
    fontSize: '0.9rem',
    color: '#fbf9f1',
    margin: '0 0 4px 0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  libroAutor: {
    fontSize: '0.78rem',
    color: '#8f9b95',
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  footer: {
    textAlign: 'center',
    padding: '30px 20px',
    borderTop: '1px solid rgba(251,249,241,0.1)',
    color: '#8f9b95',
    fontSize: '0.85rem'
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
  card: {
    position: 'relative',
    width: '100%',
    maxWidth: '430px',
    backgroundColor: 'rgba(31, 61, 52, 0.95)',
    border: '1px solid rgba(251, 249, 241, 0.18)',
    borderRadius: '12px',
    padding: '40px 45px',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.6)'
  },
  cerrarModalBtn: {
    position: 'absolute',
    top: '15px',
    right: '20px',
    background: 'none',
    border: 'none',
    color: '#fbf9f1',
    fontSize: '1.2rem',
    cursor: 'pointer',
    opacity: 0.7
  },
  titulo: {
    fontFamily: '"Georgia", serif',
    fontSize: '2rem',
    margin: '0 0 8px 0',
    color: '#fbf9f1',
    fontWeight: '600'
  },
  subtitulo: {
    fontSize: '0.9rem',
    color: '#c2c8c5',
    marginBottom: '22px',
    marginTop: 0
  },
  formulario: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  notificacion: {
    padding: '12px 16px',
    borderRadius: '6px',
    fontSize: '0.85rem',
    marginBottom: '16px'
  },
  errorNotif: {
    backgroundColor: 'rgba(224, 122, 95, 0.2)',
    border: '1px solid #e07a5f',
    color: '#f2a490'
  },
  exitoNotif: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    border: '1px solid #4caf50',
    color: '#81c784'
  },
  cardFooter: {
    marginTop: '25px',
    fontSize: '0.9rem',
    color: '#a0aaa5'
  },
  cita: {
    display: 'block',
    marginTop: '20px',
    fontFamily: '"Georgia", serif',
    fontStyle: 'italic',
    fontSize: '0.8rem',
    color: '#8f9b95',
    textAlign: 'center'
  }
};

export default Login;
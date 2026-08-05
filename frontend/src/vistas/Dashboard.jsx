import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const navigate = useNavigate();
  
  const [usuario] = useState(() => {
    const guardado = localStorage.getItem('usuario_glancd');
    return guardado ? JSON.parse(guardado) : null;
  });

  const [secciones, setSecciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const urlBase = import.meta.env.VITE_API_LIBROS || 'http://localhost:8001';

  useEffect(() => {
    const token = localStorage.getItem('token_glancd');
    const usuarioGuardado = localStorage.getItem('usuario_glancd');

    if (!token || !usuarioGuardado) { 
      navigate('/'); 
      return; 
    }

    const parsedUser = JSON.parse(usuarioGuardado);
    const userId = parsedUser.id || localStorage.getItem('userId');

    // Cargar recomendaciones por género de la API
    axios.get(`${urlBase}/api/libros/recomendados/${userId}`)
      .then((respuesta) => {
        setSecciones(respuesta.data);
      })
      .catch((err) => {
        console.error('Error cargando recomendaciones:', err);
        setError('No pudimos cargar tus recomendaciones personalizadas. Inténtalo de nuevo.');
      })
      .finally(() => setCargando(false));
  }, [navigate, urlBase]);

  const cerrarSesion = () => { 
    localStorage.clear(); 
    navigate('/'); 
  };

  if (!usuario) return <div className="page-loading">Preparando tu biblioteca…</div>;

  return (
    <div className="app-shell">
      {/* HEADER SUPERIOR */}
      <header className="topbar">
        <a className="brand" href="/dashboard">glancd<span>.</span></a>
        <nav className="main-nav" aria-label="Navegación principal">
          <a className="active" href="#explorar">Explorar</a>
          <a href="#mi-biblioteca">Mi biblioteca</a>
          <a href="#resenas">Reseñas</a>
        </nav>
        <div className="user-actions">
          <span className="user-avatar">{usuario.nombre?.[0] || 'L'}</span>
          <button className="button button-ghost" onClick={cerrarSesion}>Salir</button>
        </div>
      </header>

      <main className="content-wrap">
        {/* WELCOME BANNER */}
        <section className="welcome-banner">
          <div>
            <p className="eyebrow">Tu espacio de lectura</p>
            <h1>Hola, {usuario.nombre}.</h1>
            <p>Descubre nuevas historias seleccionadas según tus géneros preferidos.</p>
          </div>
          <div className="banner-ornament" aria-hidden="true">✦</div>
        </section>

        {/* CONTENIDO PRINCIPAL / ESTADOS */}
        <section id="explorar" className="catalog-section">
          {cargando && <div className="empty-state">Buscando los mejores libros para ti…</div>}
          
          {error && <div className="notice notice-error">{error}</div>}

          {!cargando && !error && secciones.length === 0 && (
            <div className="empty-state">
              No encontramos géneros guardados. Completa tu perfil para recibir recomendaciones personalizadas.
            </div>
          )}

          {/* FILAS DE CARRUSELES POR GÉNERO */}
          {!cargando && !error && secciones.map((sec, sIndex) => (
            <div key={sIndex} style={{ marginBottom: '40px' }}>
              
              {/* ENCABEZADO DE SECCIÓN DE GÉNERO */}
              <div className="section-heading" style={{ marginBottom: '16px' }}>
                <div>
                  <p className="eyebrow">Porque te gusta</p>
                  <h2 style={{ textTransform: 'capitalize' }}>{sec.genero}</h2>
                </div>
                <span className="catalog-count">{sec.libros?.length || 0} sugerencias</span>
              </div>

              {/* CONTENEDOR CON SCROLL HORIZONTAL */}
              <div style={{
                display: 'flex',
                gap: '20px',
                overflowX: 'auto',
                paddingBottom: '16px',
                scrollBehavior: 'smooth'
              }}>
                {sec.libros && sec.libros.map((libro, index) => (
                  <article 
                    className="book-card" 
                    key={libro.google_id || index}
                    style={{ minWidth: '220px', maxWidth: '220px', flexShrink: 0 }}
                  >
                    <div className={`book-cover cover-${(index % 4) + 1}`}>
                      {libro.url_portada ? (
                        <img src={libro.url_portada} alt={`Portada de ${libro.titulo}`} />
                      ) : (
                        <span>{libro.titulo?.slice(0, 1)}</span>
                      )}
                    </div>
                    
                    <div className="book-info">
                      <p className="book-author">{libro.nombre_autor || 'Autor por descubrir'}</p>
                      <h3>{libro.titulo}</h3>
                      <p className="book-synopsis">
                        {libro.sinopsis ? libro.sinopsis : 'Una historia recomendada especialmente para tu biblioteca.'}
                      </p>
                      
                      <div className="book-meta">
                        <span>{libro.origen || 'Recomendación'}</span>
                        <button aria-label={`Guardar ${libro.titulo}`} className="save-book">♡</button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

            </div>
          ))}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
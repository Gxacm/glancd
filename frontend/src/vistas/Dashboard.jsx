import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const navigate = useNavigate();
  const [usuario] = useState(() => {
    const guardado = localStorage.getItem('usuario_glancd');
    return guardado ? JSON.parse(guardado) : null;
  });
  const [libros, setLibros] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const urlBase = import.meta.env.VITE_API_LIBROS || 'http://localhost:8001';

  useEffect(() => {
    const token = localStorage.getItem('token_glancd');
    const usuarioGuardado = localStorage.getItem('usuario_glancd');
    if (!token || !usuarioGuardado) { navigate('/'); return; }
    axios.get(`${urlBase}/api/libros/`, { headers: { Authorization: `Bearer ${token}` } })
      .then((respuesta) => setLibros(respuesta.data))
      .catch(() => setError('No pudimos cargar el catálogo. Inténtalo de nuevo en unos minutos.'))
      .finally(() => setCargando(false));
  }, [navigate, urlBase]);

  const cerrarSesion = () => { localStorage.clear(); navigate('/'); };
  if (!usuario) return <div className="page-loading">Preparando tu biblioteca…</div>;

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="/dashboard">glancd<span>.</span></a>
        <nav className="main-nav" aria-label="Navegación principal"><a className="active" href="#explorar">Explorar</a><a href="#mi-biblioteca">Mi biblioteca</a><a href="#resenas">Reseñas</a></nav>
        <div className="user-actions"><span className="user-avatar">{usuario.nombre?.[0] || 'L'}</span><button className="button button-ghost" onClick={cerrarSesion}>Salir</button></div>
      </header>

      <main className="content-wrap">
        <section className="welcome-banner">
          <div><p className="eyebrow">Tu espacio de lectura</p><h1>Hola, {usuario.nombre}.</h1><p>¿Qué historia quieres descubrir hoy?</p></div>
          <div className="banner-ornament" aria-hidden="true">✦</div>
        </section>
        <section id="explorar" className="catalog-section">
          <div className="section-heading"><div><p className="eyebrow">Selección del catálogo</p><h2>Historias para quedarte un rato.</h2></div><span className="catalog-count">{libros.length} títulos</span></div>
          {cargando && <div className="empty-state">Buscando los libros de hoy…</div>}
          {error && <div className="notice notice-error">{error}</div>}
          {!cargando && !error && <div className="book-grid">
            {libros.map((libro, index) => <article className="book-card" key={libro.id}>
              <div className={`book-cover cover-${(index % 4) + 1}`}>{libro.url_portada ? <img src={libro.url_portada} alt={`Portada de ${libro.titulo}`} /> : <span>{libro.titulo?.slice(0, 1)}</span>}</div>
              <div className="book-info"><p className="book-author">{libro.autor?.nombre_completo || 'Autor por descubrir'}</p><h3>{libro.titulo}</h3><p className="book-synopsis">{libro.sinopsis || 'Una nueva historia esperándote en el catálogo.'}</p><div className="book-meta"><span>{libro.genero?.nombre || 'Lectura'}</span><button aria-label={`Guardar ${libro.titulo}`} className="save-book">♡</button></div></div>
            </article>)}
          </div>}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;

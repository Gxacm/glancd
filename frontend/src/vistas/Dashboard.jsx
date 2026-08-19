import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navegacion from '../componentes/Navegacion';

const Dashboard = () => {
  const navigate = useNavigate();
  
  const [usuario] = useState(() => {
    const guardado = localStorage.getItem('usuario_glancd');
    return guardado ? JSON.parse(guardado) : null;
  });

  const [secciones, setSecciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [librosGuardados, setLibrosGuardados] = useState(() => new Set());
  const [actualizandoLike, setActualizandoLike] = useState(null);

  const urlRecomendador = import.meta.env.VITE_API_RECOMENDADOR || 'http://localhost:8005';
  const urlLibros = import.meta.env.VITE_API_LIBROS || 'http://localhost:8001';
  const urlInteracciones = import.meta.env.VITE_API_INTERACCIONES || 'http://localhost:8003';

  useEffect(() => {
    const token = localStorage.getItem('token_glancd');
    const usuarioGuardado = localStorage.getItem('usuario_glancd');

    if (!token || !usuarioGuardado) { 
      navigate('/'); 
      return; 
    }

    const auth = { headers: { Authorization: `Bearer ${token}` } };
    Promise.allSettled([
      axios.get(`${urlRecomendador}/api/recomendaciones/`, auth),
      axios.get(`${urlInteracciones}/api/interacciones/biblioteca`, auth),
    ])
      .then(([recomendaciones, biblioteca]) => {
        if (recomendaciones.status === 'fulfilled') setSecciones(recomendaciones.value.data);
        else throw recomendaciones.reason;
        if (biblioteca.status === 'fulfilled') setLibrosGuardados(new Set(biblioteca.value.data.flatMap((libro) => [libro.id, libro.google_id].filter(Boolean))));
      })
      .catch((err) => {
        console.error('Error cargando recomendaciones o biblioteca:', err);
        setError('No pudimos cargar tus recomendaciones personalizadas. Inténtalo de nuevo.');
      })
      .finally(() => setCargando(false));
  }, [navigate, urlInteracciones, urlRecomendador]);

  const alternarLike = async (event, libro) => {
    event.stopPropagation();
    const token = localStorage.getItem('token_glancd');
    if (!token || actualizandoLike) return;
    const identificador = libro.google_id || libro.id;
    const estabaGuardado = librosGuardados.has(identificador);
    setLibrosGuardados((actual) => {
      const siguiente = new Set(actual);
      if (estabaGuardado) siguiente.delete(identificador); else siguiente.add(identificador);
      return siguiente;
    });
    setActualizandoLike(identificador);
    try {
      let libroId = libro.id;
      const esUuid = typeof libroId === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(libroId);
      if (!esUuid) {
        const guardado = await axios.post(`${urlLibros}/api/libros/`, {
          titulo: libro.titulo,
          sinopsis: libro.sinopsis || 'Sin sinopsis',
          url_portada: libro.url_portada,
          google_id: libro.google_id || libro.id,
          nombre_autor: libro.nombre_autor || 'Autor desconocido',
        }, { headers: { Authorization: `Bearer ${token}` } });
        libroId = guardado.data.id;
      }
      const respuesta = await axios.post(`${urlInteracciones}/api/interacciones/likes/libros`, { libro_id: libroId }, { headers: { Authorization: `Bearer ${token}` } });
      setLibrosGuardados((actual) => {
        const siguiente = new Set(actual);
        if (respuesta.data.estado) { siguiente.add(libroId); siguiente.add(identificador); }
        else { siguiente.delete(libroId); siguiente.delete(identificador); }
        return siguiente;
      });
    } catch (err) {
      console.error('Error actualizando like desde el panel:', err);
      setLibrosGuardados((actual) => {
        const siguiente = new Set(actual);
        if (estabaGuardado) siguiente.add(identificador); else siguiente.delete(identificador);
        return siguiente;
      });
      setError(err.response?.data?.detail || 'No pudimos actualizar tu biblioteca.');
    } finally { setActualizandoLike(null); }
  };

  if (!usuario) {
    return (
      <div style={{ ...estilos.contenedorPagina, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <p style={{ color: '#8f9b95', fontSize: '1.2rem' }}>Preparando tu biblioteca…</p>
      </div>
    );
  }

  return (
    <div style={estilos.contenedorPagina}>
      {/* ESTILOS GLOBALES Y HOVERS DEL DASHBOARD */}
      <style>{`
        .glancd-card-hover {
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .glancd-card-hover:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.5);
        }
        /* Custom Scrollbar para el carrusel horizontal */
        .scroll-container::-webkit-scrollbar {
          height: 8px;
        }
        .scroll-container::-webkit-scrollbar-track {
          background: rgba(15, 30, 25, 0.5); 
          border-radius: 4px;
        }
        .scroll-container::-webkit-scrollbar-thumb {
          background: rgba(143, 155, 149, 0.3); 
          border-radius: 4px;
        }
        .scroll-container::-webkit-scrollbar-thumb:hover {
          background: #e07a5f; 
        }
      `}</style>

      {/* AQUÍ INYECTAMOS TU NUEVO COMPONENTE DE NAVEGACIÓN */}
      <Navegacion />

      <main style={estilos.mainContent}>
        {/* WELCOME BANNER */}
        <section style={estilos.welcomeBanner}>
          <div>
            <p style={estilos.sectionEyebrow}>TU ESPACIO DE LECTURA</p>
            <h1 style={estilos.heroTitle}>Hola, {usuario.nombre}.</h1>
            <p style={estilos.heroSubtitle}>Descubre nuevas historias seleccionadas según tus géneros preferidos.</p>
          </div>
          <div style={estilos.bannerOrnament} aria-hidden="true">✦</div>
        </section>

        {/* CONTENIDO PRINCIPAL / ESTADOS */}
        <section id="recomendaciones">
          {cargando && (
            <div style={estilos.emptyState}>Buscando los mejores libros para ti…</div>
          )}
          
          {error && (
            <div style={{ ...estilos.notificacion, ...estilos.errorNotif }}>{error}</div>
          )}

          {!cargando && !error && secciones.length === 0 && (
            <div style={estilos.emptyState}>
              No encontramos géneros guardados. Completa tu perfil para recibir recomendaciones personalizadas.
            </div>
          )}

          {/* FILAS DE CARRUSELES POR GÉNERO */}
          {!cargando && !error && secciones.map((sec, sIndex) => (
            <div key={sIndex} style={{ marginBottom: '50px' }}>
              
              {/* ENCABEZADO DE SECCIÓN DE GÉNERO */}
              <div style={estilos.sectionHeaderContainer}>
                <div>
                  <p style={estilos.sectionEyebrow}>PORQUE TE GUSTA</p>
                  <h2 style={{ ...estilos.sectionTitle, textTransform: 'capitalize' }}>
                    {sec.genero}
                  </h2>
                </div>
                <span style={estilos.catalogCount}>{sec.libros?.length || 0} sugerencias</span>
              </div>

              {/* CONTENEDOR CON SCROLL HORIZONTAL */}
              <div className="scroll-container" style={estilos.scrollContainer}>
                {sec.libros && sec.libros.map((libro, index) => (
                  <article 
                    className="glancd-card-hover" 
                    key={`${libro.google_id}-${index}`}
                    style={{...estilos.cardLibro, cursor: 'pointer'}}
                    onClick={() => navigate(`/libro/${libro.id || libro.google_id}`)}>
                    <div style={estilos.coverContainer}>
                    {/* Fondo con la inicial siempre presente */}
                    <div style={estilos.coverFallbackBg}>
                      {libro.titulo?.slice(0, 1)}
                    </div>

                    {/* Validamos que exista la portada y que NO sea el enlace roto del placeholder */}
                    {libro.url_portada && !libro.url_portada.includes('placeholder.com') && (
                      <img 
                        src={libro.url_portada.replace('http:', 'https:')} 
                        alt={`Portada de ${libro.titulo}`} 
                        style={estilos.coverImageOver}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                  </div>
                    
                    <div style={estilos.cardInfo}>
                      <p style={estilos.libroAutor}>{libro.nombre_autor || 'Autor por descubrir'}</p>
                      <h3 style={estilos.libroTitulo}>{libro.titulo}</h3>
                      <p style={estilos.libroSinopsis}>
                        {libro.sinopsis ? libro.sinopsis : 'Una historia recomendada especialmente para tu biblioteca.'}
                      </p>
                      
                      <div style={estilos.cardMeta}>
                        <span style={estilos.tagOrigen}>{libro.origen || 'Recomendación'}</span>
                        <button onClick={(event) => alternarLike(event, libro)} style={{ ...estilos.saveBtn, color: librosGuardados.has(libro.google_id || libro.id) ? '#e07a5f' : '#8f9b95' }} aria-label={`${librosGuardados.has(libro.google_id || libro.id) ? 'Quitar' : 'Guardar'} ${libro.titulo}`} disabled={actualizandoLike === (libro.google_id || libro.id)}>
                          {librosGuardados.has(libro.google_id || libro.id) ? '♥' : '♡'}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

            </div>
          ))}
        </section>
      </main>
      
      {/* FOOTER */}
      <footer style={estilos.footer}>
        <p style={{ margin: 0 }}>glancd. — Un lugar para leer despacio y recordar siempre.</p>
      </footer>
    </div>
  );
};

// ESTILOS LIMPIOS
const estilos = {
  contenedorPagina: { backgroundColor: '#0f1e19', color: '#fbf9f1', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', display: 'flex', flexDirection: 'column' },
  mainContent: { padding: '40px 50px', maxWidth: '1400px', margin: '0 auto', flex: 1, width: '100%', boxSizing: 'border-box' },
  welcomeBanner: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#162c25', padding: '40px 50px', borderRadius: '12px', border: '1px solid rgba(251, 249, 241, 0.08)', marginBottom: '50px', position: 'relative', overflow: 'hidden' },
  heroTitle: { fontFamily: '"Georgia", serif', fontSize: '2.8rem', fontWeight: '700', margin: '10px 0', color: '#fbf9f1' },
  heroSubtitle: { fontSize: '1.1rem', color: '#c2c8c5', margin: 0 },
  bannerOrnament: { fontSize: '8rem', color: 'rgba(224, 122, 95, 0.05)', position: 'absolute', right: '-20px', bottom: '-40px', fontFamily: 'serif', userSelect: 'none' },
  sectionHeaderContainer: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px', borderBottom: '1px solid rgba(251, 249, 241, 0.1)', paddingBottom: '12px' },
  sectionEyebrow: { color: '#e07a5f', fontSize: '0.8rem', fontWeight: 'bold', letterSpacing: '1.5px', margin: 0 },
  sectionTitle: { fontFamily: '"Georgia", serif', fontSize: '1.8rem', margin: '6px 0 0 0', color: '#fbf9f1' },
  catalogCount: { fontSize: '0.85rem', color: '#8f9b95', fontWeight: '500' },
  scrollContainer: { display: 'flex', gap: '24px', overflowX: 'auto', paddingBottom: '20px', scrollBehavior: 'smooth' },
  cardLibro: { backgroundColor: '#162c25', borderRadius: '8px', border: '1px solid rgba(251, 249, 241, 0.08)', minWidth: '220px', maxWidth: '220px', flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  
  // --- INICIO DE ESTILOS DE PORTADA MODIFICADOS ---
  coverContainer: { 
    height: '260px', 
    backgroundColor: '#0f1e19', 
    position: 'relative', 
    overflow: 'hidden' 
  },
  coverFallbackBg: { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    width: '100%', 
    height: '100%', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    fontSize: '4rem', 
    fontFamily: '"Georgia", serif', 
    color: '#1f3d34', 
    backgroundColor: '#0f1e19',
    zIndex: 1 
  },
  coverImageOver: { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    width: '100%', 
    height: '100%', 
    objectFit: 'cover', // Mantenemos 'cover' para que siga la línea de tu diseño actual. Si se cortan mucho, cámbialo a 'contain'
    objectPosition: 'center',
    zIndex: 2 
  },
  // --- FIN DE ESTILOS DE PORTADA MODIFICADOS ---

  cardInfo: { padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 },
  libroTitulo: { fontSize: '1rem', color: '#fbf9f1', margin: '0 0 8px 0', lineHeight: '1.3', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  libroAutor: { fontSize: '0.8rem', color: '#e07a5f', margin: '0 0 6px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: '500' },
  libroSinopsis: { fontSize: '0.85rem', color: '#8f9b95', margin: '0 0 16px 0', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 },
  cardMeta: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', borderTop: '1px solid rgba(251, 249, 241, 0.08)', paddingTop: '12px' },
  tagOrigen: { fontSize: '0.75rem', color: '#8f9b95', backgroundColor: 'rgba(251, 249, 241, 0.05)', padding: '4px 8px', borderRadius: '4px' },
  saveBtn: { background: 'none', border: 'none', color: '#8f9b95', fontSize: '1.2rem', cursor: 'pointer', transition: 'color 0.2s ease' },
  emptyState: { textAlign: 'center', padding: '60px', color: '#8f9b95', backgroundColor: '#162c25', borderRadius: '8px', border: '1px dashed rgba(251, 249, 241, 0.2)', fontSize: '1.1rem' },
  notificacion: { padding: '16px', borderRadius: '6px', fontSize: '0.9rem', marginBottom: '24px' },
  errorNotif: { backgroundColor: 'rgba(224, 122, 95, 0.2)', border: '1px solid #e07a5f', color: '#f2a490' },
  footer: { textAlign: 'center', padding: '30px 20px', borderTop: '1px solid rgba(251,249,241,0.1)', color: '#8f9b95', fontSize: '0.85rem', marginTop: 'auto' }
};

export default Dashboard;

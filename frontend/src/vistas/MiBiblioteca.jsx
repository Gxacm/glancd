import { useState, useEffect } from 'react';
import axios from 'axios';
import Navegacion from '../componentes/Navegacion';

const MiBiblioteca = () => {
  const [libros, setLibros] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const urlBase = import.meta.env.VITE_API_LIBROS || 'http://localhost:8001';

  useEffect(() => {
    const token = localStorage.getItem('token_glancd'); // <--- 1. Obtenemos el token

    if (!token) {
      setError('Debes iniciar sesión para ver tu biblioteca.');
      setCargando(false);
      return;
    }

    // 2. Pasamos el token en los headers de la petición
    axios.get(`${urlBase}/api/libros/`, {
      headers: {
        Authorization: `Bearer ${token}` 
      }
    })
      .then((respuesta) => {
        setLibros(respuesta.data);
      })
      .catch((err) => {
        console.error('Error cargando la biblioteca:', err);
        // Si el backend da un 401, el token venció
        if (err.response && err.response.status === 401) {
          setError('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.');
        } else {
          setError('No pudimos cargar tus libros en este momento.');
        }
      })
      .finally(() => {
        setCargando(false);
      });
  }, [urlBase]);

  return (
    <div style={estilos.contenedorPagina}>
      <Navegacion />

      <div style={estilos.contenido}>
        <div style={estilos.encabezado}>
          <h1 style={estilos.titulo}>Mi biblioteca</h1>
          <span style={estilos.contador}>{libros.length} libros</span>
        </div>
        
        {cargando && <div style={estilos.mensaje}>Cargando tu colección...</div>}
        
        {error && <div style={{...estilos.mensaje, color: '#e07a5f'}}>{error}</div>}

        {!cargando && !error && libros.length === 0 && (
          <div style={estilos.estadoVacio}>
            <p>Tu biblioteca está vacía.</p>
            <span style={estilos.subtextoVacio}>Ve a "Explorar" para buscar y agregar nuevos libros a tu colección.</span>
          </div>
        )}

        {!cargando && libros.length > 0 && (
          <div style={estilos.gridLibros}>
            {libros.map((libro) => (
              <article key={libro.id} style={estilos.cardLibro}>
                <div style={estilos.coverContainer}>
                  {libro.url_portada ? (
                    <img src={libro.url_portada} alt={libro.titulo} style={estilos.coverImage}/>
                  ) : (
                    <div style={estilos.coverFallback}>{libro.titulo?.slice(0, 1)}</div>
                  )}
                </div>
                <div style={estilos.cardInfo}>
                  <h3 style={estilos.libroTitulo}>{libro.titulo}</h3>
                  <p style={estilos.libroAutor}>{libro.nombre_autor}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// --- ESTILOS ---
const estilos = {
  contenedorPagina: { backgroundColor: '#0f1e19', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
  contenido: { padding: '40px 50px', maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box', flex: 1, color: '#ffffff' },
  
  encabezado: { display: 'flex', alignItems: 'baseline', gap: '16px', marginBottom: '32px' },
  titulo: { fontSize: '28px', fontWeight: '700', margin: 0, letterSpacing: '-0.5px' },
  contador: { color: '#8f9b95', fontSize: '1rem', fontWeight: '500' },
  
  mensaje: { padding: '40px', textAlign: 'center', color: '#8f9b95', fontSize: '1.2rem' },
  
  estadoVacio: { textAlign: 'center', padding: '80px 20px', backgroundColor: '#162c25', borderRadius: '12px', border: '1px dashed rgba(251, 249, 241, 0.2)' },
  subtextoVacio: { display: 'block', color: '#8f9b95', fontSize: '0.9rem', marginTop: '8px' },
  
  // Grid de Libros (mismo estilo que usamos en la búsqueda de Explorar)
  gridLibros: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '24px' },
  cardLibro: { backgroundColor: '#162c25', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(251, 249, 241, 0.08)', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s', cursor: 'pointer' },
  coverContainer: { height: '260px', backgroundColor: '#0f1e19', position: 'relative' },
  coverImage: { width: '100%', height: '100%', objectFit: 'cover' },
  coverFallback: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', fontFamily: '"Georgia", serif', color: '#1f3d34' },
  cardInfo: { padding: '12px', display: 'flex', flexDirection: 'column', flex: 1 },
  libroTitulo: { fontSize: '0.95rem', color: '#fbf9f1', margin: '0 0 4px 0', lineHeight: '1.2', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  libroAutor: { fontSize: '0.75rem', color: '#8f9b95', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }
};

export default MiBiblioteca;
import { useState, useEffect } from 'react';
import axios from 'axios';
import Navegacion from '../componentes/Navegacion';

const coloresSpotify = [
  '#E13300', '#1E3264', '#E8115B', '#148A08', '#BC5900', 
  '#8D67AB', '#7358FF', '#E1118C', '#509BF5', '#FF4632'
];

const Explorar = () => {
  // Estados para Géneros
  const [generos, setGeneros] = useState([]);
  const [cargandoGeneros, setCargandoGeneros] = useState(true);
  const [errorGeneros, setErrorGeneros] = useState('');

  // Estados para Búsqueda
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [errorBusqueda, setErrorBusqueda] = useState('');
  const [busquedaActiva, setBusquedaActiva] = useState(false);

  const urlBase = import.meta.env.VITE_API_LIBROS || 'http://localhost:8001';

  // Cargar géneros al montar el componente
  useEffect(() => {
    axios.get(`${urlBase}/api/generos/`)
      .then((respuesta) => setGeneros(respuesta.data))
      .catch((err) => {
        console.error('Error cargando los géneros:', err);
        setErrorGeneros('No pudimos cargar los géneros en este momento.');
      })
      .finally(() => setCargandoGeneros(false));
  }, [urlBase]);

  // Función para manejar la búsqueda al vuelo
  const manejarBusqueda = async (e) => {
    e.preventDefault();
    if (!busqueda.trim()) {
      setBusquedaActiva(false);
      setResultados([]);
      return;
    }

    setBusquedaActiva(true);
    setBuscando(true);
    setErrorBusqueda('');

    try {
      // Ajusta el parámetro '?q=' si tu backend espera otro nombre como '?query=' o '?titulo='
      const respuesta = await axios.get(`${urlBase}/api/libros/buscar`, {
        params: { q: busqueda } 
      });
      setResultados(respuesta.data.resultados || []);
    } catch (error) {
      console.error('Error buscando libros:', error);
      setErrorBusqueda('Ocurrió un error al buscar los libros.');
    } finally {
      setBuscando(false);
    }
  };

  // Si el usuario borra el texto, regresamos a la vista de géneros
  const manejarCambioInput = (e) => {
    const valor = e.target.value;
    setBusqueda(valor);
    if (valor.trim() === '') {
      setBusquedaActiva(false);
      setResultados([]);
    }
  };

  return (
    <div style={estilos.contenedorPagina}>
      <Navegacion />

      <div style={estilos.contenido}>
        
        {/* BARRA DE BÚSQUEDA */}
        <div style={estilos.contenedorBusqueda}>
          <form onSubmit={manejarBusqueda} style={estilos.formulario}>
            <input 
              type="text" 
              placeholder="¿Qué quieres leer hoy? Busca por título, autor o palabra clave..." 
              style={estilos.inputBusqueda}
              value={busqueda}
              onChange={manejarCambioInput}
            />
            <button type="submit" style={estilos.botonBuscar}>
              Buscar
            </button>
          </form>
        </div>

        {/* VISTA DE RESULTADOS DE BÚSQUEDA */}
        {busquedaActiva ? (
          <div>
            <h2 style={estilos.titulo}>Resultados para "{busqueda}"</h2>
            
            {buscando && <div style={estilos.mensaje}>Buscando en la biblioteca...</div>}
            {errorBusqueda && <div style={{...estilos.mensaje, color: '#e07a5f'}}>{errorBusqueda}</div>}
            
            {!buscando && !errorBusqueda && resultados.length === 0 && (
              <div style={estilos.mensaje}>No encontramos libros que coincidan con tu búsqueda.</div>
            )}

            {!buscando && resultados.length > 0 && (
              <div style={estilos.gridLibros}>
                {resultados.map((libro, index) => (
                  <article key={libro.id || index} style={estilos.cardLibro}>
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
        ) : (
          /* VISTA NORMAL DE GÉNEROS (Si no hay búsqueda activa) */
          <div>
            <h1 style={estilos.titulo}>Explorar todo</h1>
            
            {cargandoGeneros && <div style={estilos.mensaje}>Cargando géneros...</div>}
            {errorGeneros && <div style={{...estilos.mensaje, color: '#e07a5f'}}>{errorGeneros}</div>}

            {!cargandoGeneros && !errorGeneros && (
              <div style={estilos.gridGeneros}>
                {generos.map((genero, index) => {
                  const colorFondo = coloresSpotify[index % coloresSpotify.length];
                  return (
                    <div key={genero.id} style={{ ...estilos.tarjetaGenero, backgroundColor: colorFondo }}>
                      <h3 style={estilos.nombreGenero}>{genero.nombre}</h3>
                      <div style={estilos.contenedorPortadaMock}>
                        <div style={estilos.portadaMock}>Portada</div> 
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

// --- ESTILOS ACTUALIZADOS ---
const estilos = {
  contenedorPagina: { backgroundColor: '#0f1e19', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
  contenido: { padding: '40px 50px', maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box', flex: 1, color: '#ffffff' },
  
  // Estilos Búsqueda
  contenedorBusqueda: { marginBottom: '40px', display: 'flex', justifyContent: 'center' },
  formulario: { display: 'flex', width: '100%', maxWidth: '800px', gap: '10px' },
  inputBusqueda: { flex: 1, padding: '16px 24px', borderRadius: '30px', border: '1px solid rgba(251, 249, 241, 0.2)', backgroundColor: '#162c25', color: '#fbf9f1', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s' },
  botonBuscar: { padding: '16px 32px', borderRadius: '30px', border: 'none', backgroundColor: '#e07a5f', color: '#fff', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', transition: 'background-color 0.2s' },
  
  titulo: { fontSize: '28px', fontWeight: '700', marginBottom: '32px', letterSpacing: '-0.5px' },
  mensaje: { padding: '40px', textAlign: 'center', color: '#8f9b95', fontSize: '1.2rem' },
  
  // Grid Géneros
  gridGeneros: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '24px' },
  tarjetaGenero: { position: 'relative', borderRadius: '8px', overflow: 'hidden', aspectRatio: '1 / 1', cursor: 'pointer', padding: '16px', border: 'none', transition: 'transform 0.2s ease' },
  nombreGenero: { margin: 0, fontSize: '22px', fontWeight: '700', wordBreak: 'break-word', maxWidth: '100%', zIndex: 2, position: 'relative', color: '#ffffff' },
  contenedorPortadaMock: { position: 'absolute', bottom: '-15px', right: '-20px', width: '110px', height: '150px', transform: 'rotate(25deg)', boxShadow: '0 8px 16px rgba(0,0,0,0.4)', zIndex: 1 },
  portadaMock: { width: '100%', height: '100%', backgroundColor: '#162c25', color: '#8f9b95', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold', border: '1px solid rgba(251, 249, 241, 0.1)' },
  
  // Grid Resultados (Libros)
  gridLibros: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '24px' },
  cardLibro: { backgroundColor: '#162c25', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(251, 249, 241, 0.08)', display: 'flex', flexDirection: 'column' },
  coverContainer: { height: '260px', backgroundColor: '#0f1e19', position: 'relative' },
  coverImage: { width: '100%', height: '100%', objectFit: 'cover' },
  coverFallback: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', fontFamily: '"Georgia", serif', color: '#1f3d34' },
  cardInfo: { padding: '12px', display: 'flex', flexDirection: 'column', flex: 1 },
  libroTitulo: { fontSize: '0.95rem', color: '#fbf9f1', margin: '0 0 4px 0', lineHeight: '1.2', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  libroAutor: { fontSize: '0.75rem', color: '#8f9b95', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }
};

export default Explorar;
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navegacion from '../componentes/Navegacion';

const DetalleLibro = () => {
  // 1. Capturamos el ID de la URL
  const { id } = useParams();
  const navigate = useNavigate();
  
  // 2. Estados para manejar los datos, la carga y los errores
  const [libro, setLibro] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [meGusta, setMeGusta] = useState(false);
  const [animandoCorazon, setAnimandoCorazon] = useState(false);
  const [guardandoLike, setGuardandoLike] = useState(false);
  const [marcadoLeido, setMarcadoLeido] = useState(false);
  const [actualizandoLectura, setActualizandoLectura] = useState(false);

  const urlBaseLibros = import.meta.env.VITE_API_LIBROS || 'http://localhost:8001';
  const urlInteracciones = import.meta.env.VITE_API_INTERACCIONES || 'http://localhost:8003';
  
  // ¡AQUÍ ESTÁ EL CAMBIO! Obtenemos el usuarioId aquí arriba
  const token = localStorage.getItem('token_glancd');
  const esUuid = (valor) => typeof valor === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(valor);
  const nombreAutor = (item) => item?.autor?.nombre_completo || item?.nombre_autor || item?.autor || 'Autor desconocido';

  // 3. Efecto para buscar el libro apenas cargue la página
  useEffect(() => {
    const obtenerDetalleLibro = async () => {
      try {
        setCargando(true);
        // Hacemos la petición al microservicio de libros
        const respuesta = await axios.get(`${urlBaseLibros}/api/libros/${id}`);
        setLibro(respuesta.data);
        setError('');
      } catch (err) {
        console.error("Error al obtener el libro:", err);
        setError('No se pudo cargar la información del libro. Es posible que no exista.');
      } finally {
        setCargando(false);
      }
    };

    if (id) {
      obtenerDetalleLibro();
    }
  }, [id, urlBaseLibros]);

  // 4. ¡EL OTRO CAMBIO! Movimos el hook de "Me gusta" antes de los 'if'
  useEffect(() => {
    const comprobarLike = async () => {
      // Un UUID tiene 36 caracteres. Si es menor, es de Google Books y 
      // sabemos de antemano que no puede estar en la tabla de me_gustas aún.
      if (!libro || !esUuid(libro.id) || !token) return;

      try {
        const respuesta = await axios.get(`${urlInteracciones}/api/interacciones/likes/libros/estado`, {
          params: { libro_id: libro.id },
          headers: { Authorization: `Bearer ${token}` }
        });
        setMeGusta(respuesta.data.estado);
      } catch (error) {
        console.error("Error al verificar el estado del Me Gusta:", error);
      }
    };

    if (libro) {
      comprobarLike();
    }
  }, [libro, token, urlInteracciones]);

  useEffect(() => {
    if (!libro || !esUuid(libro.id) || !token) return;
    axios.get(`${urlInteracciones}/api/interacciones/lectura/estado`, {
      params: { libro_id: libro.id }, headers: { Authorization: `Bearer ${token}` },
    }).then((respuesta) => setMarcadoLeido(Boolean(respuesta.data.leido)))
      .catch((err) => console.error('Error consultando lectura:', err));
  }, [libro, token, urlInteracciones]);

  // ------------------------------------------------------------------
  // 5. AHORA SÍ, LOS RETORNOS CONDICIONALES
  // ------------------------------------------------------------------

  // VISTAS DE CARGA Y ERROR
  if (cargando) {
    return (
      <div style={estilos.contenedorPagina}>
        <Navegacion />
        <div style={estilos.mainContent}>
          <h2 style={{ color: '#fbf9f1' }}>Cargando detalles del libro...</h2>
        </div>
      </div>
    );
  }

  if (error || !libro) {
    return (
      <div style={estilos.contenedorPagina}>
        <Navegacion />
        <div style={estilos.mainContent}>
          <div style={estilos.errorBox}>
            <h2>Oops...</h2>
            <p>{error || 'Libro no encontrado'}</p>
            <button style={estilos.btnVolver} onClick={() => navigate(-1)}>Volver</button>
          </div>
        </div>
      </div>
    );
  }

  // 6. La función superpoderosa del botón (no es un hook, así que puede ir aquí)
  const manejarMeGusta = async () => {
    if (!token) {
      alert("Debes iniciar sesión para guardar libros.");
      return;
    }

    if (guardandoLike) return;
    const estadoPrevio = meGusta;
    // Cambia inmediatamente; la petición confirma o revierte el estado.
    setMeGusta(!estadoPrevio);
    setGuardandoLike(true);
    setAnimandoCorazon(true);
    setTimeout(() => setAnimandoCorazon(false), 300);

    try {
      const libroIdFinal = await asegurarLibroLocal();

      // C. Mandamos el UUID oficial a ms-interacciones (también le pasamos el token por si acaso)
      const respuesta = await axios.post(`${urlInteracciones}/api/interacciones/likes/libros`, {
        libro_id: libroIdFinal
      }, {
        headers: {
          'Authorization': `Bearer ${token}` // Lo enviamos aquí también
        }
      });
      setMeGusta(respuesta.data.estado);

    } catch (error) {
      console.error("Error en el proceso de Me gusta:", error);
      setMeGusta(estadoPrevio);
      alert(error.response?.data?.mensaje || "No pudimos actualizar tu biblioteca. Inténtalo nuevamente.");
    } finally { setGuardandoLike(false); }
  };

  // Las tablas de likes y reseñas referencian el UUID interno. Los resultados
  // de Google Books usan otro identificador, por lo que se persisten una vez
  // antes de realizar una acción que requiera el UUID.
  const asegurarLibroLocal = async () => {
    if (esUuid(libro.id)) return libro.id;

    const datosLibro = {
      titulo: libro.titulo,
      sinopsis: libro.sinopsis || 'Sin sinopsis',
      url_portada: libro.url_portada,
      google_id: libro.id,
      nombre_autor: nombreAutor(libro),
    };
    const respuesta = await axios.post(`${urlBaseLibros}/api/libros/`, datosLibro, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const libroIdLocal = respuesta.data.id;
    setLibro((libroActual) => ({ ...libroActual, id: libroIdLocal }));
    return libroIdLocal;
  };

  const manejarEscribirResena = async () => {
    if (!token) {
      alert('Debes iniciar sesión para escribir una reseña.');
      return;
    }
    try {
      const libroIdLocal = await asegurarLibroLocal();
      navigate(`/resenas?libroId=${libroIdLocal}`);
    } catch (err) {
      console.error('Error al preparar el libro para la reseña:', err);
      alert('No se pudo preparar el libro para guardar la reseña. Inténtalo nuevamente.');
    }
  };

  const alternarLectura = async () => {
    if (!token || actualizandoLectura) {
      if (!token) alert('Debes iniciar sesión para registrar tu lectura.');
      return;
    }
    const estadoPrevio = marcadoLeido;
    setMarcadoLeido(!estadoPrevio);
    setActualizandoLectura(true);
    try {
      const respuesta = await axios.post(`${urlInteracciones}/api/interacciones/lectura`, { libro_id: await asegurarLibroLocal() }, { headers: { Authorization: `Bearer ${token}` } });
      setMarcadoLeido(Boolean(respuesta.data.leido));
    } catch (err) {
      setMarcadoLeido(estadoPrevio);
      alert(err.response?.data?.mensaje || 'No se pudo actualizar tu historial de lectura.');
    } finally { setActualizandoLectura(false); }
  };

  // VISTA PRINCIPAL CON LOS DATOS DEL LIBRO
  return (
    <div style={estilos.contenedorPagina}>
      <Navegacion />
      
      <main style={estilos.mainContent}>
        <button style={estilos.btnVolver} onClick={() => navigate(-1)}>
          ← Volver
        </button>

        <div style={estilos.gridDetalle}>
          {/* COLUMNA IZQUIERDA: Portada */}
          <div style={estilos.columnaPortada}>
            <div style={estilos.coverContainer}>
              <div style={estilos.coverFallbackBg}>
                {libro.titulo?.slice(0, 1)}
              </div>
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
          </div>

          {/* COLUMNA DERECHA: Información */}
          <div style={estilos.columnaInfo}>
            <div style={estilos.contenedorPrincipal}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '15px' }}>
                    <div>
                    <h1 style={estilos.titulo}>{libro.titulo}</h1>
                    <h3 style={estilos.autor}>Por: {nombreAutor(libro)}</h3>
                    </div>

                    <button 
                    onClick={manejarMeGusta}
                    disabled={guardandoLike}
                    style={{
                        ...estilos.btnCorazon,
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '5px',
                        transform: animandoCorazon ? 'scale(1.3)' : 'scale(1)',
                        color: meGusta ? '#e07a5f' : '#8f9b95',
                        transition: 'transform 0.2s ease-in-out' // Transición suave para el scale
                    }}
                    title={guardandoLike ? 'Actualizando biblioteca…' : meGusta ? "Quitar de Mi Biblioteca" : "Guardar en Mi Biblioteca"}
                    >
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="28" 
                        height="28" 
                        viewBox="0 0 24 24" 
                        fill={meGusta ? "#e07a5f" : "none"} 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                        style={{ transition: 'fill 0.3s ease' }}
                    >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                    </button>
                </div>
                <div style={{ ...estilos.tagsContainer, marginTop: '12px' }}>
                    <span style={estilos.tag}>{libro.genero?.nombre || libro.genero || 'Sin género'}</span>
                    <span style={estilos.tag}>{libro.paginas ? `${libro.paginas} páginas` : 'Páginas N/A'}</span>
                </div>
                </div>
            

            <div style={estilos.sinopsisContainer}>
            <h4 style={estilos.sinopsisTitulo}>SINOPSIS</h4>
            <div 
                style={estilos.sinopsisTexto}
                dangerouslySetInnerHTML={{ 
                __html: libro.sinopsis || libro.descripcion || 'Este libro no tiene una sinopsis disponible en este momento.' 
                }} 
            />
            </div>

            <div style={estilos.accionesContainer}>
                <button style={estilos.btnSecundario} onClick={manejarEscribirResena}>Escribir Reseña</button>
                <button style={{ ...estilos.btnLectura, ...(marcadoLeido ? estilos.btnLecturaActiva : {}) }} onClick={alternarLectura} disabled={actualizandoLectura}>
                  {marcadoLeido ? '✓ Leído' : 'Marcar como leído'}
                </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// --- ESTILOS TEMPORALES (Basados en tu paleta de colores) ---
const estilos = {
  contenedorPagina: { backgroundColor: '#0f1e19', color: '#fbf9f1', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', display: 'flex', flexDirection: 'column' },
  mainContent: { padding: '40px 50px', maxWidth: '1200px', margin: '0 auto', flex: 1, width: '100%', boxSizing: 'border-box' },
  btnVolver: { background: 'none', border: 'none', color: '#e07a5f', fontSize: '1rem', cursor: 'pointer', padding: '0 0 20px 0', fontFamily: 'inherit' },
  gridDetalle: { display: 'grid', gridTemplateColumns: '300px 1fr', gap: '50px', alignItems: 'start' },
  columnaPortada: { width: '100%' },
  coverContainer: { height: '450px', backgroundColor: '#162c25', borderRadius: '12px', position: 'relative', overflow: 'hidden', border: '1px solid rgba(251, 249, 241, 0.08)', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' },
  coverFallbackBg: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '6rem', fontFamily: '"Georgia", serif', color: '#1f3d34', backgroundColor: '#162c25', zIndex: 1 },
  coverImageOver: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', zIndex: 2 },
  columnaInfo: { display: 'flex', flexDirection: 'column' },
  titulo: { fontFamily: '"Georgia", serif', fontSize: '3rem', margin: '0 0 10px 0', color: '#fbf9f1', lineHeight: '1.2' },
  autor: { fontSize: '1.2rem', color: '#e07a5f', margin: '0 0 24px 0', fontWeight: '500' },
  tagsContainer: { display: 'flex', gap: '12px', marginBottom: '30px' },
  tag: { backgroundColor: 'rgba(251, 249, 241, 0.05)', color: '#8f9b95', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem' },
  sinopsisContainer: { backgroundColor: '#162c25', padding: '24px', borderRadius: '12px', border: '1px solid rgba(251, 249, 241, 0.08)', marginBottom: '30px' },
  sinopsisTitulo: { margin: '0 0 12px 0', color: '#e07a5f', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' },
  sinopsisTexto: { margin: 0, color: '#c2c8c5', lineHeight: '1.6', fontSize: '1rem' },
  accionesContainer: { display: 'flex', gap: '16px' },
  btnPrincipal: { backgroundColor: '#e07a5f', color: '#fbf9f1', border: 'none', padding: '12px 24px', borderRadius: '6px', fontSize: '1rem', cursor: 'pointer', fontWeight: '600' },
  btnSecundario: { backgroundColor: 'transparent', color: '#fbf9f1', border: '1px solid rgba(251, 249, 241, 0.2)', padding: '12px 24px', borderRadius: '6px', fontSize: '1rem', cursor: 'pointer', fontWeight: '600' },
  btnLectura: { backgroundColor: 'rgba(224, 122, 95, 0.12)', color: '#e07a5f', border: '1px solid rgba(224, 122, 95, 0.45)', padding: '12px 24px', borderRadius: '6px', fontSize: '1rem', cursor: 'pointer', fontWeight: '600' },
  btnLecturaActiva: { backgroundColor: '#e07a5f', color: '#fff', borderColor: '#e07a5f' },
  errorBox: { textAlign: 'center', padding: '50px', backgroundColor: '#162c25', borderRadius: '12px', border: '1px dashed #e07a5f' },
  btnCorazon: {
  background: 'rgba(251, 249, 241, 0.05)',
  border: '1px solid rgba(251, 249, 241, 0.1)',
  borderRadius: '50%',
  width: '56px',
  height: '56px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), color 0.3s ease, background-color 0.3s ease',
  },
};

export default DetalleLibro;

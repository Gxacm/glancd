import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Navegacion from '../componentes/Navegacion';

const estrellas = (numero) => '★'.repeat(numero) + '☆'.repeat(5 - numero);

export default function ListaResenas() {
  const [params] = useSearchParams();
  const libroId = params.get('libroId');
  const [resenas, setResenas] = useState([]); const [libro, setLibro] = useState(null);
  const [form, setForm] = useState({ calificacion: 5, contenido: '' });
  const [error, setError] = useState(''); const [cargando, setCargando] = useState(true); const [enviando, setEnviando] = useState(false);
  const apiResenas = import.meta.env.VITE_API_RESENAS || 'http://localhost:8004';
  const apiLibros = import.meta.env.VITE_API_LIBROS || 'http://localhost:8001';
  const token = localStorage.getItem('token_glancd');
  const auth = useMemo(() => token ? { headers: { Authorization: `Bearer ${token}` } } : {}, [token]);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const peticiones = libroId ? [axios.get(`${apiResenas}/api/resenas/libros/${libroId}`, auth), axios.get(`${apiLibros}/api/libros/${libroId}`)] : [axios.get(`${apiResenas}/api/resenas/mias`, auth)];
      const [lista, detalle] = await Promise.all(peticiones);
      setResenas(lista.data); setLibro(detalle?.data || null); setError('');
    } catch (err) { setError(err.response?.data?.mensaje || err.response?.data?.detail || 'No se pudieron cargar las reseñas.'); }
    finally { setCargando(false); }
  }, [apiLibros, apiResenas, auth, libroId]);

  useEffect(() => { const timer = window.setTimeout(cargar, 0); return () => window.clearTimeout(timer); }, [cargar]);

  const enviar = async (event) => {
    event.preventDefault(); if (!token) return setError('Inicia sesión para publicar una reseña.');
    setEnviando(true);
    try { await axios.post(`${apiResenas}/api/resenas/libros/${libroId}`, form, auth); setForm({ calificacion: 5, contenido: '' }); await cargar(); }
    catch (err) { setError(err.response?.data?.mensaje || 'No se pudo guardar la reseña.'); }
    finally { setEnviando(false); }
  };
  const reaccionar = async (resena) => {
    if (!token) return setError('Inicia sesión para indicar que esta reseña te fue útil.');
    try {
      const respuesta = await axios.post(`${apiResenas}/api/resenas/${resena.id}/me-gusta`, {}, auth);
      setResenas((actual) => actual.map((item) => item.id === resena.id ? { ...item, me_gusta_usuario: respuesta.data.estado, total_me_gusta: respuesta.data.total_me_gusta } : item));
    } catch (err) { setError(err.response?.data?.mensaje || 'No se pudo registrar el me gusta.'); }
  };
  const nombreAutor = libro?.autor?.nombre_completo || libro?.nombre_autor || libro?.autor || 'Autor por descubrir';

  return <div style={s.page}><Navegacion /><main style={s.main}>
    {libroId && <section style={s.book}><div style={s.cover}>{libro?.url_portada && <img src={libro.url_portada.replace('http:', 'https:')} alt="" style={s.coverImg} />}</div><div><p style={s.kicker}>COMUNIDAD GLANCD</p><h1 style={s.title}>{libro?.titulo || 'Reseñas del libro'}</h1><p style={s.author}>por {nombreAutor}</p><p style={s.description}>Comparte tu impresión y descubre qué sintieron otros lectores.</p></div></section>}
    {!libroId && <><p style={s.kicker}>TU ACTIVIDAD</p><h1 style={s.title}>Mis reseñas</h1></>}
    {libroId && <section style={s.composer}><h2 style={s.composerTitle}>¿Qué te pareció?</h2><form onSubmit={enviar} style={s.form}><div style={s.rating}>{[1,2,3,4,5].map((valor) => <button type="button" key={valor} onClick={() => setForm({ ...form, calificacion: valor })} aria-label={`${valor} estrellas`} style={{ ...s.starButton, color: valor <= form.calificacion ? '#e9b44c' : '#587268' }}>★</button>)}</div><textarea required maxLength="5000" value={form.contenido} onChange={(e) => setForm({ ...form, contenido: e.target.value })} placeholder="Cuenta qué te gustó, qué te sorprendió o a quién se lo recomendarías…" style={s.textarea} rows="5" /><div style={s.formFooter}><small>{form.contenido.length}/5000</small><button disabled={enviando} style={s.publish}>{enviando ? 'Publicando…' : 'Publicar reseña'}</button></div></form></section>}
    {error && <p style={s.error}>{error}</p>}
    <section style={s.reviews}><h2 style={s.sectionTitle}>{libroId ? `Opiniones de lectores (${resenas.length})` : `Tus reseñas (${resenas.length})`}</h2>{cargando ? <p style={s.empty}>Cargando reseñas…</p> : resenas.length === 0 ? <p style={s.empty}>Aún no hay reseñas. Sé la primera persona en compartir la tuya.</p> : resenas.map((resena) => <article key={resena.id} style={s.card}>{!libroId && <Link to={`/libro/${resena.libro_id}`} style={s.bookLink}>{resena.titulo}<small>{resena.nombre_autor}</small></Link>}<header style={s.reviewHead}><div style={s.avatar}>{(resena.nombre || 'T')[0].toUpperCase()}</div><div><strong>{libroId ? `${resena.nombre || 'Lector'} ${resena.apellido || ''}` : 'Tu reseña'}</strong><p style={s.date}>{new Date(resena.creado_en).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p></div><span style={s.score}>{estrellas(resena.calificacion)}</span></header><p style={s.content}>{resena.contenido}</p>{libroId && <button onClick={() => reaccionar(resena)} style={{ ...s.like, color: resena.me_gusta_usuario ? '#e07a5f' : '#8f9b95' }}>♥ {resena.total_me_gusta || 0} {resena.total_me_gusta === 1 ? 'me gusta' : 'me gusta'}</button>}</article>)}</section>
  </main></div>;
}

const s = { page:{minHeight:'100vh',background:'#0f1e19',color:'#fbf9f1'},main:{maxWidth:900,margin:'0 auto',padding:'48px 24px 80px'},book:{display:'grid',gridTemplateColumns:'130px 1fr',gap:26,alignItems:'center',marginBottom:36},cover:{height:185,background:'#162c25',borderRadius:10,overflow:'hidden',boxShadow:'0 14px 30px #0005'},coverImg:{width:'100%',height:'100%',objectFit:'cover'},kicker:{letterSpacing:1.6,fontSize:11,color:'#e07a5f',fontWeight:700,margin:'0 0 8px'},title:{fontFamily:'Georgia,serif',fontSize:'clamp(2rem,5vw,3rem)',margin:0},author:{margin:'8px 0',color:'#e07a5f'},description:{color:'#aebbb5',lineHeight:1.5},composer:{background:'#162c25',border:'1px solid #ffffff14',borderRadius:14,padding:26,marginBottom:34},composerTitle:{fontFamily:'Georgia,serif',margin:'0 0 18px'},form:{display:'grid',gap:14},rating:{display:'flex',gap:4},starButton:{background:'none',border:0,fontSize:28,cursor:'pointer',padding:0},textarea:{resize:'vertical',padding:15,borderRadius:8,border:'1px solid #385148',background:'#0f1e19',color:'#fbf9f1',font:'inherit',lineHeight:1.55},formFooter:{display:'flex',alignItems:'center',justifyContent:'space-between',color:'#8f9b95'},publish:{border:0,borderRadius:7,padding:'11px 16px',background:'#e07a5f',color:'#fff',fontWeight:700,cursor:'pointer'},error:{padding:13,background:'#633b38',borderRadius:8,color:'#ffd9d2'},reviews:{display:'grid',gap:14},sectionTitle:{fontFamily:'Georgia,serif',fontSize:24,margin:'8px 0'},empty:{padding:35,textAlign:'center',color:'#8f9b95',border:'1px dashed #466057',borderRadius:10},card:{background:'#162c25',border:'1px solid #ffffff12',padding:22,borderRadius:12},bookLink:{display:'grid',gap:3,color:'#fbf9f1',fontWeight:700,textDecoration:'none',marginBottom:17},reviewHead:{display:'flex',alignItems:'center',gap:10},avatar:{width:38,height:38,borderRadius:'50%',background:'#285044',display:'grid',placeItems:'center',fontWeight:700},date:{margin:'3px 0 0',fontSize:12,color:'#8f9b95'},score:{marginLeft:'auto',color:'#e9b44c',letterSpacing:1},content:{color:'#d8dfdb',lineHeight:1.65,whiteSpace:'pre-wrap'},like:{border:0,background:'transparent',cursor:'pointer',font:'inherit',padding:0},bookLinkSmall:{color:'#8f9b95'} };

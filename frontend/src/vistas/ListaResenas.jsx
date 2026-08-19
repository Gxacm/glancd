import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Navegacion from '../componentes/Navegacion';

export default function ListaResenas() {
  const [params] = useSearchParams();
  const libroId = params.get('libroId');
  const [resenas, setResenas] = useState([]);
  const [form, setForm] = useState({ calificacion: 5, contenido: '' });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);
  const api = import.meta.env.VITE_API_RESENAS || 'http://localhost:8004';
  const token = localStorage.getItem('token_glancd');

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const url = libroId ? `${api}/api/resenas/libros/${libroId}` : `${api}/api/resenas/mias`;
      const config = libroId ? {} : { headers: { Authorization: `Bearer ${token}` } };
      const respuesta = await axios.get(url, config);
      setResenas(respuesta.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudieron cargar las reseñas.');
    } finally {
      setCargando(false);
    }
  }, [api, libroId, token]);

  useEffect(() => {
    const temporizador = window.setTimeout(() => { cargar(); }, 0);
    return () => window.clearTimeout(temporizador);
  }, [cargar]);

  const enviar = async (event) => {
    event.preventDefault();
    if (!token) return setError('Inicia sesión para escribir una reseña.');
    try {
      await axios.post(`${api}/api/resenas/libros/${libroId}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setForm({ calificacion: 5, contenido: '' });
      cargar();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudo guardar la reseña.');
    }
  };

  return (
    <div style={styles.page}>
      <Navegacion />
      <main style={styles.main}>
        <h1 style={styles.title}>{libroId ? 'Reseñas del libro' : 'Mis reseñas'}</h1>
        {libroId && <form onSubmit={enviar} style={styles.form}>
          <select value={form.calificacion} onChange={(e) => setForm({ ...form, calificacion: Number(e.target.value) })} style={styles.input}>
            {[5, 4, 3, 2, 1].map((valor) => <option key={valor} value={valor}>{valor} / 5</option>)}
          </select>
          <textarea required maxLength="5000" value={form.contenido} onChange={(e) => setForm({ ...form, contenido: e.target.value })} placeholder="Comparte qué te dejó este libro…" style={styles.input} rows="4" />
          <button style={styles.button}>Publicar reseña</button>
        </form>}
        {error && <p style={styles.error}>{error}</p>}
        {cargando ? <p>Cargando…</p> : resenas.length === 0 ? <p style={styles.empty}>Aún no hay reseñas.</p> : (
          <section style={styles.list}>{resenas.map((resena) => (
            <article key={resena.id} style={styles.card}>
              {!libroId && <><strong>{resena.titulo}</strong><span style={styles.meta}>{resena.nombre_autor}</span></>}
              <strong>{'★'.repeat(resena.calificacion)}{'☆'.repeat(5 - resena.calificacion)}</strong>
              <p>{resena.contenido}</p>
              <span style={styles.meta}>{libroId ? `${resena.nombre} ${resena.apellido}` : 'Tu reseña'}</span>
            </article>
          ))}</section>
        )}
      </main>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#0f1e19', color: '#fbf9f1' },
  main: { maxWidth: '800px', margin: '0 auto', padding: '40px 24px' },
  title: { fontFamily: 'Georgia, serif' },
  form: { display: 'grid', gap: '12px', marginBottom: '28px' },
  input: { padding: '12px', borderRadius: '6px', border: '1px solid #385148', background: '#162c25', color: '#fbf9f1', font: 'inherit' },
  button: { background: '#e07a5f', color: 'white', border: 0, borderRadius: '6px', padding: '12px', cursor: 'pointer', fontWeight: 700 },
  card: { background: '#162c25', border: '1px solid #284138', padding: '18px', borderRadius: '8px', display: 'grid', gap: '8px' },
  list: { display: 'grid', gap: '14px' },
  meta: { color: '#8f9b95', fontSize: '.9rem' }, error: { color: '#f2a490' }, empty: { color: '#8f9b95' },
};

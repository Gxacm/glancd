import { consultarConReintento } from '../Configuracion/baseDatos.js';

const validarEntrada = ({ calificacion, contenido }) => {
  const puntaje = Number(calificacion);
  if (!Number.isInteger(puntaje) || puntaje < 1 || puntaje > 5) {
    return 'La calificación debe ser un entero entre 1 y 5.';
  }
  if (typeof contenido !== 'string' || contenido.trim().length < 1 || contenido.trim().length > 5000) {
    return 'La reseña debe contener entre 1 y 5000 caracteres.';
  }
  return null;
};

export async function listarResenasLibro(req, res) {
  try {
    const { libroId } = req.params;
    const resultado = await consultarConReintento(`
      SELECT r.id, r.calificacion, r.contenido, r.creado_en, r.actualizado_en,
             u.id AS usuario_id, u.nombre, u.apellido,
             COUNT(mgr.usuario_id)::int AS total_me_gusta,
             COALESCE(BOOL_OR(mgr.usuario_id = $2), false) AS me_gusta_usuario
      FROM resenas r
      JOIN usuarios u ON u.id = r.usuario_id
      LEFT JOIN me_gusta_resenas mgr ON mgr.resena_id = r.id
      WHERE r.libro_id = $1
      GROUP BY r.id, u.id
      ORDER BY r.actualizado_en DESC
    `, [libroId, req.usuario?.id || null]);
    return res.json(resultado.rows);
  } catch (error) {
    console.error('Error al listar reseñas:', error);
    return res.status(500).json({ mensaje: 'No se pudieron obtener las reseñas.' });
  }
}

export async function crearResena(req, res) {
  const errorValidacion = validarEntrada(req.body);
  if (errorValidacion) return res.status(400).json({ mensaje: errorValidacion });
  try {
    const resultado = await consultarConReintento(`
      INSERT INTO resenas (usuario_id, libro_id, calificacion, contenido)
      VALUES ($1, $2, $3, $4)
      RETURNING id, calificacion, contenido, creado_en, actualizado_en
    `, [req.usuario.id, req.params.libroId, Number(req.body.calificacion), req.body.contenido.trim()]);
    return res.status(201).json(resultado.rows[0]);
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ mensaje: 'Ya escribiste una reseña para este libro.' });
    if (error.code === '23503') return res.status(404).json({ mensaje: 'El libro no existe.' });
    console.error('Error al crear reseña:', error);
    return res.status(500).json({ mensaje: 'No se pudo crear la reseña.' });
  }
}

export async function listarMisResenas(req, res) {
  try {
    const resultado = await consultarConReintento(`
      SELECT r.id, r.libro_id, r.calificacion, r.contenido, r.creado_en, r.actualizado_en,
             l.titulo, l.url_portada, a.nombre_completo AS nombre_autor
      FROM resenas r
      JOIN libros l ON l.id = r.libro_id
      JOIN autores a ON a.id = l.autor_id
      WHERE r.usuario_id = $1
      ORDER BY r.actualizado_en DESC
    `, [req.usuario.id]);
    return res.json(resultado.rows);
  } catch (error) {
    console.error('Error al listar mis reseñas:', error);
    return res.status(500).json({ mensaje: 'No se pudieron obtener tus reseñas.' });
  }
}

export async function actualizarMiResena(req, res) {
  const errorValidacion = validarEntrada(req.body);
  if (errorValidacion) return res.status(400).json({ mensaje: errorValidacion });
  try {
    const resultado = await consultarConReintento(`
      UPDATE resenas
      SET calificacion = $1, contenido = $2, actualizado_en = NOW()
      WHERE usuario_id = $3 AND libro_id = $4
      RETURNING id, calificacion, contenido, creado_en, actualizado_en
    `, [Number(req.body.calificacion), req.body.contenido.trim(), req.usuario.id, req.params.libroId]);
    if (!resultado.rowCount) return res.status(404).json({ mensaje: 'No tienes una reseña para este libro.' });
    return res.json(resultado.rows[0]);
  } catch (error) {
    console.error('Error al actualizar reseña:', error);
    return res.status(500).json({ mensaje: 'No se pudo actualizar la reseña.' });
  }
}

export async function eliminarMiResena(req, res) {
  try {
    const resultado = await consultarConReintento(
      'DELETE FROM resenas WHERE usuario_id = $1 AND libro_id = $2',
      [req.usuario.id, req.params.libroId],
    );
    if (!resultado.rowCount) return res.status(404).json({ mensaje: 'No tienes una reseña para este libro.' });
    return res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar reseña:', error);
    return res.status(500).json({ mensaje: 'No se pudo eliminar la reseña.' });
  }
}

export async function alternarMeGustaResena(req, res) {
  try {
    const { resenaId } = req.params;
    const existente = await consultarConReintento(
      'SELECT 1 FROM me_gusta_resenas WHERE usuario_id = $1 AND resena_id = $2',
      [req.usuario.id, resenaId],
    );
    if (existente.rowCount) {
      await consultarConReintento('DELETE FROM me_gusta_resenas WHERE usuario_id = $1 AND resena_id = $2', [req.usuario.id, resenaId]);
    } else {
      await consultarConReintento('INSERT INTO me_gusta_resenas (usuario_id, resena_id) VALUES ($1, $2)', [req.usuario.id, resenaId]);
    }
    const total = await consultarConReintento('SELECT COUNT(*)::int AS total FROM me_gusta_resenas WHERE resena_id = $1', [resenaId]);
    return res.json({ estado: !existente.rowCount, total_me_gusta: total.rows[0].total });
  } catch (error) {
    if (error.code === '23503') return res.status(404).json({ mensaje: 'La reseña no existe.' });
    console.error('Error al reaccionar a reseña:', error);
    return res.status(500).json({ mensaje: 'No se pudo registrar el me gusta.' });
  }
}

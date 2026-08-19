import { consultarConReintento } from '../configuracion/baseDatos.js';

export async function estadoLectura(req, res) {
  const { libro_id: libroId } = req.query;
  if (!libroId) return res.status(400).json({ mensaje: 'libro_id es requerido.' });
  try {
    const resultado = await consultarConReintento(
      "SELECT leido_en, estado FROM historial_lectura WHERE usuario_id = $1 AND libro_id = $2 ORDER BY leido_en DESC LIMIT 1",
      [req.usuario.id, libroId],
    );
    return res.json({ leido: resultado.rowCount > 0 && resultado.rows[0].estado === 'leido', ...resultado.rows[0] });
  } catch (error) {
    console.error('Error consultando estado de lectura:', error);
    return res.status(500).json({ mensaje: 'No se pudo consultar el estado de lectura.' });
  }
}

export async function alternarLectura(req, res) {
  const { libro_id: libroId } = req.body;
  if (!libroId) return res.status(400).json({ mensaje: 'libro_id es requerido.' });
  try {
    const actual = await consultarConReintento(
      "SELECT id FROM historial_lectura WHERE usuario_id = $1 AND libro_id = $2 AND estado = 'leido' ORDER BY leido_en DESC LIMIT 1",
      [req.usuario.id, libroId],
    );
    if (actual.rowCount) {
      await consultarConReintento('DELETE FROM historial_lectura WHERE usuario_id = $1 AND libro_id = $2', [req.usuario.id, libroId]);
      return res.json({ leido: false, mensaje: 'Libro marcado como pendiente.' });
    }
    await consultarConReintento(
      "INSERT INTO historial_lectura (usuario_id, libro_id, leido_en, estado) VALUES ($1, $2, NOW(), 'leido')",
      [req.usuario.id, libroId],
    );
    return res.status(201).json({ leido: true, mensaje: 'Libro marcado como leído.' });
  } catch (error) {
    if (error.code === '23503') return res.status(404).json({ mensaje: 'El libro no existe en el catálogo local.' });
    console.error('Error alternando estado de lectura:', error);
    return res.status(500).json({ mensaje: 'No se pudo actualizar el estado de lectura.' });
  }
}

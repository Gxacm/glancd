// ms-usuarios/src/controladores/generos.controlador.js
const pool = require('../configuracion/baseDatos');

// Obtener todos los géneros (incluyendo la clave de Google Books)
const obtenerGeneros = async (req, res) => {
  try {
    const resultado = await pool.query(
      'SELECT id, nombre, clave_google FROM generos ORDER BY nombre ASC'
    );
    res.json(resultado.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener géneros literarios.' });
  }
};

const guardarPreferencias = async (req, res) => {
  const { id } = req.params;
  const { generos_ids } = req.body;

  if (!Array.isArray(generos_ids) || generos_ids.length < 3) {
    return res.status(400).json({ mensaje: 'Debes seleccionar al menos 3 géneros.' });
  }

  try {
    for (let genero_id of generos_ids) {
      await pool.query(
        'INSERT INTO usuario_generos (usuario_id, genero_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [id, genero_id]
      );
    }
    res.status(201).json({ mensaje: 'Preferencias guardadas exitosamente.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al guardar las preferencias.' });
  }
};

module.exports = { obtenerGeneros, guardarPreferencias };
import { consultarConReintento } from '../configuracion/baseDatos.js';

// 1. Verificar si un libro ya tiene "Me gusta" de un usuario
export const verificarLikeLibro = async (req, res) => {
    try {
        const { libro_id } = req.query;
        const usuario_id = req.usuario.id;

        if (!libro_id) {
            return res.status(400).json({ error: "libro_id es requerido" });
        }

        const query = `
            SELECT 1 FROM me_gusta_libros 
            WHERE usuario_id = $1 AND libro_id = $2
        `;
        const resultado = await consultarConReintento(query, [usuario_id, libro_id]);

        res.json({ estado: resultado.rowCount > 0 });
    } catch (error) {
        console.error("Error al verificar like:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

// 2. Dar o quitar "Me gusta" (Toggle)
export const toggleLikeLibro = async (req, res) => {
    try {
        const { libro_id } = req.body;
        const usuario_id = req.usuario.id;

        if (!libro_id) {
            return res.status(400).json({ error: "libro_id es requerido" });
        }

        // Primero revisamos si ya existe
        const queryCheck = `SELECT 1 FROM me_gusta_libros WHERE usuario_id = $1 AND libro_id = $2`;
        const checkResult = await consultarConReintento(queryCheck, [usuario_id, libro_id]);

        if (checkResult.rowCount > 0) {
            // Si existe, lo eliminamos (Quitar Me Gusta)
            const queryDelete = `DELETE FROM me_gusta_libros WHERE usuario_id = $1 AND libro_id = $2`;
            await consultarConReintento(queryDelete, [usuario_id, libro_id]);
            return res.json({ mensaje: "Libro eliminado de tu biblioteca", estado: false });
        } else {
            // Si no existe, lo insertamos (Dar Me Gusta)
            const queryInsert = `INSERT INTO me_gusta_libros (usuario_id, libro_id) VALUES ($1, $2)`;
            await consultarConReintento(queryInsert, [usuario_id, libro_id]);
            return res.status(201).json({ mensaje: "Libro agregado a tu biblioteca", estado: true });
        }
    } catch (error) {
        console.error("Error al hacer toggle en like:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

export const obtenerBiblioteca = async (req, res) => {
    try {
        const usuario_id = req.usuario.id;
        const query = `
            SELECT
                l.id, l.titulo, l.sinopsis, l.url_portada, l.edad_objetivo,
                l.google_id, l.cantidad_paginas, l.fecha_publicacion,
                a.id AS autor_id, a.nombre_completo AS nombre_autor,
                g.id AS genero_id, g.nombre AS nombre_genero,
                m.creado_en AS guardado_en
            FROM me_gusta_libros m
            JOIN libros l ON l.id = m.libro_id
            JOIN autores a ON a.id = l.autor_id
            LEFT JOIN generos g ON g.id = l.genero_id
            WHERE m.usuario_id = $1
            ORDER BY m.creado_en DESC
        `;
        const resultado = await consultarConReintento(query, [usuario_id]);
        return res.json(resultado.rows);
    } catch (error) {
        console.error('Error al obtener la biblioteca:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
};

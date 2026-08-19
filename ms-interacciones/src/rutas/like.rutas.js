import { Router } from 'express';
import { verificarLikeLibro, toggleLikeLibro, obtenerBiblioteca } from '../controladores/like.controlador.js';
import { estadoLectura, alternarLectura } from '../controladores/lectura.controlador.js';
import validarToken from '../intermediarios/validarToken.js';

const router = Router();

// GET /api/interacciones/likes/libros/estado?libro_id=...
router.get('/likes/libros/estado', validarToken, verificarLikeLibro);

// POST /api/interacciones/likes/libros
router.post('/likes/libros', validarToken, toggleLikeLibro);

// GET /api/interacciones/biblioteca
router.get('/biblioteca', validarToken, obtenerBiblioteca);

router.get('/lectura/estado', validarToken, estadoLectura);
router.post('/lectura', validarToken, alternarLectura);

export default router;

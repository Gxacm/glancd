import { Router } from 'express';
import {
  listarResenasLibro,
  crearResena,
  actualizarMiResena,
  eliminarMiResena,
  listarMisResenas,
  alternarMeGustaResena,
} from '../Controladores/resena.controlador.js';
import validarToken, { tokenOpcional } from '../intermediarios/validarToken.js';

const router = Router();

router.get('/libros/:libroId', tokenOpcional, listarResenasLibro);
router.get('/mias', validarToken, listarMisResenas);
router.post('/libros/:libroId', validarToken, crearResena);
router.put('/libros/:libroId', validarToken, actualizarMiResena);
router.delete('/libros/:libroId', validarToken, eliminarMiResena);
router.post('/:resenaId/me-gusta', validarToken, alternarMeGustaResena);

export default router;

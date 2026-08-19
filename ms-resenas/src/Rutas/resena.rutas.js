import { Router } from 'express';
import {
  listarResenasLibro,
  crearResena,
  actualizarMiResena,
  eliminarMiResena,
  listarMisResenas,
} from '../Controladores/resena.controlador.js';
import validarToken from '../intermediarios/validarToken.js';

const router = Router();

router.get('/libros/:libroId', listarResenasLibro);
router.get('/mias', validarToken, listarMisResenas);
router.post('/libros/:libroId', validarToken, crearResena);
router.put('/libros/:libroId', validarToken, actualizarMiResena);
router.delete('/libros/:libroId', validarToken, eliminarMiResena);

export default router;

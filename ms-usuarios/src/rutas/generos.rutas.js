const express = require('express');
const router = express.Router();
const { obtenerGeneros, guardarPreferencias } = require('../controladores/generos.controlador');
const validarToken = require('../intermediarios/validarToken');

router.get('/', obtenerGeneros);
router.post('/usuario/:id', validarToken, guardarPreferencias);

module.exports = router;

const express = require('express');
const router = express.Router();
const { obtenerGeneros, guardarPreferencias } = require('../controladores/generos.controlador');

router.get('/', obtenerGeneros);
router.post('/usuario/:id', guardarPreferencias);

module.exports = router;
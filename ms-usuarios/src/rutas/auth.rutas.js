// src/rutas/auth.rutas.js
const express = require('express');
const router = express.Router();
const { registrar, login } = require('../controladores/auth.controlador');
const validarToken = require('../intermediarios/validarToken');

// Rutas públicas
router.post('/registrar', registrar);
router.post('/login', login);

// Ruta protegida de prueba (Solo pasa si el usuario tiene un JWT válido)
router.get('/perfil', validarToken, (req, res) => {
  res.json({ mensaje: 'Acceso concedido al perfil.', usuario: req.usuario });
});

module.exports = router;
// src/intermediarios/validarToken.js
const jwt = require('jsonwebtoken');

const validarToken = (req, res, next) => {
  const tokenHeader = req.header('Authorization');

  if (!tokenHeader) {
    return res.status(401).json({ mensaje: 'Acceso denegado. No se proporcionó un token.' });
  }

  // Separar el formato "Bearer TOKEN"
  const token = tokenHeader.split(' ')[1];

  try {
    const verificado = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = verificado;
    next(); // Permite pasar a la ruta protegida
  } catch (error) {
    res.status(400).json({ mensaje: 'Token inválido o expirado.' });
  }
};

module.exports = validarToken;
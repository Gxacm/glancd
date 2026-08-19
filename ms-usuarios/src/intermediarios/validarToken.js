const jwt = require('jsonwebtoken');

const validarToken = (req, res, next) => {
  const tokenHeader = req.header('Authorization');

  if (!tokenHeader || !tokenHeader.startsWith('Bearer ')) {
    return res.status(401).json({ mensaje: 'Acceso denegado. No se proporcionó un token.' });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ mensaje: 'JWT_SECRET no está configurado.' });
  }

  const token = tokenHeader.slice(7);

  try {
    const verificado = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = verificado;
    next();
  } catch (error) {
    res.status(401).json({ mensaje: 'Token inválido o expirado.' });
  }
};

module.exports = validarToken;

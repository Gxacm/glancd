const jwt = require('jsonwebtoken');

const validarToken = (req, res, next) => {
  const tokenHeader = req.header('Authorization');

  if (!tokenHeader) {
    return res.status(401).json({ mensaje: 'Acceso denegado. No se proporcionó un token.' });
  }

  const token = tokenHeader.split(' ')[1];

  try {
    const verificado = jwt.verify(token, process.env.JWT_SECRET || 'secreto_super_seguro');
    req.usuario = verificado;
    next();
  } catch (error) {
    res.status(400).json({ mensaje: 'Token inválido o expirado.' });
  }
};

module.exports = validarToken;
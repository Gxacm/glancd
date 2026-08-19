import jwt from 'jsonwebtoken';

export default function validarToken(req, res, next) {
  const header = req.header('Authorization');
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ mensaje: 'Se requiere un token Bearer válido.' });
  if (!process.env.JWT_SECRET) return res.status(500).json({ mensaje: 'JWT_SECRET no está configurado.' });
  try {
    req.usuario = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ mensaje: 'Token inválido o expirado.' });
  }
}

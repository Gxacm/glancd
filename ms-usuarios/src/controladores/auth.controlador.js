const pool = require('../configuracion/baseDatos');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. Registro
const registrar = async (req, res) => {
  const { nombre, apellido, email, contrasena, fecha_nacimiento } = req.body;

  try {
    const existe = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (existe.rows.length > 0) {
      return res.status(400).json({ mensaje: 'El correo electrónico ya está registrado.' });
    }

    const salt = await bcrypt.genSalt(10);
    const contrasenaHash = await bcrypt.hash(contrasena, salt);

    const nuevoUsuario = await pool.query(
      `INSERT INTO usuarios (nombre, apellido, email, contrasena, fecha_nacimiento, esta_activo, rol) 
       VALUES ($1, $2, $3, $4, $5, true, 'cliente') 
       RETURNING id, nombre, apellido, email, rol`,
      [nombre, apellido, email, contrasenaHash, fecha_nacimiento]
    );

    const usuario = nuevoUsuario.rows[0];

    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol },
      process.env.JWT_SECRET || 'secreto_super_seguro',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      mensaje: 'Usuario registrado exitosamente',
      usuario,
      token
    });
  } catch (error) {
    console.error('Error en registrar:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor al registrar.' });
  }
};

// 2. Login
const login = async (req, res) => {
  const { email, contrasena } = req.body;

  try {
    const resultado = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);

    if (resultado.rows.length === 0) {
      return res.status(400).json({ mensaje: 'Credenciales inválidas.' });
    }

    const usuario = resultado.rows[0];

    const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!contrasenaValida) {
      return res.status(400).json({ mensaje: 'Credenciales inválidas.' });
    }

    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol },
      process.env.JWT_SECRET || 'secreto_super_seguro',
      { expiresIn: '24h' }
    );

    res.json({
      mensaje: 'Inicio de sesión exitoso',
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rol: usuario.rol
      },
      token
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor al iniciar sesión.' });
  }
};

// ASEGÚRATE DE QUE ESTA LÍNEA SEA EXACTAMENTE 'module.exports'
module.exports = {
  registrar,
  login
};
// src/controladores/auth.controlador.js
const pool = require('../configuracion/baseDatos');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// 1. REGISTRAR UN USUARIO
const registrar = async (req, res) => {
  const { nombre, apellido, email, contrasena, fecha_nacimiento } = req.body;

  try {
    // Validar si el correo ya existe
    const existeUsuario = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (existeUsuario.rows.length > 0) {
      return res.status(400).json({ mensaje: 'El correo electrónico ya está registrado.' });
    }

    // Encriptar la contraseña (Regla estricta de seguridad)
    const sal = await bcrypt.genSalt(10);
    const contrasenaHash = await bcrypt.hash(contrasena, sal);

    // Insertar el usuario en la base de datos
    const nuevoUsuario = await pool.query(
      `INSERT INTO usuarios (nombre, apellido, email, contrasena_hash, fecha_nacimiento) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id, nombre, apellido, email, fecha_nacimiento`,
      [nombre, apellido, email, contrasenaHash, fecha_nacimiento]
    );

    res.status(201).json({
      mensaje: 'Usuario registrado con éxito.',
      usuario: nuevoUsuario.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error interno del servidor al registrar.' });
  }
};

// 2. INICIAR SESIÓN (LOGIN)
const login = async (req, res) => {
  const { email, contrasena } = req.body;

  try {
    // Buscar al usuario por correo
    const resultado = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (resultado.rows.length === 0) {
      return res.status(400).json({ mensaje: 'Credenciales inválidas (Correo no encontrado).' });
    }

    const usuario = resultado.rows[0];

    // Verificar si la cuenta está activa
    if (!usuario.esta_activo) {
      return res.status(403).json({ mensaje: 'Esta cuenta se encuentra desactivada.' });
    }

    // Comparar la contraseña ingresada con la encriptada en la BD
    const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!contrasenaValida) {
      return res.status(400).json({ mensaje: 'Credenciales inválidas (Contraseña incorrecta).' });
    }

    // Generar el token JWT para proteger el resto de microservicios
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      mensaje: '¡Login exitoso!',
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error interno del servidor al iniciar sesión.' });
  }
};

module.exports = { registrar, login };
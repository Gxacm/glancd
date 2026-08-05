// src/app.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importación de rutas
const authRutas = require('./rutas/auth.rutas');
const generosRutas = require('./rutas/generos.rutas'); // <-- Integración de rutas de géneros

const app = express();
const PUERTO = process.env.PORT || 3001;

// Middlewares globales
app.use(cors());
app.use(express.json());

// Montar las rutas de la API
app.use('/api/usuarios', authRutas);
app.use('/api/generos', generosRutas); // <-- Montado en /api/generos

// Ruta base de prueba (Health Check)
app.get('/', (req, res) => {
  res.send('📡 Microservicio de Usuarios (ms-usuarios) en línea.');
});

// Iniciar servidor
app.listen(PUERTO, () => {
  console.log(`🛡️ ms-usuarios corriendo independientemente en el puerto ${PUERTO}`);
});
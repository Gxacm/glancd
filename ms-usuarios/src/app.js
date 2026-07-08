// src/app.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const authRutas = require('./rutas/auth.rutas');

const app = express();
const PUERTO = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Montar las rutas en el prefijo /api/usuarios
app.use('/api/usuarios', authRutas);

app.get('/', (req, res) => {
  res.send('📡 Microservicio de Usuarios (ms-usuarios) en línea.');
});

app.listen(PUERTO, () => {
  console.log(`🛡️ ms-usuarios corriendo independientemente en el puerto ${PUERTO}`);
});
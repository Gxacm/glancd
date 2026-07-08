// src/configuracion/baseDatos.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Prueba rápida de conexión
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Error en ms-usuarios al conectar a la BD:', err.stack);
  } else {
    console.log('🚀 ms-usuarios conectado exitosamente a PostgreSQL.');
  }
});

module.exports = pool;
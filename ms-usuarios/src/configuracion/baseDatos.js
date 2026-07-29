// src/configuracion/baseDatos.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // 🔑 REQUISITO OBLIGATORIO PARA SUPABASE:
  ssl: {
    rejectUnauthorized: false
  }
});

// Prueba rápida de conexión
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Error en ms-usuarios al conectar a la BD:', err.stack);
  } else {
    console.log('🚀 ms-usuarios conectado exitosamente a PostgreSQL usando URI directa.');
  }
});

module.exports = pool;
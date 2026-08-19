import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Requerido por Supabase
    }
});

pool.on('connect', () => {
    console.log('📦 Conexión a la base de datos Supabase establecida');
});

pool.on('error', (err) => {
    console.error('❌ Error inesperado en la base de datos', err);
    process.exit(-1);
});

export default pool;
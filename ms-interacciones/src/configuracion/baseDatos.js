import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 10000,
    ssl: {
        rejectUnauthorized: false // Requerido por Supabase
    }
});

const esperar = (milisegundos) => new Promise((resolve) => setTimeout(resolve, milisegundos));

// Supabase puede devolver un fallo DNS transitorio. Reintentamos dos veces
// antes de comunicar un error al usuario; nunca repetimos consultas mutables
// que ya hayan recibido respuesta del servidor.
export async function consultarConReintento(texto, parametros = []) {
    let ultimoError;
    for (let intento = 0; intento < 3; intento += 1) {
        try {
            return await pool.query(texto, parametros);
        } catch (error) {
            ultimoError = error;
            if (!['EAI_AGAIN', 'ENOTFOUND', 'ETIMEDOUT', 'ECONNRESET'].includes(error.code) || intento === 2) throw error;
            await esperar(250 * (intento + 1));
        }
    }
    throw ultimoError;
}

pool.on('connect', () => {
    console.log('📦 Conexión a la base de datos Supabase establecida');
});

pool.on('error', (err) => {
    console.error('❌ Error inesperado en la base de datos', err);
    process.exit(-1);
});

export default pool;

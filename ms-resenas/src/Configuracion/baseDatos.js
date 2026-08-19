import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL no está configurado.');

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 10000,
  ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false },
});

const esperar = (milisegundos) => new Promise((resolve) => setTimeout(resolve, milisegundos));

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

export default pool;

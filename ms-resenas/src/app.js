import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rutasResenas from './Rutas/resena.rutas.js';

dotenv.config();
const app = express();
const port = Number(process.env.PORT || 8004);

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000' }));
app.use(express.json({ limit: '32kb' }));
app.use('/api/resenas', rutasResenas);
app.get('/health', (_req, res) => res.json({ servicio: 'ms-resenas', estado: 'operativo' }));

app.listen(port, () => console.log(`ms-resenas escuchando en ${port}`));

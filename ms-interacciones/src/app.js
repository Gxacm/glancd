import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rutasLikes from './rutas/like.rutas.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8003;

app.use(cors());
app.use(express.json());

// Usar las rutas
app.use('/api/interacciones', rutasLikes);

app.get('/api/interacciones/health', (req, res) => {
    res.json({ mensaje: 'Microservicio de Interacciones latiendo con fuerza 💓' });
});

app.listen(PORT, () => {
    console.log(`🚀 ms-interacciones corriendo en el puerto ${PORT}`);
});

app.get('/health', (_req, res) => {
    res.json({ servicio: 'ms-interacciones', estado: 'operativo' });
});

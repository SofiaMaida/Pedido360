import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mesasRoutes from './routes/mesa.js';
import pedidoRoutes from './routes/pedido.js';
import usuarioRoutes from './routes/usuario.js';
import menuRoutes from './routes/menu.js';

const app = express();

// Variables de entorno con valores por defecto
const FRONT_ORIGIN = process.env.FRONT_ORIGIN || 'https://pedido360-front.s3.us-east-1.amazonaws.com';

// CORS estricto hacia S3 + preflight
app.use(cors({ origin: FRONT_ORIGIN, credentials: true }));
app.options('*', cors({ origin: FRONT_ORIGIN, credentials: true }));

// Middlewares
app.use(express.json());
app.use(express.static('public'));

// Rutas
app.use(mesasRoutes);
app.use(pedidoRoutes);
app.use(usuarioRoutes);
app.use('/menu', menuRoutes);

// Ruta de prueba /health
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Servidor funcionando correctamente' });
});

export default app;


import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { express_config } from './config.js';
import mesasRoutes from './routes/mesa.js';
import pedidoRoutes from './routes/pedido.js';
import usuarioRoutes from './routes/usuario.js';
import menuRoutes from './routes/menu.js';
import { connect } from './database/db.js';

const app = express();

// Variables de entorno con valores por defecto
const FRONT_ORIGIN = process.env.FRONT_ORIGIN || 'https://pedido360-front.s3.us-east-1.amazonaws.com';
const HOST = process.env.HOST || express_config.host || '0.0.0.0';
const PORT = Number(process.env.PORT || express_config.port || 8080);

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
  res.json({ status: 'ok', message: 'Servidor funcionando correctamente 🚀' });
});

const startServer = async () => {
  // Inicia el servidor HTTP primero (no depende de DB)
  app.listen(PORT, HOST, () => {
    console.log(`🚀 Servidor corriendo en http://${HOST}:${PORT}`);
  });

  // Luego intenta conectar a la base de datos sin bloquear el arranque
  try {
    await connect();
    console.log('✅ DB MongoDB conectada correctamente');
  } catch (error) {
    console.error('⚠️ No se pudo conectar a la base de datos:', error.message);
    // No detener el servidor, útil en entornos sin salida a Internet
  }
};

startServer();

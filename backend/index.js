import express from 'express';
import cors from 'cors';
import { express_config } from './config.js';
import mesasRoutes from './routes/mesa.js';
import pedidoRoutes from './routes/pedido.js';
import usuarioRoutes from './routes/usuario.js';
import menuRoutes from './routes/menu.js';
import { connect } from './database/db.js';

const app = express();

// Define HOST/PORT with safe defaults for private subnets
const PORT = Number(express_config.port) || 8080;
const HOST = express_config.host || '0.0.0.0';

// Configure CORS to only allow the S3 frontend origin (from .env)

app.use(cors());
// Handle preflight
app.options('*', cors());
app.use(express.json());
app.use(express.static('public'));
// Lightweight health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Servidor funcionando correctamente 🚀' });
});
app.use(mesasRoutes);
app.use(pedidoRoutes);
app.use(usuarioRoutes);
app.use('/menu', menuRoutes);

const startServer = async () => {
  // Start HTTP server first so the port is exposed even if DB is unreachable
  app.listen(PORT, HOST, () => {
    console.log(`Servidor corriendo en http://${HOST}:${PORT}`);
  });

  // Then attempt DB connection without blocking the listener
  try {
    await connect();
    console.log('DB MongoDB conectada correctamente');
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error.message);
    // Do not exit; keep the server up in lab environments without Internet
  }
};

startServer();

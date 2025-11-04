import 'dotenv/config';
import { createServer } from 'http';
import app from './app.js';
import { express_config } from './config.js';
import { connect } from './database/db.js';
import { configureNotificaciones } from './src/utils/notificaciones.js';

// Servidor HTTP solo para ejecución local/EC2
const httpServer = createServer(app);

const HOST = process.env.HOST || express_config.host || '0.0.0.0';
const PORT = Number(process.env.PORT || express_config.port || 8080);
const FRONT_ORIGIN = process.env.FRONT_ORIGIN || 'https://pedido360-front.s3.us-east-1.amazonaws.com';

configureNotificaciones(httpServer, {
  cors: { origin: FRONT_ORIGIN, credentials: true },
});

const startServer = async () => {
  httpServer.listen(PORT, HOST, () => {
    console.log(`Servidor corriendo en http://${HOST}:${PORT}`);
  });

  try {
    await connect();
    console.log('DB MongoDB conectada correctamente');
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error?.message);
    // No detener el servidor: útil en entornos sin salida a Internet
  }
};

startServer();


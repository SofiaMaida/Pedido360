import express from 'express';
import cors from 'cors';
import { express_config } from './config.js';
import mesasRoutes from './routes/mesa.js'
import pedidoRoutes from './routes/pedido.js'
import usuarioRoutes from './routes/usuario.js'
import menuRoutes from './routes/menu.js';
import { connect } from './database/db.js';

const app = express();


app.set('port', express_config.port);
app.set('host', express_config.host);

app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use(mesasRoutes);
app.use(pedidoRoutes);
app.use(usuarioRoutes);
app.use('/menu', menuRoutes);
const startServer = async () => {
  try {
    await connect(); // 👈 conectar una sola vez
    app.listen(app.get('port'), app.get('host'), () => {
      console.log(
        `Servidor corriendo en 'http://${app.get('host')}:${app.get('port')}`
      );
    });
  } catch (error) {
    console.error('❌ No se pudo conectar a la base de datos', error);
    process.exit(1);
  }
};

startServer();
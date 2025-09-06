import express from 'express';
import cors from 'cors';
import { express_config } from './config.js';
import mesasRoutes from './routes/mesa.js'
//import pedidoRoutes from './routes/pedido.js'
//import usuarioRoutes from './routes/usuario.js'

const app = express();


app.set('port', express_config.port);
app.set('host', express_config.host);

app.use(cors());
app.use(express.json());
app.use(mesasRoutes);
app.use(pedidoRoutes);
app.use(usuarioRoutes);


app.listen(app.get('port'), app.get('host'), () => {
    console.log(`Servidor corriendo en 'http://${app.get('host')}:${app.get('port')}`);

})
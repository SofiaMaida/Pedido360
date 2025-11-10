import mongoose from 'mongoose';
import { db_config } from '../config.js';

const safePass = encodeURIComponent(db_config.password);
const URI = `mongodb+srv://${db_config.user}:${safePass}@${db_config.cluster}/${db_config.database}?retryWrites=true&w=majority`;

console.log('USER:', db_config.user);
console.log('CLUSTER:', db_config.cluster);
console.log('DB:', db_config.database);
console.log('URI (sin pass):', `mongodb+srv://${db_config.user}:***@${db_config.cluster}/${db_config.database}`);

export async function connect() {
  // Reutilizar conexión en caliente (Lambda/servidor)
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  try {
    await mongoose.connect(URI);
    console.log('DB MongoDB Conectada correctamente');
    return mongoose.connection;
  } catch (error) {
    console.error('Error conectando a MongoDB:', error?.message || error);
    // No finalizar el proceso (evitar matar Lambda); propagar error
    throw error;
  }
}

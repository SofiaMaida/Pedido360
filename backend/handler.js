import serverless from 'serverless-http';
import app from './app.js';
import { connect } from './database/db.js';

let dbInitialized = false;

async function ensureDb() {
  if (!dbInitialized) {
    try {
      await connect();
      dbInitialized = true;
      console.log('DB MongoDB conectada (cold start)');
    } catch (e) {
      // No detener la ejecución en Lambda; registrar y continuar
      console.error('Fallo conexión MongoDB:', e?.message);
    }
  }
}

const serverlessHandler = serverless(app);

export const handler = async (event, context) => {
  await ensureDb();
  return serverlessHandler(event, context);
};


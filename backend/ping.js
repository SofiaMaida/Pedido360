// backend/ping.js
import { MongoClient, ServerApiVersion } from 'mongodb';
import 'dotenv/config';

const user = process.env.DB_USER;
const pass = encodeURIComponent(process.env.DB_PASSWORD || '');
const cluster = process.env.DB_CLUSTER; // p.ej. pedido360.hdub6ui.mongodb.net

const uri = `mongodb+srv://${user}:${pass}@${cluster}/?retryWrites=true&w=majority&appName=pedido360`;

const client = new MongoClient(uri, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
});

(async () => {
  try {
    await client.connect();
    await client.db('admin').command({ ping: 1 });
    console.log('✅ Ping OK: conexión válida con Atlas');
  } catch (e) {
    console.error('❌ Ping FAIL:', e);
  } finally {
    await client.close();
  }
})();

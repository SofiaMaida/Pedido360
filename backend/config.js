import { config } from 'dotenv';

config();

const db_config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  cluster: process.env.DB_CLUSTER,
  database: process.env.DB_NAME
};



const express_config = {
    port: process.env.PORT,
    host: process.env.HOST
}


export {db_config, express_config};
// URL pública base para construir enlaces (por ejemplo, para QR)
export const public_config = {
  baseUrl: process.env.PUBLIC_BASE_URL || 'http://127.0.0.1:5500/frontend'
};



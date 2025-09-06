import { config } from 'dotenv';

config();

const db_config = {
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
}


const express_config = {
    port: process.env.PORT,
    host: process.env.HOST,
}

const auth_config = {
    jwt_secret: process.env.JWT_SECRET
};


export {db_config, express_config, auth_config};



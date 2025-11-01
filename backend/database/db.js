import mongoose from 'mongoose';
import {db_config} from '../config.js';

const safePass = encodeURIComponent(db_config.password);
const URI = `mongodb+srv://${db_config.user}:${safePass}@${db_config.cluster}/${db_config.database}?retryWrites=true&w=majority`;

//const URI = `mongodb+srv://${db_config.user}:${db_config.password}@${db_config.database}.hdub6ui.mongodb.net/?retryWrites=true&w=majority&appName=${db_config.database}`;

console.log('USER:', db_config.user);
console.log('CLUSTER:', db_config.cluster);
console.log('DB:', db_config.database);
console.log('URI (sin pass):', `mongodb+srv://${db_config.user}:***@${db_config.cluster}/${db_config.database}`);


export async function connect() {
    try{
        await mongoose.connect(URI);
        console.log("DB MongoDB Conectada correctamente");
    }catch (error){
        console.log(error);
        // No finalizar el proceso: permitir que el servidor siga respondiendo
        // en entornos donde la DB pueda estar temporalmente inaccesible.
        // Propaga el error para que el caller decida cómo manejarlo.
        throw error;
    }
}

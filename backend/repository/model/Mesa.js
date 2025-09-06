import mongoose from 'mongoose';

const MesaSchema = mongoose.Schema(
    {
        numero: {
            type: String,
            required: true,
            unique: true
        },
        estado: {
            type: String,
            enum: ['libre', 'ocupada', 'reservada', 'mantenimiento'],
            default: 'libre'
        },
        meseroAsignado: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Usuario', // Asegúrate de que el modelo de mesero/usuario se llame así
            default: null
    }
    },
     { timestamps: true }
);

export const Mesa = mongoose.model('Mesa', MesaSchema )
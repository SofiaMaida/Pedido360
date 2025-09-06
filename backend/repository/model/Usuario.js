import mongoose from 'mongoose';

const UsuarioSchema = mongoose.Schema(
    {
        nombre: {
            type: String,
            required: true
        },
        rol: {
            type: String,
            enum: ['admin', 'mesero', 'cocinero'],
            default: 'mesero'
    },
    correo: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    contra: {
        type: String,
        required: true
        }
    }
);

export const Usuario = mongoose.model('Usuario', UsuarioSchema )
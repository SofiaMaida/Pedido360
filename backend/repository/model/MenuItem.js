import mongoose from 'mongoose';

const MenuItemSchema = new mongoose.Schema({
  categoria: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuCategory', required: true },
  nombre: { type: String, required: true, trim: true },
  descripcion: { type: String },
  precio: { type: Number, required: true, min: 0 },
  imageUrl: { type: String, required: true, trim: true },
  orden: { type: Number, default: 0 }
}, { timestamps: true });

export const MenuItem = mongoose.model('MenuItem', MenuItemSchema);

import mongoose from 'mongoose';

const MenuCategorySchema = new mongoose.Schema({
  nombre: { type: String, required: true, unique: true, trim: true },
  orden: { type: Number, default: 0 },
}, { timestamps: true });

export const MenuCategory = mongoose.model('MenuCategory', MenuCategorySchema);

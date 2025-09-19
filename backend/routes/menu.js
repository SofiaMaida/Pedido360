// routes/menu.js
import express from 'express';
import mongoose from 'mongoose';
import { MenuItem } from '../repository/model/MenuItem.js';
import { MenuCategory } from '../repository/model/MenuCategory.js';
const router = express.Router();


// GET /menu/categories  -> listar categorías visibles (ordenadas)
router.get('/categories', async (req, res, next) => {
  try {
    const cats = await MenuCategory.find().sort({ orden: 1, nombre: 1 });
    res.json(cats);
  } catch (e) { next(e); }
});

router.get('/items', async (req, res, next) => {
  try {
    const { categoryId, q, sort = 'nombre', order = 'asc', page = 1, limit = 12 } = req.query;

    const query = {};
    if (categoryId && mongoose.isValidObjectId(categoryId)) {
      query.categoria = categoryId;
    }
    if (q && q.trim()) {
      const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { nombre:      { $regex: escaped, $options: 'i' } },
        { descripcion: { $regex: escaped, $options: 'i' } }
      ];
    }

    const sortObj = { [sort]: order === 'desc' ? -1 : 1 };
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));

    const [items, total] = await Promise.all([
      MenuItem.find(query)
        .populate('categoria', 'nombre')
        .sort(sortObj)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      MenuItem.countDocuments(query)
    ]);

    res.json({ total, page: pageNum, pages: Math.ceil(total / limitNum), items });
  } catch (e) { next(e); }
});
// Crear categoría
router.post('/categories', async (req, res, next) => {
  try {
    const { nombre, orden = 0 } = req.body;
    if (!nombre?.trim()) return res.status(400).json({ mensaje: 'nombre es requerido' });

    const cat = await MenuCategory.create({ nombre: nombre.trim(), orden });
    res.status(201).json(cat);
  } catch (e) { next(e); }
});

// Crear item
router.post('/items', async (req, res, next) => {
  try {
    const { categoria, nombre, descripcion = '', precio, imageUrl, orden = 0 } = req.body;

    if (!mongoose.isValidObjectId(categoria)) return res.status(400).json({ mensaje: 'categoria inválida' });
    if (!nombre?.trim()) return res.status(400).json({ mensaje: 'nombre es requerido' });
    if (typeof precio !== 'number') return res.status(400).json({ mensaje: 'precio debe ser number' });
    if (!imageUrl?.trim()) return res.status(400).json({ mensaje: 'imageUrl es requerido' });

    const item = await MenuItem.create({ categoria, nombre: nombre.trim(), descripcion, precio, imageUrl, orden });
    const populated = await item.populate('categoria', 'nombre');
    res.status(201).json(populated);
  } catch (e) { next(e); }
});


export default router;

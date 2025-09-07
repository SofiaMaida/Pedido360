import mongoose from 'mongoose';

const PedidoItemSchema = new mongoose.Schema({
  menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: false },
  cantidad: { type: Number, default: 1, min: 1 },
  nombre:   { type: String, required: true },
  precioUnitario: { type: Number, required: true }
}, { _id: false });

const pedidoSchema = new mongoose.Schema({
  mesa:   { type: mongoose.Schema.Types.ObjectId, ref: 'Mesa', required: true },
  descripcion: String,
  mesero: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  items:  { type: [PedidoItemSchema], default: [] },   // ⬅️ importante
  total:  Number,
  estado: { type: String, enum:["pendiente","preparando","en 10 min","listo para servir","entregado"], default:"pendiente" }
}, { timestamps: true });

pedidoSchema.pre('save', function (next) {
  this.total = (this.items || []).reduce(
    (acc, it) => acc + (Number(it.precioUnitario) || 0) * (Number(it.cantidad) || 1),
    0
  );
  next();
});

export const Pedido = mongoose.model('Pedido', pedidoSchema);

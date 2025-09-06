import { Router } from "express";
import {
  agregarPedidoController,
  editarPedidoController,
  eliminarPedidoController,
  getPedidosController,
  getPedidosPorEstadoController,
  getPedidosPorMeseroController,
  obtenerPedidoController
} from "../controller/pedido.js";

const router = Router();

router.get('/pedido/:id/estado', obtenerPedidoController);
// Obtener todos los pedidos
router.get("/pedido", getPedidosController);

// Agregar un nuevo pedido
router.post("/pedido", agregarPedidoController);

// Editar un pedido por ID
router.put("/pedido/:id", editarPedidoController);

// Eliminar un pedido por ID
router.delete("/pedido/:id", eliminarPedidoController);

// Obtener pedidos por estado (ej: pendiente, preparando, etc.)
router.get("/pedido/estado/:estado", getPedidosPorEstadoController);

// Obtener pedidos por mesero (por ID de usuario)
router.get("/pedido/mesero/:idMesero", getPedidosPorMeseroController);

export default router;

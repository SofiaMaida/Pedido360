import {
  getPedidosRepository,
  agregarPedidosRepository,
  editarPedidoRepository,
  eliminarPedidoRepository,
  getPedidosPorEstadoRepository,
  getPedidosPorMeseroRepository,
  obtenerPedidoRepository
} from "../repository/pedido.js";
import QRCode from 'qrcode';
import { public_config } from '../config.js';

const calcTotal = (items = []) =>
  items.reduce(
    (acc, it) =>
      acc + (Number(it?.precioUnitario) || 0) * (Number(it?.cantidad) || 1),
    0
  );

// Obtener todos los pedidos
export const getPedidosService = async () => {
  try {
    return await getPedidosRepository();
  } catch (error) {
    console.error('Error en el Servicio:', error);
    throw new Error('Error al obtener los pedidos');
  }
};

// Obtener un pedido por su ID (para seguimiento)
export const obtenerPedidoService = async (id) => {
  try {
    const pedido = await obtenerPedidoRepository(id);
    return pedido;
  } catch (error) {
    console.error('Error en el Servicio:', error);
    throw new Error('Error al obtener el pedido');
  }
};
// Agregar un nuevo pedido
export const agregarPedidoService = async (pedido) => {
  try {
    // 'total' calcúlalo acá
    if (Array.isArray(pedido.items)) {
      pedido.total = calcTotal(pedido.items);
    }

    const pedidoNuevo = await agregarPedidosRepository(pedido);

    // QR de seguimiento con query-param id apuntando a la pantalla existente
    const base = public_config?.baseUrl || 'http://127.0.0.1:5500/frontend';
    const urlSeguimiento = `${base}/seguimiento/seguimiento.html?id=${pedidoNuevo._id}`;
    const qrCode = await QRCode.toDataURL(urlSeguimiento);

    const plain =
      typeof pedidoNuevo?.toObject === "function"
        ? pedidoNuevo.toObject()
        : pedidoNuevo;

    return { ...plain, qrCode, urlSeguimiento };
  } catch (error) {
    console.error("Error en el Servicio:", error);
    throw new Error("Error al agregar el pedido");
  }
};

// Editar un pedido existente (recalcula total si cambian items)
export const editarPedidoService = async (id, body) => {
  try {
    if (Array.isArray(body.items)) {
      body.total = calcTotal(body.items);
    }

    // Importante: que el repositorio use { new: true, runValidators: true }
    const actualizado = await editarPedidoRepository(id, body);

    if (!actualizado) throw new Error("Pedido no encontrado");
    return actualizado;
  } catch (error) {
    console.error("Error en el Servicio:", error);
    throw new Error("Error al editar el pedido");
  }
};

// Eliminar un pedido
export const eliminarPedidoService = async (id) => {
  try {
    const pedidoEliminado = await eliminarPedidoRepository(id);
    return pedidoEliminado;
  } catch (error) {
    console.error('Error en el Servicio:', error);
    throw new Error('Error al eliminar el pedido');
  }
};

// Obtener pedidos por estado
export const getPedidosPorEstadoService = async (estado) => {
  try {
    return await getPedidosPorEstadoRepository(estado);
  } catch (error) {
    console.error('Error en el Servicio:', error);
    throw new Error('Error al obtener pedidos por estado');
  }
};

// Obtener pedidos por mesero
export const getPedidosPorMeseroService = async (idMesero) => {
  try {
    return await getPedidosPorMeseroRepository(idMesero);
  } catch (error) {
    console.error('Error en el Servicio:', error);
    throw new Error('Error al obtener pedidos por mesero');
  }
};

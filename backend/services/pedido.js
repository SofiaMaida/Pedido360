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
    const pedidoNuevo = await agregarPedidosRepository(pedido);
    const urlSeguimiento = `https://tusitio.com/seguimiento/${pedidoNuevo._id}`;
    const qrCode = await QRCode.toDataURL(urlSeguimiento);
    return {
      ...pedidoNuevo.toObject(),
      qrCode
    }
  } catch (error) {
    console.error('Error en el Servicio:', error);
    throw new Error('Error al agregar el pedido');
  }
};

// Editar un pedido existente
export const editarPedidoService = async (id, pedidoActual) => {
  try {
    const result = await editarPedidoRepository(id, pedidoActual);
    return result;
  } catch (error) {
    console.error('Error en el Servicio:', error);
    throw new Error('Error al editar el pedido');
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

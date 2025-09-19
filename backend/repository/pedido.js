import { Pedido } from './model/Pedido.js';

export const getPedidosRepository = async () => {
    try {
        return await Pedido.find()
            .populate('mesa', 'numero estado')
            .populate('mesero', 'nombre correo rol');
    } catch (error) {
        console.error('Error en el Repositorio: ', error);
        throw new Error('Error en la consulta a la base de datos');
    }
};

export const agregarPedidosRepository = async (nuevoPedido) => {
    try {
        const pedidoNuevo = new Pedido(nuevoPedido);
        await pedidoNuevo.save();
        
         const pedidoConDatos = await Pedido.findById(pedidoNuevo._id)
      .populate('mesa', 'numero')
      .populate('mesero', 'nombre');
         return await pedidoConDatos;
    
    } catch (error) {
        console.error('Error en el Repositorio: ', error);
        throw new Error('Error al agregar los pedidos');
    }
}

export const eliminarPedidoRepository = async (id) => {
    try {
        const pedido = await Pedido.findByIdAndDelete(id);
        if (!pedido) {
            console.log('Pedido no encontrado');
        }else{
            console.log('Se elimino el pedido correctamente')
            return pedido;
        }
    } catch (error) {
        console.error('Error en el repositorio', error);
        throw new Error('Error al eliminar el pedido de la base de datos');
    }
    
}

export const editarPedidoRepository = async (id, pedidoActual) => {
    try {
        const pedido = await Pedido.findByIdAndUpdate(id, pedidoActual, { new: true, runValidators: true})

        if (!pedido) {
            console.log('pedido no encontrado')
            return null
        } else {
            console.log('Pedido editado correctamente', pedido)
            return pedido
        }
    } catch (error) {
        console.error('Error en el repositorio', error);
        throw new Error('Error al actualizar el pedido de la base de datos');
    
    }    
}
// Obtener pedidos por estado (ej: pendientes, preparando, etc.)
export const getPedidosPorEstadoRepository = async (estado) => {
    try {
        return await Pedido.find({ estado })
            .populate('mesa', 'numero estado')
            .populate('mesero', 'nombre correo rol');
    } catch (error) {
        console.error('Error buscando pedidos por estado', error);
        throw new Error('Error en la consulta de pedidos por estado');
    }
};

// Obtener pedidos asignados a un mesero específico
export const getPedidosPorMeseroRepository = async (idMesero) => {
    try {
        return await Pedido.find({ mesero: idMesero })
            .populate('mesa', 'numero estado')
            .populate('mesero', 'nombre correo rol');
    } catch (error) {
        console.error('Error buscando pedidos por mesero', error);
        throw new Error('Error en la consulta de pedidos por mesero');
    }
};
// Obtener un pedido por su ID (para seguimiento)
export const obtenerPedidoRepository = async (id) => {
  try {
    const pedido = await Pedido.findById(id)
      .populate('mesa', 'numero estado')          // solo número y estado de la mesa
      .populate('mesero', 'nombre correo rol')  // datos útiles del mesero
      .populate('items.menuItem', 'nombre precio');

      
    if (!pedido) {
      console.log('Pedido no encontrado');
      return null;
    }

    return pedido;

  } catch (error) {
    console.error('Error en el Repositorio:', error);
    throw new Error('Error al obtener el pedido de la base de datos');
  }
};

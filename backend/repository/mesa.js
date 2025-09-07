import { Mesa } from './model/Mesa.js';
/*import { connect } from '../database/db.js';

connect();*/

export const getMesasRepository = async () => {
    try {
        const mesa = await Mesa.find();
        
        return mesa;

    } catch (error) {
        console.error('Error en el Repositorio: ', error);
        throw new Error('Error en la consulta a la base de datos');
    }
}

export const agregarMesaRepository = async (nuevaMesa) => {
    try {
        const mesaNueva = new Mesa(nuevaMesa);
        await mesaNueva.save();       
    } catch (error) {
        console.error('Error en el Repositorio: ', error);
        throw new Error('Error al agregar mesa');
    }    
}

export const editarMesaRepository = async (id, mesa) => {
    try {
        const mesaEditada = await Mesa.findByIdAndUpdate(id, mesa, { new: true})
        if (!mesaEditada) {
            console.log('mesa no encontrada')
        } else {
            console.log('Se edito la mesa: ' + id);
            return mesaEditada;
            
        }
    } catch (error) {
        console.log('Error en el repo',error)
        throw new Error('Error al editar la mesa: ' + id + 'en la base de datos');

    }
    
}

export const asignarMeseroRepository = async (idMesa, idMesero) => {
  try {
    const mesa = await Mesa.findByIdAndUpdate(
      idMesa,
      { meseroAsignado: idMesero, estado: 'ocupada' },
      { new: true }
    ).populate('meseroAsignado', 'nombre correo rol');

    if (!mesa) throw new Error('Mesa no encontrada');
    return mesa;
  } catch (error) {
    console.error('Error asignando mesero:', error);
    throw new Error('Error al asignar mesero a la mesa');
  }
};

export const liberarMesaRepository = async (idMesa) => {
  try {
    const mesa = await Mesa.findByIdAndUpdate(
      idMesa,
      { estado: 'libre', meseroAsignado: null },
      { new: true }
    );
    if (!mesa) throw new Error('Mesa no encontrada');
    return mesa;
  } catch (error) {
    console.error('Error al liberar mesa:', error);
    throw new Error('Error al liberar la mesa');
  }
};

export const getMesasPorEstadoRepository = async (estado) => {
    try {
        return await Mesa.find({ estado });
    } catch (error) {
        console.error('Error al buscar mesas por estado:', error);
        throw new Error('No se pudo obtener la lista de mesas por estado');
    }
};



import { 
  getMesasRepository, 
  agregarMesaRepository, 
  editarMesaRepository, 
  asignarMeseroRepository, 
  liberarMesaRepository,
  getMesasPorEstadoRepository
} from '../repository/mesa.js';

export const listarMesasService = async () => {
  try {
    const mesas = await getMesasRepository();
    return mesas;
  } catch (error) {
    throw new Error('Error al listar mesas: ' + error.message);
  }
};

export const crearMesaService = async (nuevaMesa) => {
  try {
    const mesaCreada = await agregarMesaRepository(nuevaMesa);
    return mesaCreada;
  } catch (error) {
    throw new Error('Error al crear mesa: ' + error.message);
  }
};

export const modificarMesaService = async (id, datosMesa) => {
  try {
    const mesaEditada = await editarMesaRepository(id, datosMesa);
    if (!mesaEditada) throw new Error('Mesa no encontrada para editar');
    return mesaEditada;
  } catch (error) {
    throw new Error('Error al modificar mesa: ' + error.message);
  }
};

export const asignarMeseroAMesaService = async (idMesa, idMesero) => {
  try {
    const mesaActualizada = await asignarMeseroRepository(idMesa, idMesero);
    return mesaActualizada;
  } catch (error) {
    throw new Error('Error al asignar mesero: ' + error.message);
  }
};

export const liberarMesaService = async (idMesa) => {
  try {
    const mesaLiberada = await liberarMesaRepository(idMesa);
    return mesaLiberada;
  } catch (error) {
    throw new Error('Error al liberar mesa: ' + error.message);
  }
};

export const listarMesasPorEstadoService = async (estado) => {
  try {
    const mesas = await getMesasPorEstadoRepository(estado);
    return mesas;
  } catch (error) {
    throw new Error('Error al listar mesas por estado: ' + error.message);
  }
};

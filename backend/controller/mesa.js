import mongoose from "mongoose";
import { 
  listarMesasService,
  crearMesaService,
  modificarMesaService,
  asignarMeseroAMesaService,
  liberarMesaService,
  listarMesasPorEstadoService
} from "../services/mesa.js";

export const getMesasController = async (req, res) => {
  try {
    let mesas = await listarMesasService();
    // Siempre devolver un array JSON, incluso si está vacío
    return res.status(200).json(mesas || []);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: 'Error al obtener las mesas' });
  }
};

export const agregarMesaController = async (req, res) => {
  const mesa = req.body;
  try {
    const mesaNueva = await crearMesaService(mesa);
    return res.status(201).send({ mensaje: 'Mesa agregada correctamente', mesa: mesaNueva });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: 'Error al agregar la mesa' });
  }
};

export const editarMesaController = async (req, res) => {
  const { id } = req.params;
  const mesa = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ mensaje: 'ID inválido' });
  }

  try {
    const mesaActualizada = await modificarMesaService(id, mesa);
    if (!mesaActualizada) {
      return res.status(404).send({ mensaje: `No se encontró ninguna mesa con ID ${id}` });
    }
    return res.status(200).send({ mensaje: 'La mesa ha sido editada correctamente', mesa: mesaActualizada });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ mensaje: 'Error al actualizar la mesa', error });
  }
};

// Controller para asignar mesero a mesa
export const asignarMeseroController = async (req, res) => {
  const { idMesa, idMesero } = req.params;

  if (!mongoose.Types.ObjectId.isValid(idMesa) || !mongoose.Types.ObjectId.isValid(idMesero)) {
    return res.status(400).json({ mensaje: 'ID inválido para mesa o mesero' });
  }

  try {
    const mesaActualizada = await asignarMeseroAMesaService(idMesa, idMesero);
    return res.status(200).json({ mensaje: 'Mesero asignado correctamente', mesa: mesaActualizada });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: 'Error al asignar mesero', error });
  }
};

// Controller para liberar mesa
export const liberarMesaController = async (req, res) => {
  const { idMesa } = req.params;

  if (!mongoose.Types.ObjectId.isValid(idMesa)) {
    return res.status(400).json({ mensaje: 'ID inválido para mesa' });
  }

  try {
    const mesaLiberada = await liberarMesaService(idMesa);
    return res.status(200).json({ mensaje: 'Mesa liberada correctamente', mesa: mesaLiberada });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: 'Error al liberar mesa', error });
  }
};

// Controller para listar mesas por estado
export const getMesasPorEstadoController = async (req, res) => {
  const { estado } = req.params;

  try {
    const mesas = await listarMesasPorEstadoService(estado);
    return res.status(200).json(mesas);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: 'Error al listar mesas por estado', error });
  }
};

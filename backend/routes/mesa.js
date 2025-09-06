import { Router } from "express";
import {
  agregarMesaController,
  getMesasController,
  editarMesaController,
  asignarMeseroController,
  liberarMesaController,
  getMesasPorEstadoController
} from "../controller/mesa.js";

const router = Router();

// Obtener todas las mesas
router.get('/mesas', getMesasController);

// Agregar una nueva mesa
router.post('/mesas', agregarMesaController);

// Editar una mesa existente
router.put('/mesas/:id', editarMesaController);

// Asignar un mesero a una mesa
router.put('/mesas/asignar/:idMesa/mesero/:idMesero', asignarMeseroController);

// Liberar una mesa
router.put('/mesas/liberar/:idMesa', liberarMesaController);

// Obtener mesas filtradas por estado (ej: libre, ocupada, reservada)
router.get('/mesas/estado/:estado', getMesasPorEstadoController);

export default router;

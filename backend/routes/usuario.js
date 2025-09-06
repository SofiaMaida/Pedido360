import { Router } from "express";
import {
  loginUsuarioController, 
  listarUsuariosController,
  obtenerUsuarioPorIdController,
  obtenerUsuarioPorCorreoController,
  crearUsuarioController,
  actualizarUsuarioController,
  eliminarUsuarioController
} from "../controller/usuario.js";

const router = Router();

// Obtener todos los usuarios
router.get("/usuarios", listarUsuariosController);

// Obtener un usuario por ID
router.get("/usuarios/:id", obtenerUsuarioPorIdController);

// Obtener un usuario por correo
router.get("/usuarios/correo/:correo", obtenerUsuarioPorCorreoController);

// Agregar un nuevo usuario
router.post("/usuarios", crearUsuarioController);

// Editar un usuario por ID
router.put("/usuarios/:id", actualizarUsuarioController);

// Eliminar un usuario por ID
router.delete("/usuarios/:id", eliminarUsuarioController);

// Login de usuario
router.post("/usuarios/login", loginUsuarioController);

export default router;

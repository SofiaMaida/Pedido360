import mongoose from 'mongoose';
import {
 loginUsuarioService,
  listarUsuariosService,
  obtenerUsuarioPorIdService,
  obtenerUsuarioPorCorreoService,
  crearUsuarioService,
  actualizarUsuarioService,
  eliminarUsuarioService
} from '../services/usuario.js';

export const loginUsuarioController = async (req, res) => {
  const { correo, contra } = req.body;

    try {
    const usuarioauth = await loginUsuarioService(correo, contra);
    res.status(200).json({ 
      mensaje: "Login exitoso",
       usuario: usuarioauth
       });
  } catch (error) {
    res.status(401).json({ mensaje: error.message });
  }
};
// Obtener todos los usuarios
export const listarUsuariosController = async (req, res) => {
  try {
    const usuarios = await listarUsuariosService();
    if (usuarios.length === 0) {
      return res.status(200).send({ mensaje: 'No hay usuarios registrados' });
    }
    return res.status(200).send(usuarios);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ mensaje: 'Error al obtener los usuarios' });
  }
};

// Obtener un usuario por ID
export const obtenerUsuarioPorIdController = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({ mensaje: 'ID inválido' });
  }

  try {
    const usuario = await obtenerUsuarioPorIdService(id);
    if (!usuario) {
      return res.status(404).send({ mensaje: 'Usuario no encontrado' });
    }
    return res.status(200).send(usuario);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ mensaje: 'Error al obtener el usuario' });
  }
};

// Obtener un usuario por correo
export const obtenerUsuarioPorCorreoController = async (req, res) => {
  const { correo } = req.params;

  try {
    const usuario = await obtenerUsuarioPorCorreoService(correo);
    if (!usuario) {
      return res.status(404).send({ mensaje: 'Usuario no encontrado' });
    }
    return res.status(200).send(usuario);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ mensaje: 'Error al obtener el usuario por correo' });
  }
};

// Crear un nuevo usuario
export const crearUsuarioController = async (req, res) => {
  const nuevoUsuario = req.body;
  try {
    const usuarioCreado = await crearUsuarioService(nuevoUsuario);
    return res.status(201).send({ mensaje: 'Usuario creado correctamente', usuario: usuarioCreado });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ mensaje: 'Error al crear el usuario' });
  }
};

// Actualizar un usuario
export const actualizarUsuarioController = async (req, res) => {
  const { id } = req.params;
  const datosActualizados = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({ mensaje: 'ID inválido' });
  }

  try {
    const usuarioActualizado = await actualizarUsuarioService(id, datosActualizados);
    return res.status(200).send({ mensaje: 'Usuario actualizado correctamente', usuario: usuarioActualizado });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ mensaje: 'Error al actualizar el usuario' });
  }
};

// Eliminar un usuario
export const eliminarUsuarioController = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({ mensaje: 'ID inválido' });
  }

  try {
    const usuarioEliminado = await eliminarUsuarioService(id);
    return res.status(200).send({ mensaje: 'Usuario eliminado correctamente', usuario: usuarioEliminado });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ mensaje: 'Error al eliminar el usuario' });
  }
};

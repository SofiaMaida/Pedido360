import { Usuario } from './model/Usuario.js'; 
import { connect } from '../database/db.js';

connect();

// Obtener todos los usuarios
export const getUsuariosRepository = async () => {
  try {
    return await Usuario.find();
  } catch (error) {
    console.error('Error en el Repositorio:', error);
    throw new Error('Error en la consulta de usuarios');
  }
};

// Obtener un usuario por ID
export const getUsuarioByIdRepository = async (id) => {
  try {
    return await Usuario.findById(id);
  } catch (error) {
    console.error('Error al buscar usuario:', error);
    throw new Error('Error al buscar el usuario');
  }
};

// Obtener un usuario por correo (útil para login)
export const getUsuarioByCorreoRepository = async (correo) => {
  try {
    return await Usuario.findOne({ correo });
  } catch (error) {
    console.error('Error al buscar usuario por correo:', error);
    throw new Error('Error al buscar el usuario por correo');
  }
};

// Agregar un nuevo usuario
export const agregarUsuarioRepository = async (nuevoUsuario) => {
  try {
    const usuario = new Usuario(nuevoUsuario);
    await usuario.save();
    return usuario;
  } catch (error) {
    console.error('Error al agregar usuario:', error);
    throw new Error('Error al agregar usuario');
  }
};

// Editar un usuario por ID
export const editarUsuarioRepository = async (id, usuarioActualizado) => {
  try {
    const usuario = await Usuario.findByIdAndUpdate(id, usuarioActualizado, { new: true });
    if (!usuario) throw new Error('Usuario no encontrado');
    return usuario;
  } catch (error) {
    console.error('Error al editar usuario:', error);
    throw new Error('Error al editar usuario');
  }
};

// Eliminar un usuario por ID
export const eliminarUsuarioRepository = async (id) => {
  try {
    const usuario = await Usuario.findByIdAndDelete(id);
    if (!usuario) throw new Error('Usuario no encontrado');
    return usuario;
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    throw new Error('Error al eliminar usuario');
  }
};

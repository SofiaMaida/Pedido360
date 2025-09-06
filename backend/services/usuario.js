import {
  getUsuariosRepository,
  getUsuarioByIdRepository,
  getUsuarioByCorreoRepository,
  agregarUsuarioRepository,
  editarUsuarioRepository,
  eliminarUsuarioRepository
} from '../repository/usuario.js';

// Login de usuario
export const loginUsuarioService = async (correo, password) => {
  const usuario = await getUsuarioByCorreoRepository(correo);

  if (!usuario) {
    throw new Error("Usuario no encontrado");
  }

  if (usuario.contra !== password) {
    throw new Error("Contraseña incorrecta");
  }

  return usuario;
};

// Obtener todos los usuarios
export const listarUsuariosService = async () => {
  return await getUsuariosRepository();
};

// Obtener un usuario por ID
export const obtenerUsuarioPorIdService = async (id) => {
  return await getUsuarioByIdRepository(id);
};

// Obtener un usuario por correo
export const obtenerUsuarioPorCorreoService = async (correo) => {
  return await getUsuarioByCorreoRepository(correo);
};

// Crear un nuevo usuario
export const crearUsuarioService = async (nuevoUsuario) => {
  return await agregarUsuarioRepository(nuevoUsuario);
};

// Actualizar un usuario
export const actualizarUsuarioService = async (id, datosActualizados) => {
  return await editarUsuarioRepository(id, datosActualizados);
};

// Eliminar un usuario
export const eliminarUsuarioService = async (id) => {
  return await eliminarUsuarioRepository(id);
};

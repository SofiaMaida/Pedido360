(() => {
const API_BASE = window.API_BASE || localStorage.getItem('API_BASE') || 'http://localhost:3000';
const API_URL = `${API_BASE}/usuarios`;

let form;
let feedback;
let tableBody;
let btnGuardar;
let estadoUsuarios;
let totalUsuarios;
let totalAdmins;
let totalMozos;
let totalCocineros;

let ocultarFeedbackTimeout = null;

const FEEDBACK_BASE_CLASSES = [
  "mb-6",
  "rounded-lg",
  "border",
  "px-4",
  "py-3",
  "text-sm",
  "font-medium",
  "transition-all",
];

async function fetchUsuarios() {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error("No se pudieron obtener los usuarios");
  }

  const data = await response.json();
  if (Array.isArray(data)) {
    return data;
  }

  if (data && Array.isArray(data.usuarios)) {
    return data.usuarios;
  }

  return [];
}

function normalizarRol(rol) {
  const etiquetas = {
    admin: "Administrador",
    mesero: "Mozo",
    cocinero: "Cocinero",
  };

  return etiquetas[rol] || rol;
}

function mostrarMensaje(texto, tipo = "success") {
  if (!feedback) return;
  feedback.textContent = texto;
  feedback.className = "";
  feedback.classList.add(...FEEDBACK_BASE_CLASSES);

  if (tipo === "success") {
    feedback.classList.add("border-green-200", "bg-green-50", "text-green-700");
  } else {
    feedback.classList.add("border-red-200", "bg-red-50", "text-red-700");
  }

  clearTimeout(ocultarFeedbackTimeout);
  ocultarFeedbackTimeout = setTimeout(() => {
    feedback.textContent = "";
    feedback.className = "hidden";
  }, 4000);
}

function renderUsuarios(Usuarios) {
  const usuarios = Array.isArray(Usuarios) ? Usuarios : [];
  if (!tableBody) return;
  if (!usuarios.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="4" class="px-6 py-6 text-center text-sm text-gray-500">
          No hay usuarios registrados todavía.
        </td>
      </tr>`;
    return;
  }

  tableBody.innerHTML = usuarios
    .map(
      (usuario) => `
        <tr>
          <td class="px-6 py-4 text-sm text-gray-900">
            <div class="font-semibold">${usuario.nombre}</div>
          </td>
          <td class="px-6 py-4 text-sm text-gray-600">${normalizarRol(usuario.rol)}</td>
          <td class="px-6 py-4 text-sm text-gray-600">${usuario.correo}</td>
          <td class="px-6 py-4 text-sm text-right">
            <button
              class="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-medium"
              data-eliminar
              data-id="${usuario._id}"
              data-nombre="${usuario.nombre}"
            >
              <span>Eliminar</span>
            </button>
          </td>
        </tr>`
    )
    .join("");
}

function actualizarEstadisticas(usuarios) {
  if (!totalUsuarios || !totalAdmins || !totalMozos || !totalCocineros) return;
  const conteo = usuarios.reduce(
    (acc, usuario) => {
      acc.total += 1;
      if (usuario.rol && acc[usuario.rol] !== undefined) {
        acc[usuario.rol] += 1;
      }
      return acc;
    },
    { total: 0, admin: 0, mesero: 0, cocinero: 0 }
  );

  totalUsuarios.textContent = conteo.total;
  totalAdmins.textContent = conteo.admin;
  totalMozos.textContent = conteo.mesero;
  totalCocineros.textContent = conteo.cocinero;
}

async function cargarUsuarios() {
  if (!tableBody || !estadoUsuarios) return;
  tableBody.innerHTML = `
    <tr>
      <td colspan="4" class="px-6 py-6 text-center text-sm text-gray-500">
        Cargando usuarios...
      </td>
    </tr>`;

  try {
    const usuarios = await fetchUsuarios();
    renderUsuarios(usuarios);
    actualizarEstadisticas(usuarios);
    const ultimaActualizacion = new Date().toLocaleTimeString();
    if (estadoUsuarios) {
      estadoUsuarios.textContent = `Actualizado a las ${ultimaActualizacion}`;
    }
  } catch (error) {
    console.error(error);
    if (tableBody) {
      tableBody.innerHTML = `
      <tr>
        <td colspan="4" class="px-6 py-6 text-center text-sm text-red-600">
          Ocurrió un error al cargar los usuarios.
        </td>
      </tr>`;
    }
    if (estadoUsuarios) {
      estadoUsuarios.textContent = "No se pudieron cargar los usuarios";
    }
    mostrarMensaje("No fue posible cargar los usuarios. Inténtalo nuevamente.", "error");
  }
}

async function crearUsuario(datosUsuario) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(datosUsuario),
  });

  if (!response.ok) {
    let mensaje = "No se pudo crear el usuario";
    try {
      const data = await response.json();
      mensaje = data.mensaje || mensaje;
    } catch (_) {
      // no-op
    }
    throw new Error(mensaje);
  }

  return response.json();
}

async function eliminarUsuario(id) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    let mensaje = "No se pudo eliminar el usuario";
    try {
      const data = await response.json();
      mensaje = data.mensaje || mensaje;
    } catch (_) {
      // no-op
    }
    throw new Error(mensaje);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  form = document.getElementById("formUsuario");
  feedback = document.getElementById("feedback");
  tableBody = document.getElementById("usuariosTableBody");
  btnGuardar = document.getElementById("btnGuardarUsuario");
  estadoUsuarios = document.getElementById("estadoUsuarios");
  totalUsuarios = document.getElementById("totalUsuarios");
  totalAdmins = document.getElementById("totalAdmins");
  totalMozos = document.getElementById("totalMozos");
  totalCocineros = document.getElementById("totalCocineros");

  if (form && btnGuardar) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const formData = new FormData(form);
      const nuevoUsuario = {
        nombre: (formData.get("nombre") || "").toString().trim(),
        correo: (formData.get("correo") || "").toString().trim().toLowerCase(),
        contra: formData.get("contra"),
        rol: formData.get("rol"),
      };

      if (!nuevoUsuario.nombre || !nuevoUsuario.correo || !nuevoUsuario.contra) {
        mostrarMensaje("Por favor completa todos los campos.", "error");
        return;
      }

      btnGuardar.disabled = true;
      btnGuardar.textContent = "Guardando...";

      try {
        await crearUsuario(nuevoUsuario);
        form.reset();
        mostrarMensaje("Usuario creado correctamente.", "success");
        await cargarUsuarios();
      } catch (error) {
        mostrarMensaje(error.message || "No fue posible crear el usuario.", "error");
      } finally {
        btnGuardar.disabled = false;
        btnGuardar.textContent = "Guardar usuario";
      }
    });
  }

  if (tableBody) {
    tableBody.addEventListener("click", async (event) => {
      const boton = event.target.closest("button[data-eliminar]");
      if (!boton) return;

      const id = boton.dataset.id;
      const nombre = boton.dataset.nombre;

      const confirmar = window.confirm(`¿Seguro que deseas eliminar a ${nombre}?`);
      if (!confirmar) return;

      boton.disabled = true;
      boton.classList.add("opacity-50", "cursor-not-allowed");

      try {
        await eliminarUsuario(id);
        mostrarMensaje("Usuario eliminado correctamente.", "success");
        await cargarUsuarios();
      } catch (error) {
        mostrarMensaje(error.message || "No fue posible eliminar el usuario.", "error");
      } finally {
        boton.disabled = false;
        boton.classList.remove("opacity-50", "cursor-not-allowed");
      }
    });
  }

  if (tableBody) {
    cargarUsuarios();
  }
});

})();

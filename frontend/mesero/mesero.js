(() => {
document.addEventListener('DOMContentLoaded', () => {
  const API_BASE = window.API_BASE || localStorage.getItem('API_BASE') || 'http://localhost:3000';
  const idMesero = localStorage.getItem('usuarioId');
  console.log("ID del mesero recuperado:", idMesero);

  fetch(`${API_BASE}/pedido/mesero/${idMesero}`)
    .then(res => res.json())
    .then(pedidos => {
    console.log('Pedidos del mesero:', pedidos);

    // En la plantilla del mesero la tabla (con id 'tablaPedidos') puede o no existir.
    // Si existe, limpiamos y renderizamos filas; si no, sólo actualizamos contadores.
    const tbody = document.getElementById('tablaPedidos');
    if (!tbody) {
      console.warn("No se encontró el elemento tbody con id 'tablaPedidos'. La tabla será omitida y solo se actualizarán los contadores.");
    } else {
      tbody.innerHTML = '';
    }

    let pendientes = 0;
    let preparacion = 0;
    let yaCasi = 0;
    let listos = 0;

    if (!Array.isArray(pedidos)) pedidos = [];

    pedidos.forEach((pedido, index) => {
      const fila = document.createElement('tr');
      const fecha = new Date(pedido.createdAt || pedido.creadoEn || Date.now()).toLocaleString();
      fila.innerHTML = `
        <td class="px-6 py-3">${index + 1}</td>
        <td class="px-6 py-3">${pedido.mesa?.numero || 'N/A'}</td>
        <td class="px-6 py-3">${pedido.descripcion || '-'}</td>
        <td class="px-6 py-3">${pedido.estado || '-'}</td>
        <td class="px-6 py-3">${fecha}</td>
      `;
      if (tbody) {
        tbody.appendChild(fila);
      }

      // Contar según estado (normalizamos a minúsculas)
      const estado = (pedido.estado || '').toString().toLowerCase();
      switch (estado) {
        case 'pendiente':
          pendientes++; break;
        case 'preparando':
          preparacion++; break;
        case 'en 10 min':
        case 'en 10mins':
        case 'en 10 min.':
          yaCasi++; break;
        case 'listo para servir':
        case 'listo':
          listos++; break;
      }
    });

    // Actualizar contadores solo si existen en el DOM
    const setIfExists = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
      else console.warn(`Elemento con id '${id}' no encontrado.`);
    };

    setIfExists('contadorPendientes', pendientes);
    setIfExists('contadorPreparacion', preparacion);
    setIfExists('contadorYaCasi', yaCasi);
    setIfExists('contadorListos', listos);
    })
    .catch(error => console.error('Error al cargar pedidos:', error));

  // 1) Obtener nombre del usuario (guardado en login)
  const nombre = localStorage.getItem('usuarioNombre') || 'Mesero invitado';

  // 2) Setear nombre e iniciales (protegemos si los elementos no existen)
  const userNameEl = document.getElementById('userName');
  const userAvatarEl = document.getElementById('userAvatar');
  if (userNameEl) userNameEl.textContent = nombre;

  function getInitials(n) {
    return n.trim().split(/\s+/).map(p => p[0]).slice(0,2).join('').toUpperCase();
  }
  if (userAvatarEl) userAvatarEl.textContent = getInitials(nombre);

  // 3) Toggle del dropdown + accesibilidad
  const userMenu = document.getElementById('userMenu');
  const btn = document.getElementById('userMenuButton');
  const dd = document.getElementById('userDropdown');
  const chevron = document.getElementById('chevron');

  function closeMenu() {
    dd.classList.add('hidden');
    btn.setAttribute('aria-expanded', 'false');
    chevron.classList.remove('rotate-180');
  }
  function toggleMenu() {
    const isHidden = dd.classList.contains('hidden');
    dd.classList.toggle('hidden');
    btn.setAttribute('aria-expanded', String(isHidden));
    chevron.classList.toggle('rotate-180', isHidden);
  }

  if (btn && dd) {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMenu();
    });
  }

  // Cerrar al hacer click fuera
  document.addEventListener('click', (e) => {
    if (userMenu && !userMenu.contains(e.target)) closeMenu();
  });

  // 4) Cerrar sesión
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('usuarioId');
      localStorage.removeItem('usuarioNombre');
      sessionStorage.clear();
      window.location.href = '../login/login.html';
    });
  }
});
})();

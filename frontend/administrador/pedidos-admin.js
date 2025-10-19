// ===== Config =====
// Detecta entorno para base de API
const API_BASE =
  location.hostname === 'localhost' || location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:3000'
    : 'https://api.pedido360.com.ar';

// Normaliza los estados que puedan venir con variantes
function normalizeEstado(raw) {
  const v = String(raw || '').toLowerCase().trim().replace(/\s+/g, ' ');
  if (['en 10 min','ya casi','en10min','en 10min'].includes(v)) return 'en 10 min';
  if (['listo','listo para servir','listo-para-servir'].includes(v)) return 'listo para servir';
  if (['preparando','en preparación','en preparacion'].includes(v)) return 'preparando';
  return 'pendiente';
}

function formatCurrency(n) {
  const num = Number(n || 0);
  return num.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
}

// ===== Inicio =====
document.addEventListener('DOMContentLoaded', () => {
  setupUserInfo();
  cargarPedidos();
});

// ===== UI Usuario / Menú =====
function setupUserInfo() {
  const nombre = localStorage.getItem('usuarioNombre') || 'Mesero';
  const userNameEl = document.getElementById('userName');
  const userAvatarEl = document.getElementById('userAvatar');
  userNameEl.textContent = nombre;
  userAvatarEl.textContent = getInitials(nombre);
  setupDropdownMenu();
}

function getInitials(nombre) {
  return nombre.trim().split(/\s+/).map(p => p[0]).slice(0,2).join('').toUpperCase();
}

function setupDropdownMenu() {
  const userMenu = document.getElementById('userMenu');
  const btn = document.getElementById('userMenuButton');
  const dd = document.getElementById('userDropdown');
  const chevron = document.getElementById('chevron');

  btn.addEventListener('click', (e) => { e.stopPropagation(); toggleMenu(); });
  document.addEventListener('click', (e) => { if (!userMenu.contains(e.target)) closeMenu(); });
  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.clear();
    window.location.href = '../login/login.html';
  });

  function toggleMenu() {
    const isHidden = dd.classList.contains('hidden');
    dd.classList.toggle('hidden');
    btn.setAttribute('aria-expanded', String(isHidden));
    chevron.classList.toggle('rotate-180', isHidden);
  }
  function closeMenu() {
    dd.classList.add('hidden');
    btn.setAttribute('aria-expanded', 'false');
    chevron.classList.remove('rotate-180');
  }
}

// ===== Carga de pedidos =====
async function cargarPedidos() {
  const rol = (localStorage.getItem('usuarioRol') || '').toLowerCase();
  const idMesero = localStorage.getItem('usuarioId');

  // Decide endpoint según rol
  let url;
  if (rol === 'admin') {
    url = `${API_BASE}/pedido`;                 // 👈 todos los pedidos
  } else {
    if (!idMesero) {
      alert('No se encontró identificación del usuario. Inicie sesión nuevamente.');
      window.location.href = '../login/login.html';
      return;
    }
    url = `${API_BASE}/pedido/mesero/${idMesero}`;
  }

  try {
    // Nota: no enviamos credenciales porque la API no usa cookies
    const res = await fetch(url);
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        alert('Sesión expirada o sin permisos. Inicie sesión nuevamente.');
        window.location.href = '../login/login.html';
        return;
      }
      throw new Error(`GET ${url} -> ${res.status}`);
    }
    let pedidos = await res.json();
    if (!Array.isArray(pedidos)) pedidos = [];

    // Render + contadores
    renderTabla(pedidos);
    actualizarContadores(pedidos);

  } catch (error) {
    console.error('Error al cargar pedidos:', error);
    alert('Error al cargar los pedidos. Por favor, intente nuevamente.');
  }
}

function actualizarContadores(pedidos) {
  const c = { pendiente: 0, preparando: 0, 'en 10 min': 0, 'listo para servir': 0 };
  pedidos.forEach(p => { c[normalizeEstado(p.estado)] = (c[normalizeEstado(p.estado)] || 0) + 1; });
  document.getElementById('contadorPendientes').textContent   = c.pendiente || 0;
  document.getElementById('contadorPreparacion').textContent  = c.preparando || 0;
  document.getElementById('contadorYaCasi').textContent       = c['en 10 min'] || 0;
  document.getElementById('contadorListos').textContent       = c['listo para servir'] || 0;
}

function renderTabla(pedidos) {
  const tbody = document.getElementById('tablaPedidos');
  tbody.innerHTML = '';
  // Ordenar por fecha (más nuevos arriba)
  pedidos.sort((a,b) => new Date(b.createdAt||0) - new Date(a.createdAt||0));

  pedidos.forEach(pedido => {
    const fila = document.createElement('tr');
    fila.className = 'hover:bg-gray-50 cursor-pointer';

    const items = Array.isArray(pedido.items) ? pedido.items : [];
    const itemsResumen = items.map(it => `${it.cantidad ?? 1}x ${it.nombre ?? it.menuItem?.nombre ?? 'Item'}`).join(', ');

    fila.innerHTML = `
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${pedido._id}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Mesa ${pedido.mesa?.numero ?? 'N/A'}</td>
      <td class="px-6 py-4 text-sm text-gray-900">${pedido.descripcion || '-'}</td>
      <td class="px-6 py-4 text-sm text-gray-900">${itemsResumen || 'Sin items'}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formatCurrency(pedido.total)}</td>
      <td class="px-6 py-4 whitespace-nowrap">
        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoColor(normalizeEstado(pedido.estado))}">
          ${normalizeEstado(pedido.estado)}
        </span>
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        ${pedido.createdAt ? new Date(pedido.createdAt).toLocaleString('es-AR') : '-'}
      </td>
    `;

    fila.addEventListener('click', () => mostrarDetalles(pedido));
    tbody.appendChild(fila);
  });
}

function getEstadoColor(estadoNorm) {
  const colores = {
    'pendiente': 'bg-yellow-100 text-yellow-800',
    'preparando': 'bg-blue-100 text-blue-800',
    'en 10 min': 'bg-purple-100 text-purple-800',
    'listo para servir': 'bg-green-100 text-green-800',
    'entregado': 'bg-gray-100 text-gray-800'
  };
  return colores[estadoNorm] || 'bg-gray-100 text-gray-800';
}

function mostrarDetalles(pedido) {
  const modal = document.getElementById('modalDetalles');
  const detalles = document.getElementById('detallesPedido');

  const items = Array.isArray(pedido.items) ? pedido.items : [];
  const itemsDetalle = items.map(item => `
    <div class="flex justify-between border-b py-2">
      <div>
        <span class="font-medium">${item.nombre ?? item.menuItem?.nombre ?? 'Item'}</span>
        <span class="text-gray-500"> x${item.cantidad ?? 1}</span>
      </div>
      <div>${formatCurrency((item.precioUnitario ?? 0) * (item.cantidad ?? 1))}</div>
    </div>
  `).join('');

  detalles.innerHTML = `
    <div class="border-b pb-4">
      <p class="text-sm text-gray-600">ID del Pedido</p>
      <p class="font-medium break-all">${pedido._id}</p>
    </div>
    <div class="border-b pb-4">
      <p class="text-sm text-gray-600">Mesa</p>
      <p class="font-medium">Mesa ${pedido.mesa?.numero ?? 'N/A'}</p>
    </div>
    <div class="border-b pb-4">
      <p class="text-sm text-gray-600">Descripción</p>
      <p class="font-medium">${pedido.descripcion || '-'}</p>
    </div>
    <div class="border-b pb-4">
      <p class="text-sm text-gray-600">Items</p>
      <div class="mt-2">${itemsDetalle || '<div class="text-gray-500">Sin items</div>'}</div>
    </div>
    <div class="border-b pb-4">
      <p class="text-sm text-gray-600">Total</p>
      <p class="font-medium">${formatCurrency(pedido.total)}</p>
    </div>
    <div class="border-b pb-4">
      <p class="text-sm text-gray-600">Estado</p>
      <p class="font-medium">${normalizeEstado(pedido.estado)}</p>
    </div>
    <div>
      <p class="text-sm text-gray-600">Fecha de creación</p>
      <p class="font-medium">${pedido.createdAt ? new Date(pedido.createdAt).toLocaleString('es-AR') : '-'}</p>
    </div>
  `;

  modal.classList.remove('hidden');
}

// Cerrar modal
document.getElementById('cerrarModal')?.addEventListener('click', () => {
  document.getElementById('modalDetalles').classList.add('hidden');
});
document.getElementById('modalDetalles')?.addEventListener('click', (e) => {
  if (e.target.id === 'modalDetalles') e.target.classList.add('hidden');
});

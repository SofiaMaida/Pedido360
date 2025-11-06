(() => {
// Configuración básica
const API_BASE = (typeof window !== 'undefined' && window.API_BASE)
  ? window.API_BASE
  : (localStorage.getItem('API_BASE') || 'http://localhost:3000');
try {
  if (typeof window !== 'undefined' && window.API_BASE && localStorage.getItem('API_BASE') !== window.API_BASE) {
    localStorage.setItem('API_BASE', window.API_BASE);
  }
} catch (_) {}
try { console.log('[cocina] API_BASE =', API_BASE); } catch (_) {}
const ESTADOS = {
  pendiente: 'pendiente',
  preparando: 'preparando',
  yaCasi: 'en 10 min', // "Ya casi" en la UI, "en 10 min" en backend
  listo: 'listo para servir'
};

// Estado de UI
let estadoFiltro = 'all'; // all | pendiente | preparando | yaCasi | listo
let pedidosCache = [];
let loading = false;

// Utilidad para seleccionar con fallback
function $(id) {
  return document.getElementById(id);
}

function formatoHora(fechaIso) {
  try {
    const d = new Date(fechaIso);
    return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  } catch (_) {
    return '--:--';
  }
}

async function apiGet(path) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${path} -> ${res.status}`);
  return res.json();
}

async function apiPut(path, body) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`PUT ${path} -> ${res.status}`);
  return res.json();
}

async function apiDelete(path) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, { method: 'DELETE' });
  if (!res.ok) throw new Error(`DELETE ${path} -> ${res.status}`);
  return res.json().catch(() => ({}));
}

// --- actualizar estado de un pedido (PUT) ---
function actualizarEstadoPedido(idPedido, estado) {
  // devolvemos la promesa para que el caller pueda await
  return apiPut(`/pedido/${idPedido}`, { estado });
}


// Cargar todos los pedidos y renderizar
async function cargarPedidos() {
  try {
    setLoading(true);
    let pedidos = await apiGet('/pedido');
    if (!Array.isArray(pedidos)) pedidos = [];
    pedidosCache = pedidos;

    // Contadores por estado

    const counters = pedidos.reduce(
      (acc, p) => {
        const estado = String(p.estado || '').toLowerCase();
        if (estado === ESTADOS.pendiente) acc.pendientes++;
        else if (estado === ESTADOS.preparando) acc.preparando++;
        else if (estado === ESTADOS.yaCasi) acc.yaCasi++;
        else if (estado === ESTADOS.listo) acc.listos++;
        return acc;
      },
      { pendientes: 0, preparando: 0, yaCasi: 0, listos: 0 }
    );

    const setIf = (id, val) => { const el = $(id); if (el) el.textContent = val; };
    setIf('contadorPendientes', counters.pendientes);
    setIf('contadorPreparacion', counters.preparando);
    setIf('contadorYaCasi', counters.yaCasi);
    setIf('contadorListos', counters.listos);

    renderListaPedidos(aplicarFiltro(pedidos));
  } catch (err) {
    console.error('Error al cargar pedidos:', err);
    const cont = $('listaPedidos');
    if (cont) cont.innerHTML = `<div class="text-red-700 bg-red-100 p-3 rounded">No se pudieron cargar los pedidos.</div>`;
  } finally {
    setLoading(false);
  }
}


function displayEstado(e) {
  const v = String(e || '').toLowerCase();
  if (v === ESTADOS.yaCasi) return 'ya casi';
  if (v === ESTADOS.listo)  return 'listo';
  return v; // pendiente / preparando
}

function renderListaPedidos(pedidos) {
  const cont = $('listaPedidos');
  if (!cont) return;
  cont.innerHTML = '';

  if (!pedidos.length) {
    cont.innerHTML = '<div class="m-5 p-5 rounded" style="background: var(--card-bg); color: var(--text-secondary); box-shadow: var(--card-shadow);">No hay pedidos.</div>';
    return;
  }

  pedidos
    .sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0))
    .forEach((pedido) => {
      const prioridad = (pedido.prioridad || '').toLowerCase();
      const prioridadTag = prioridad
        ? `<span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
            prioridad === 'alta' ? 'bg-red-100 text-red-700'
          : prioridad === 'media' ? 'bg-yellow-100 text-yellow-700'
          : 'bg-gray-100 text-gray-700'
          }">Prioridad ${prioridad}</span>`
        : '';

      const mesa = pedido.mesa?.numero ?? '—';
      const hora = formatoHora(pedido.createdAt || pedido.creadoEn);
      const estado = String(pedido.estado || '').toLowerCase();

      const bordeEstado =
        estado === ESTADOS.listo      ? 'border-l-4 border-green-500'  :
        estado === ESTADOS.yaCasi     ? 'border-l-4 border-amber-500'  :
        estado === ESTADOS.preparando ? 'border-l-4 border-yellow-500' :
                                        'border-l-4 border-gray-300';

      const card = document.createElement('div');
      card.className = `flex justify-between items-start shadow-md p-5 rounded-lg w-full ${bordeEstado}`;
      card.setAttribute('style', 'background: var(--card-bg); color: var(--text-primary); box-shadow: var(--card-shadow);');

      const items = Array.isArray(pedido.items) ? pedido.items : [];
      const itemsHtml = items.map((it) => {
        const qty    = it.cantidad ?? 1;
        const nombre = it.menuItem?.nombre || it.nombre || 'Item';
        const s      = String(it.estado || estado);

        let badgeClass = 'bg-gray-100 text-gray-700';
        if (s === ESTADOS.listo)      badgeClass = 'bg-green-100 text-green-700';
        else if (s === ESTADOS.yaCasi) badgeClass = 'bg-amber-100 text-amber-700';
        else if (s === ESTADOS.preparando) badgeClass = 'bg-yellow-100 text-yellow-700';

        const label = s === ESTADOS.yaCasi ? 'ya casi'
                    : s === ESTADOS.listo  ? 'listo'
                    : s;

        return `
          <div class="dish-item flex items-center gap-2 py-1">
            <span class="dish-quantity inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs">${qty}</span>
            <span class="dish-name">${nombre}</span>
            <span class="dish-status inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${badgeClass}">${label}</span>
          </div>`;
      }).join('');

      // Botones: si está "listo para servir", NO se muestran
      const showButtons = estado !== ESTADOS.listo;
      const botonesHtml = !showButtons ? '' : `
        <div class="mt-4 flex gap-2 flex-wrap">
          ${estado !== ESTADOS.preparando && estado !== ESTADOS.yaCasi ? `
            <button class="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded shadow-sm transition disabled:opacity-50"
                    data-accion="prep" data-id="${pedido._id}">Preparando</button>` : ''}

          ${estado !== ESTADOS.yaCasi ? `
            <button class="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded shadow-sm transition disabled:opacity-50"
                    data-accion="yaCasi" data-id="${pedido._id}">Ya casi</button>` : ''}

          <button class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded shadow-sm transition disabled:opacity-50"
                  data-accion="listo" data-id="${pedido._id}">Listo</button>
        </div>
      `;

      card.innerHTML = `
        <div class="orden w-full">
          <div class="order-header flex gap-3 items-center flex-wrap">
            <span class="order-id font-semibold">#${pedido._id?.slice(-4) || '----'}</span>
            <span class="order-table">Mesa ${mesa}</span>
            <span class="order-time">${hora}</span>
            ${prioridadTag}
            <span class="ml-auto text-sm" style="color: var(--text-secondary);">Estado: ${displayEstado(estado)}</span>
          </div>
          <div class="dish-list mt-3 divide-y">
            ${itemsHtml || '<div style="color: var(--text-secondary);">Sin items</div>'}
          </div>
          ${botonesHtml}
        </div>
      `;

      // Delegación de eventos (solo si hay botones)
      if (showButtons) {
        card.addEventListener('click', async (e) => {
          const btn = e.target.closest('button[data-accion]');
          if (!btn) return;

          const id = btn.getAttribute('data-id');
          const accion = btn.getAttribute('data-accion');

          const nuevoEstado =
            accion === 'prep'   ? ESTADOS.preparando :
            accion === 'yaCasi' ? ESTADOS.yaCasi :
                                  ESTADOS.listo;

          try {
            // Deshabilitar todos los botones de esta card mientras se procesa
            card.querySelectorAll('button[data-accion]').forEach(b => b.disabled = true);
            await actualizarEstadoPedido(id, nuevoEstado);
            await cargarPedidos();
          } catch (err) {
            console.error('No se pudo actualizar estado:', err);
            alert('No se pudo actualizar el estado del pedido.');
            // Rehabilitar si falló
            card.querySelectorAll('button[data-accion]').forEach(b => b.disabled = false);
          }
        });
      }

      cont.appendChild(card);
    });
}

function iniciarPolling() {
  wireFilters();
  cargarPedidos();
  const interval = setInterval(cargarPedidos, 10000);
  // Limpieza al salir de la página
  window.addEventListener('beforeunload', () => clearInterval(interval));
}

// Init cuando el DOM esté listo
function setupHeader() {
  const userName = document.getElementById('userName');
  const userAvatar = document.getElementById('userAvatar');
  const userMenu = document.getElementById('userMenu');
  const userMenuBtn = document.getElementById('userMenuButton');
  const userDropdown = document.getElementById('userDropdown');
  const chevron = document.getElementById('chevron');

  const nombre = localStorage.getItem('usuarioNombre') || 'Usuario Invitado';
  if (userName) { userName.textContent = nombre; userName.classList.remove('hidden'); }
  if (userAvatar) {
    userAvatar.textContent = nombre.trim().split(/\s+/).map(p=>p[0]).slice(0,2).join('').toUpperCase();
  }

  if (userMenuBtn && userDropdown) {
    userMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      userDropdown.classList.toggle('hidden');
      const isHidden = userDropdown.classList.contains('hidden');
      userMenuBtn.setAttribute('aria-expanded', String(!isHidden));
      if (chevron) chevron.classList.toggle('rotate-180', !isHidden);
    });
    document.addEventListener('click', (e) => {
      if (userMenu && !userMenu.contains(e.target)) {
        userDropdown.classList.add('hidden');
        userMenuBtn.setAttribute('aria-expanded', 'false');
        if (chevron) chevron.classList.remove('rotate-180');
      }
    });
  }

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('usuarioNombre');
      localStorage.removeItem('usuarioId');
      sessionStorage.clear();
      window.location.href = '../login/login.html';
    });
  }
}

document.addEventListener('DOMContentLoaded', () => { setupHeader(); iniciarPolling(); });

// Helpers de UI
function setLoading(v) {
  loading = v;
  const cont = $('listaPedidos');
  if (v && cont) {
    cont.innerHTML = '<div class="m-5 p-5 rounded" style="background: var(--card-bg); color: var(--text-secondary); box-shadow: var(--card-shadow);">Cargando...</div>';
  }
}

function aplicarFiltro(pedidos) {
  if (estadoFiltro === 'all') return pedidos;
  let filtro = estadoFiltro;
  if (estadoFiltro === 'yaCasi') filtro = ESTADOS.yaCasi;
  return pedidos.filter(p => String(p.estado || '').toLowerCase() === filtro);
}

function activarBoton(id, activo) {
  const el = $(id);
  if (!el) return;
  el.classList.toggle('active', activo);
  el.setAttribute('aria-pressed', String(activo));
}

function syncFilterButtons() {
  activarBoton('filterAll', estadoFiltro === 'all');
  activarBoton('filterPendiente', estadoFiltro === ESTADOS.pendiente);
  activarBoton('filterPreparando', estadoFiltro === ESTADOS.preparando);
  activarBoton('filterYaCasi', estadoFiltro === 'yaCasi');
  activarBoton('filterListo', estadoFiltro === ESTADOS.listo);
}

function wireFilters() {
  const map = [
    ['filterAll', 'all'],
    ['filterPendiente', ESTADOS.pendiente],
    ['filterPreparando', ESTADOS.preparando],
    ['filterYaCasi', 'yaCasi'],
    ['filterListo', ESTADOS.listo]
  ];
  map.forEach(([id, val]) => {
    const btn = $(id);
    if (btn) {
      btn.addEventListener('click', () => {
        estadoFiltro = val;
        syncFilterButtons();
        renderListaPedidos(aplicarFiltro(pedidosCache));
      });
    }
  });

  const refresh = $('refreshBtn');
  if (refresh) refresh.addEventListener('click', () => cargarPedidos());

  syncFilterButtons();
}


})();

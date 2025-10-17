// Configuración básica
const API_BASE = 'http://localhost:3000';
const ESTADOS = {
  pendiente: 'pendiente',
  preparando: 'preparando',
  listo: 'listo'
};

// Estado de UI
let estadoFiltro = 'all'; // all | pendiente | preparando | listo
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
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`GET ${path} -> ${res.status}`);
  return res.json();
}

async function apiPut(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`PUT ${path} -> ${res.status}`);
  return res.json();
}

async function apiDelete(path) {
  const res = await fetch(`${API_BASE}${path}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`DELETE ${path} -> ${res.status}`);
  return res.json().catch(() => ({}));
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
        else if (estado === ESTADOS.listo) acc.listos++;
        return acc;
      },
      { pendientes: 0, preparando: 0, listos: 0 }
    );

    const setIf = (id, val) => { const el = $(id); if (el) el.textContent = val; };
    setIf('contadorPendientes', counters.pendientes);
    setIf('contadorPreparacion', counters.preparando);
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

function renderListaPedidos(pedidos) {
  const cont = $('listaPedidos');
  if (!cont) return;
  cont.innerHTML = '';

  if (!pedidos.length) {
    cont.innerHTML = '<div class="bg-white shadow m-5 p-5 rounded text-gray-600">No hay pedidos.</div>';
    return;
  }

  pedidos
    .sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0))
    .forEach((pedido) => {
      const prioridad = (pedido.prioridad || '').toLowerCase();
      const prioridadTag = prioridad
        ? `<span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
            prioridad === 'alta' ? 'bg-red-100 text-red-700' : prioridad === 'media' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
          }">Prioridad ${prioridad}</span>`
        : '';
      const mesa = pedido.mesa?.numero ?? '—';
      const hora = formatoHora(pedido.createdAt || pedido.creadoEn);
      const estado = String(pedido.estado || '').toLowerCase();
      const bordeEstado = estado === ESTADOS.listo
        ? 'border-l-4 border-green-500'
        : estado === ESTADOS.preparando
        ? 'border-l-4 border-yellow-500'
        : 'border-l-4 border-gray-300';

      const card = document.createElement('div');
      card.className = `bg-white flex justify-between items-start shadow-md p-5 rounded-lg w-full ${bordeEstado}`;

      const items = Array.isArray(pedido.items) ? pedido.items : [];
      const itemsHtml = items
        .map((it) => {
          const qty = it.cantidad ?? 1;
          const nombre = it.menuItem?.nombre || it.nombre || 'Item';
          // Mapeo de estados por item si existiera: it.estado
          const s = String(it.estado || estado);
          let badgeClass = 'bg-gray-100 text-gray-700';
          if (s === ESTADOS.listo) badgeClass = 'bg-green-100 text-green-700';
          else if (s === ESTADOS.preparando) badgeClass = 'bg-yellow-100 text-yellow-700';
          return `
            <div class=\"dish-item flex items-center gap-2 py-1\">
              <span class=\"dish-quantity inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs\">${qty}</span>
              <span class=\"dish-name\">${nombre}</span>
              <span class=\"dish-status inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${badgeClass}\">${s}</span>
            </div>`;
        })
        .join('');

      card.innerHTML = `
        <div class=\"orden w-full\">
          <div class=\"order-header flex gap-3 items-center flex-wrap\">
            <span class=\"order-id font-semibold\">#${pedido._id?.slice(-4) || '----'}</span>
            <span class=\"order-table\">Mesa ${mesa}</span>
            <span class=\"order-time\">${hora}</span>
            ${prioridadTag}
            <span class=\"ml-auto text-sm text-gray-600\">Estado: ${estado}</span>
          </div>
          <div class=\"dish-list mt-3 divide-y\">
            ${itemsHtml || '<div class=\"text-gray-500\">Sin items</div>'}
          </div>
          <div class=\"mt-4 flex gap-2 flex-wrap\">
            ${estado !== ESTADOS.preparando ? `<button class=\"px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded shadow-sm transition disabled:opacity-50\" data-accion=\"prep\" data-id=\"${pedido._id}\">Preparando</button>` : ''}
            ${estado !== ESTADOS.listo ? `<button class=\"px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded shadow-sm transition disabled:opacity-50\" data-accion=\"listo\" data-id=\"${pedido._id}\">Listo</button>` : ''}
          </div>
        </div>
      `;

      // Delegación de eventos para botones
      card.addEventListener('click', async (e) => {
        const btn = e.target.closest('button[data-accion]');
        if (!btn) return;
        const id = btn.getAttribute('data-id');
        const accion = btn.getAttribute('data-accion');
        const nuevoEstado = accion === 'prep' ? ESTADOS.preparando : ESTADOS.listo;
        try {
          btn.disabled = true;
          await actualizarEstadoPedido(id, nuevoEstado);
          if (accion !== 'prep') {
            // Si marca Listo, eliminar el pedido del backend según lo solicitado
            await eliminarPedido(id);
          }
          await cargarPedidos();
        } catch (err) {
          console.error('No se pudo actualizar estado:', err);
          alert('No se pudo actualizar el estado del pedido.');
        } finally {
          btn.disabled = false;
        }
      });

      cont.appendChild(card);
    });
}

async function actualizarEstadoPedido(idPedido, estado) {
  await apiPut(`/pedido/${idPedido}`, { estado });
}

async function eliminarPedido(idPedido) {
  await apiDelete(`/pedido/${idPedido}`);
}

function iniciarPolling() {
  wireFilters();
  cargarPedidos();
  const interval = setInterval(cargarPedidos, 10000);
  // Limpieza al salir de la página
  window.addEventListener('beforeunload', () => clearInterval(interval));
}

// Init cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', iniciarPolling);

// Helpers de UI
function setLoading(v) {
  loading = v;
  const cont = $('listaPedidos');
  if (v && cont) {
    cont.innerHTML = '<div class="m-5 p-5 bg-white rounded shadow text-gray-600">Cargando...</div>';
  }
}

function aplicarFiltro(pedidos) {
  if (estadoFiltro === 'all') return pedidos;
  return pedidos.filter(p => String(p.estado || '').toLowerCase() === estadoFiltro);
}

function activarBoton(id, activo) {
  const el = $(id);
  if (!el) return;
  el.classList.toggle('bg-blue-600', activo);
  el.classList.toggle('text-white', activo);
  el.classList.toggle('bg-white', !activo);
  el.classList.toggle('text-blue-600', !activo);
  el.classList.toggle('border-blue-600', !activo);
}

function syncFilterButtons() {
  activarBoton('filterAll', estadoFiltro === 'all');
  activarBoton('filterPendiente', estadoFiltro === ESTADOS.pendiente);
  activarBoton('filterPreparando', estadoFiltro === ESTADOS.preparando);
  activarBoton('filterListo', estadoFiltro === ESTADOS.listo);
}

function wireFilters() {
  const map = [
    ['filterAll', 'all'],
    ['filterPendiente', ESTADOS.pendiente],
    ['filterPreparando', ESTADOS.preparando],
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

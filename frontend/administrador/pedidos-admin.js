(() => {
  const API_BASE = window.API_BASE || localStorage.getItem('API_BASE') || 'http://localhost:3000';

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

const ESTADO_UI = {
  'pendiente': { label: 'Por atender', color: '#facc15' },
  'preparando': { label: 'En cocina', color: '#3b82f6' },
  'en 10 min': { label: 'Por servir', color: '#a855f7' },
  'listo para servir': { label: 'Listo', color: '#22c55e' },
  'entregado': { label: 'Entregado', color: '#94a3b8' }
};

document.addEventListener('DOMContentLoaded', () => {
    setupUserInfo();
    cargarPedidos();
  });

  function setupUserInfo() {
    const nombre = localStorage.getItem('usuarioNombre') || 'Administrador';
    const userNameEl = document.getElementById('userName');
    const userAvatarEl = document.getElementById('userAvatar');
    if (userNameEl) userNameEl.textContent = nombre;
    if (userAvatarEl) userAvatarEl.textContent = getInitials(nombre);
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

    if (btn && dd) {
      btn.addEventListener('click', (e) => { e.stopPropagation(); toggleMenu(); });
      document.addEventListener('click', (e) => { if (userMenu && !userMenu.contains(e.target)) closeMenu(); });
    }
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '../login/login.html';
      });
    }

    function toggleMenu() {
      if (!btn || !dd) return;
      const isHidden = dd.classList.contains('hidden');
      dd.classList.toggle('hidden');
      btn.setAttribute('aria-expanded', String(isHidden));
      if (chevron) chevron.classList.toggle('rotate-180', isHidden);
    }
    function closeMenu() {
      if (!btn || !dd) return;
      dd.classList.add('hidden');
      btn.setAttribute('aria-expanded', 'false');
      if (chevron) chevron.classList.remove('rotate-180');
    }
  }

  async function cargarPedidos() {
    const rol = (localStorage.getItem('usuarioRol') || '').toLowerCase();
    const idMesero = localStorage.getItem('usuarioId');

    let url;
    if (rol === 'admin') {
      url = `${API_BASE}/pedido`;
    } else {
      if (!idMesero) {
        alert('No se encontró identificación del usuario. Inicie sesión nuevamente.');
        window.location.href = '../login/login.html';
        return;
      }
      url = `${API_BASE}/pedido/mesero/${idMesero}`;
    }

    try {
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

      renderTarjetas(pedidos);
      actualizarContadores(pedidos);
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
      alert('Error al cargar los pedidos. Por favor, intente nuevamente.');
    }
  }

  function actualizarContadores(pedidos) {
    const c = { pendiente: 0, preparando: 0, 'en 10 min': 0, 'listo para servir': 0 };
    pedidos.forEach(p => { c[normalizeEstado(p.estado)] = (c[normalizeEstado(p.estado)] || 0) + 1; });
    const elPend = document.getElementById('contadorPendientes');
    const elPrep = document.getElementById('contadorPreparacion');
    const elCasi = document.getElementById('contadorYaCasi');
    const elList = document.getElementById('contadorListos');
    if (elPend) elPend.textContent = String(c.pendiente || 0);
    if (elPrep) elPrep.textContent = String(c.preparando || 0);
    if (elCasi) elCasi.textContent = String(c['en 10 min'] || 0);
    if (elList) elList.textContent = String(c['listo para servir'] || 0);
  }

  function renderTarjetas(pedidos) {
    const grid = document.getElementById('gridPedidos');
    if (!grid) return;
    grid.innerHTML = '';
    pedidos.sort((a,b) => new Date(b.createdAt||0) - new Date(a.createdAt||0));

    if (!pedidos.length) {
      grid.innerHTML = '<div class="col-span-full text-center py-6 text-sm" style="color: var(--text-secondary);">No hay pedidos registrados.</div>';
      return;
    }

    pedidos.forEach(pedido => {
      const meta = ESTADO_UI[normalizeEstado(pedido.estado)] || ESTADO_UI.pendiente;
      const card = document.createElement('article');
      card.className = 'pedido-card';
      card.style.borderColor = meta.color;
      card.style.boxShadow = `0 10px 30px ${meta.color}22`;

      const items = Array.isArray(pedido.items) ? pedido.items.map(it => `<li>${it.cantidad ?? 1} x ${it.nombre ?? it.menuItem?.nombre ?? 'Item'}</li>`).join('') : '<li>Sin items</li>';
      const hora = pedido.createdAt ? new Date(pedido.createdAt).toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit'}) : '--:--';

      card.innerHTML = `
        <div class="flex justify-between items-center">
          <div>
            <p class="text-xs" style="color: var(--text-secondary);">Mesa</p>
            <p class="text-2xl font-bold" style="color: var(--text-primary);">${pedido.mesa?.numero ?? 'N/A'}</p>
          </div>
          <div class="pedido-chip" style="color:${meta.color};">
            <span style="background:${meta.color};"></span>${meta.label}
          </div>
        </div>
        <ul class="pedido-items list-disc ml-5">${items}</ul>
        <div class="text-sm" style="color: var(--text-secondary);">${hora} · Total: <strong style="color: var(--text-primary);">${formatCurrency(pedido.total)}</strong></div>
        <div class="pedido-actions">
          <button class="btn-ver bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-500">Ver</button>
          <span class="text-sm text-gray-400">${normalizeEstado(pedido.estado)}</span>
        </div>
      `;

      card.querySelector('.btn-ver').addEventListener('click', () => mostrarDetalles(pedido));
      
      grid.appendChild(card);
    });
  }

  async function marcarEntregado(id) {
    if (!confirm('¿Marcar este pedido como entregado?')) return;
    try {
      const res = await fetch(`${API_BASE}/pedido/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'entregado' })
      });
      if (!res.ok) throw new Error('Error al actualizar');
      await res.json();
      cargarPedidos();
    } catch (err) {
      console.error('Error al marcar entregado:', err);
      alert('No se pudo actualizar el pedido.');
    }
  }

  function mostrarDetalles(pedido) {
    const modal = document.getElementById('modalDetalles');
    const detalles = document.getElementById('detallesPedido');
    if (!modal || !detalles) return;

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

  document.getElementById('cerrarModal')?.addEventListener('click', () => {
    const modal = document.getElementById('modalDetalles');
    if (modal) modal.classList.add('hidden');
  });
  document.getElementById('modalDetalles')?.addEventListener('click', (e) => {
    if (e.target.id === 'modalDetalles') e.target.classList.add('hidden');
  });
})();

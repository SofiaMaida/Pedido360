(() => {
  const API_BASE = window.API_BASE || localStorage.getItem('API_BASE') || 'http://localhost:3000';
  const ESTADOS = [
    { value: 'libre', label: 'Libre', color: '#22c55e' },
    { value: 'ocupada', label: 'Ocupada', color: '#facc15' },
    { value: 'reservada', label: 'Reservada', color: '#38bdf8' },
    { value: 'mantenimiento', label: 'Mantenimiento', color: '#94a3b8' }
  ];
  let mesas = [];

  document.addEventListener('DOMContentLoaded', () => {
    setupUserMenu();
    setupLogout();
    cargarMesas();
  });

  function setupUserMenu() {
    const userMenu = document.getElementById('userMenu');
    const btn = document.getElementById('userMenuButton');
    const userDropdown = document.getElementById('userDropdown');
    const chevron = document.getElementById('chevron');
    const userName = document.getElementById('userName');
    const userAvatar = document.getElementById('userAvatar');
    const nombre = localStorage.getItem('usuarioNombre') || 'Administrador';
    if (userName) userName.textContent = nombre;
    if (userAvatar) userAvatar.textContent = nombre.trim().split(/\s+/).map(p => p[0]).slice(0,2).join('').toUpperCase();
    if (btn && userDropdown) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        userDropdown.classList.toggle('hidden');
        const open = !userDropdown.classList.contains('hidden');
        btn.setAttribute('aria-expanded', String(open));
        if (chevron) chevron.classList.toggle('rotate-180', open);
      });
      document.addEventListener('click', (e) => {
        if (userMenu && !userMenu.contains(e.target)) {
          userDropdown.classList.add('hidden');
          btn.setAttribute('aria-expanded', 'false');
          if (chevron) chevron.classList.remove('rotate-180');
        }
      });
    }
  }

  function setupLogout() {
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

  const estadoMeta = (estado) => ESTADOS.find(e => e.value === estado) || ESTADOS[0];

  function pintarIcono(iconEl, color) {
    iconEl.style.color = color;
    iconEl.style.borderColor = color;
    iconEl.style.background = `${color}22`;
  }

  function renderCard(mesa) {
    const meta = estadoMeta(mesa.estado);
    const numero = mesa.numero ?? (mesa._id ? String(mesa._id).slice(-4) : 'N/A');
    const card = document.createElement('article');
    card.className = 'mesa-card';
    card.dataset.id = mesa._id || mesa.id || numero;

    card.innerHTML = `
      <div class="flex items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <div class="mesa-icon">${numero}</div>
          <div>
            <p class="text-xs" style="color: var(--text-secondary);">Mesa</p>
            <p class="text-lg font-semibold" style="color: var(--text-primary);">${numero}</p>
          </div>
        </div>
        <button class="btn-editar text-sm font-semibold text-indigo-600 hover:text-indigo-500">Cambiar estado</button>
      </div>
      <div class="mesa-status" style="color:${meta.color};">
        <span class="w-3 h-3 rounded-full" style="background:${meta.color};"></span>
        <span class="mesa-status-text">${meta.label}</span>
      </div>
      <div class="mesa-actions">
        <select class="mesa-select">
          ${ESTADOS.map(e => `<option value="${e.value}" ${e.value === mesa.estado ? 'selected' : ''}>${e.label}</option>`).join('')}
        </select>
        <button class="btn-guardar bg-emerald-600 text-white px-3 py-2 rounded-lg hover:bg-emerald-500">Guardar</button>
        <button class="btn-cancelar bg-gray-200 text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-300">Cancelar</button>
      </div>
    `;

    const icon = card.querySelector('.mesa-icon');
    pintarIcono(icon, meta.color);

    const statusText = card.querySelector('.mesa-status-text');
    const btnEditar = card.querySelector('.btn-editar');
    const actions = card.querySelector('.mesa-actions');
    const select = card.querySelector('select');

    btnEditar.addEventListener('click', () => actions.classList.toggle('visible'));
    card.querySelector('.btn-cancelar').addEventListener('click', () => {
      actions.classList.remove('visible');
      select.value = mesa.estado;
    });

    card.querySelector('.btn-guardar').addEventListener('click', async () => {
      const nuevo = select.value;
      try {
        const res = await fetch(`${API_BASE}/mesas/${card.dataset.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ estado: nuevo })
        });
        if (!res.ok) throw new Error('Error al actualizar mesa');
        await res.json();
        mesa.estado = nuevo;
        const metaActual = estadoMeta(nuevo);
        statusText.innerHTML = `<span class=\"w-3 h-3 rounded-full\" style=\"background:${metaActual.color};\"></span>${metaActual.label}`;
        pintarIcono(icon, metaActual.color);
        actions.classList.remove('visible');
        actualizarContadores();
      } catch (error) {
        console.error('Error al guardar mesa:', error);
        alert('No se pudo actualizar la mesa. Intente de nuevo.');
      }
    });

    return card;
  }

  function actualizarContadores() {
    const total = mesas.length;
    const libres = mesas.filter(m => m.estado === 'libre').length;
    const ocupadas = mesas.filter(m => m.estado === 'ocupada').length;
    const reservadas = mesas.filter(m => m.estado === 'reservada').length;
    const mantenimiento = mesas.filter(m => m.estado === 'mantenimiento').length;

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = String(val); };
    set('totalMesas', total);
    set('totalLibres', libres);
    set('totalOcupadas', ocupadas);
    set('totalReservadas', reservadas);
    set('totalMantenimiento', mantenimiento);

    const estado = document.getElementById('estadoMesas');
    if (estado) estado.textContent = 'Actualizado ' + new Date().toLocaleTimeString('es-AR');
  }

  async function cargarMesas() {
    const grid = document.getElementById('gridMesas');
    if (!grid) return;
    grid.innerHTML = '<div class="col-span-full text-center py-6" style="color: var(--text-secondary);">Cargando mesas...</div>';

    try {
      const res = await fetch(`${API_BASE}/mesas`);
      const data = await res.json();
      mesas = Array.isArray(data) ? data : [];

      if (!mesas.length) {
        grid.innerHTML = '<div class="col-span-full text-center py-6" style="color: var(--text-secondary);">No hay mesas registradas.</div>';
      } else {
        grid.innerHTML = '';
        mesas.forEach(m => grid.appendChild(renderCard(m)));
      }
      actualizarContadores();
    } catch (err) {
      console.error('Error al cargar mesas:', err);
      grid.innerHTML = '<div class="col-span-full text-center py-6 text-red-600">No se pudieron cargar las mesas.</div>';
    }
  }
})();

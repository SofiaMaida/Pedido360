(() => {
// ===== Identidad del usuario =====
const nombre = localStorage.getItem('usuarioNombre') || 'Mesero invitado';
const userNameEl = document.getElementById('userName');
const userAvatarEl = document.getElementById('userAvatar');
userNameEl.textContent = nombre;
userAvatarEl.textContent = nombre.trim().split(/\s+/).map(p=>p[0]).slice(0,2).join('').toUpperCase();

const userMenu = document.getElementById('userMenu');
const btn = document.getElementById('userMenuButton');
const dd = document.getElementById('userDropdown');
const chevron = document.getElementById('chevron');
btn.addEventListener('click', e => {
  e.stopPropagation();
  dd.classList.toggle('hidden');
  const expanded = dd.classList.contains('hidden') ? 'false' : 'true';
  btn.setAttribute('aria-expanded', expanded);
  chevron.classList.toggle('rotate-180', expanded === 'true');
});
document.addEventListener('click', e => { if (!userMenu.contains(e.target)) { dd.classList.add('hidden'); chevron.classList.remove('rotate-180'); } });
document.getElementById('logoutBtn')?.addEventListener('click', () => {
  localStorage.removeItem('usuarioNombre');
  localStorage.removeItem('usuarioId');
  sessionStorage.clear();
  window.location.href = '../login/login.html';
});

// ===== Mesas: consumir API en lugar de data hardcodeada =====
const API_BASE = window.API_BASE || localStorage.getItem('API_BASE') || 'http://localhost:3000';

// Ajustado a los valores del modelo en backend: ['libre','ocupada','reservada','mantenimiento']
const ESTADOS = [
  { value: 'libre',        label: 'Libre',        color: '#22c55e' },
  { value: 'ocupada',      label: 'Ocupada',      color: '#facc15' },
  { value: 'reservada',    label: 'Reservada',    color: '#38bdf8' },
  { value: 'mantenimiento',label: 'Mantenimiento', color: '#94a3b8' },
];
let mesas = []; // se llenará desde la API

// Helpers
const estadoMeta = (v) => ESTADOS.find(e => e.value === v) || ESTADOS[0];
const alphaColor = (hex, alpha='33') => `${hex}${alpha}`;

function renderCard(mesa){
  const meta = estadoMeta(mesa.estado);
  const canEdit = mesa.hasOwnProperty('editable') ? !!mesa.editable : (mesa.estado !== 'mantenimiento');
  const cardId = mesa._id || mesa.id || (mesa.numero !== undefined ? String(mesa.numero) : null) || null;
  const numero = (mesa.numero !== undefined && mesa.numero !== null && mesa.numero !== '')
    ? mesa.numero
    : (mesa._id ? String(mesa._id).slice(-6) : 'N/A');

  return `
    <div class="mesa-card" data-id="${cardId}">
      <div class="flex items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <div class="mesa-icon" style="background:${alphaColor(meta.color, '33')}; border:2px solid ${meta.color};">${numero}</div>
          <div>
            <p class="text-xs" style="color: var(--text-secondary);">Mesa</p>
            <p class="text-lg font-semibold" style="color: var(--text-primary);">${numero}</p>
          </div>
        </div>
        ${canEdit ? `<button class="btn-editar text-sm font-semibold text-indigo-600 hover:text-indigo-500">Cambiar estado</button>` : `<span class="text-sm text-gray-400">No editable</span>`}
      </div>
      <div class="mesa-status" style="color:${meta.color};">
        <span class="w-3 h-3 rounded-full mesa-status-dot" style="background:${meta.color};"></span>
        <span class="mesa-status-text">${meta.label}</span>
      </div>
      ${canEdit ? `
        <div class="mesa-actions">
          <select class="mesa-select">
            ${ESTADOS.map(e=>`<option value="${e.value}" ${e.value===mesa.estado?'selected':''}>${e.label}</option>`).join('')}
          </select>
          <button class="btn-guardar bg-emerald-600 text-white px-3 py-2 rounded-lg hover:bg-emerald-700">Guardar</button>
          <button class="btn-cancelar bg-gray-200 text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-300">Cancelar</button>
        </div>
      ` : ''}
    </div>
  `;
}

async function renderTarjetas(){
  const grid = document.getElementById('mesasGrid');
  if (!grid) return;
  grid.innerHTML = '<div class="col-span-full text-center py-6">Cargando mesas...</div>';
  
  try {
    const res = await fetch(`${API_BASE}/mesas`);
    if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
    
    const data = await res.json();
    console.log('Mesas recibidas desde API (mesero):', data);
    mesas = data;
    
    if (mesas.length === 0) {
      grid.innerHTML = '<div class="col-span-full text-center py-6">No hay mesas disponibles</div>';
    } else {
      grid.innerHTML = mesas.map(renderCard).join('');
    }
  } catch (err) {
    console.error('Error al obtener mesas desde API:', err);
    mesas = [];
    grid.innerHTML = '<div class="col-span-full text-center py-6 text-red-600">Error al cargar las mesas. Por favor, recarga la página.</div>';
  }

  // Listeners por tarjeta
  grid.querySelectorAll('.mesa-card').forEach(card => {
    const btnEditar = card.querySelector('.btn-editar');
    const actions = card.querySelector('.mesa-actions');
    const statusText = card.querySelector('.mesa-status-text');
    const dot = card.querySelector('.mesa-status-dot');
    const icon = card.querySelector('.mesa-icon');

    if (btnEditar && actions){
      btnEditar.addEventListener('click', () => {
        actions.classList.toggle('visible');
      });

      const btnGuardar = card.querySelector('.btn-guardar');
      const btnCancelar = card.querySelector('.btn-cancelar');
      const select = actions.querySelector('select');

      btnGuardar.addEventListener('click', async () => {
        const id = card.dataset.id;
        const nuevo = select.value;
        try {
          const res = await fetch(`${API_BASE}/mesas/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: nuevo })
          });
          if (!res.ok) throw new Error('Error al actualizar mesa');
          await res.json();
          const item = mesas.find(m => (m._id || m.id) == id);
          if (item) item.estado = nuevo;
          const meta = estadoMeta(nuevo);
          statusText.textContent = meta.label;
          dot.style.background = meta.color;
          icon.style.borderColor = meta.color;
          icon.style.background = alphaColor(meta.color, '33');
          actions.classList.remove('visible');
        } catch (err) {
          console.error('Error al guardar mesa:', err);
          alert('No se pudo actualizar la mesa. Intente de nuevo.');
        }
      });

      btnCancelar.addEventListener('click', () => {
        actions.classList.remove('visible');
      });
    }
  });
}

// Inicializar
document.addEventListener('DOMContentLoaded', renderTarjetas);
})();

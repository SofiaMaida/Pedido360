// ===== Identidad del usuario (opcional) =====
const mozo = JSON.parse(localStorage.getItem('mozo') || '{}');
const nombre = mozo.nombre || 'Mozo invitado';
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
document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('mozo'); sessionStorage.clear(); window.location.href = '/login/login.html';
});

// ===== Mesas: consumir API en lugar de data hardcodeada =====
const API_BASE = 'http://localhost:3000';

// Ajustado a los valores del modelo en backend: ['libre','ocupada','reservada','mantenimiento']
const ESTADOS = [
  { value: 'libre',        label: 'Libre',        cls: 'bg-green-100 text-green-700' },
  { value: 'ocupada',      label: 'Ocupada',      cls: 'bg-yellow-100 text-yellow-700' },
  { value: 'reservada',    label: 'Reservada',    cls: 'bg-blue-100 text-blue-700' },
  { value: 'mantenimiento',label: 'Mantenimiento', cls: 'bg-gray-200 text-gray-600' },
];

let mesas = [];

// Helpers
const estadoMeta = (v) => ESTADOS.find(e => e.value === v) || ESTADOS[0];

function badgeEstado(v){
  const m = estadoMeta(v);
  return `<span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${m.cls}">${m.label}</span>`;
}

function selectEstadoHTML(actual){
  return `
    <select class="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-300">
      ${ESTADOS.map(e=>`<option value="${e.value}" ${e.value===actual?'selected':''}>${e.label}</option>`).join('')}
    </select>
  `;
}

function renderFila(mesa){
  const meta = estadoMeta(mesa.estado);
  const canEdit = mesa.hasOwnProperty('editable') ? !!mesa.editable : (mesa.estado !== 'mantenimiento');
  const rowId = mesa._id || mesa.id || mesa.numero;
  const numero = mesa.numero || rowId;

  return `
    <tr data-id="${rowId}">
      <td class="px-6 py-4 font-semibold">Mesa ${numero}</td>
      <!-- Columna 2: estado (badge o editor) -->
      <td class="px-6 py-4 align-middle">
        <div class="estado-view ${canEdit ? '' : 'opacity-70'}">
          ${badgeEstado(mesa.estado)}
        </div>
        <div class="estado-edit hidden">
          ${selectEstadoHTML(mesa.estado)}
        </div>
      </td>
      <!-- Columna 3: acción -->
      <td class="px-6 py-4">
        ${
          canEdit
          ? `<button class="btn-editar bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white px-4 py-2 rounded-lg shadow hover:opacity-90 transition">Editar</button>
             <div class="mt-2 hidden gap-2 acciones-edit">
               <button class="btn-guardar bg-emerald-600 text-white px-3 py-2 rounded-lg hover:bg-emerald-700">Guardar</button>
               <button class="btn-cancelar bg-gray-200 text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-300">Cancelar</button>
             </div>`
          : `<span class="inline-flex items-center gap-2 text-gray-500">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a5 5 0 015 5v3h1a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2v-8a2 2 0 012-2h1V7a5 5 0 015-5zm3 8V7a3 3 0 00-6 0v3h6z"/></svg>
               No editable
             </span>`
        }
      </td>
    </tr>
  `;
}

async function renderTabla(){
  try {
    const res = await fetch(`${API_BASE}/mesas`);
    const data = await res.json();
    mesas = Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('Error al obtener mesas desde API:', err);
    mesas = [];
  }

  const tbody = document.getElementById('tbodyMesas');
  if (!tbody) return;
  tbody.innerHTML = mesas.map(renderFila).join('');

  // Listeners por fila
  tbody.querySelectorAll('tr').forEach(tr => {
    const btnEditar = tr.querySelector('.btn-editar');
    const accionesEdit = tr.querySelector('.acciones-edit');
    const view = tr.querySelector('.estado-view');
    const edit = tr.querySelector('.estado-edit');

    if (btnEditar){
      btnEditar.addEventListener('click', () => {
        view.classList.add('hidden');
        edit.classList.remove('hidden');
        btnEditar.classList.add('hidden');
        accionesEdit.classList.remove('hidden');
      });
    }

    const btnGuardar = tr.querySelector('.btn-guardar');
    const btnCancelar = tr.querySelector('.btn-cancelar');
    if (btnGuardar && btnCancelar){
      btnGuardar.addEventListener('click', async () => {
        const id = tr.dataset.id;
        const select = tr.querySelector('select');
        const nuevo = select.value;

        try {
          const res = await fetch(`${API_BASE}/mesas/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: nuevo })
          });
          if (!res.ok) throw new Error('Error al actualizar mesa');

          const resp = await res.json();
          const item = mesas.find(m => (m._id || m.id) == id);
          if (item) item.estado = nuevo;
          view.innerHTML = badgeEstado(nuevo);

          view.classList.remove('hidden');
          edit.classList.add('hidden');
          accionesEdit.classList.add('hidden');
          if (btnEditar) btnEditar.classList.remove('hidden');
        } catch (err) {
          console.error('Error al guardar mesa:', err);
          alert('No se pudo actualizar la mesa. Intente de nuevo.');
        }
      });

      btnCancelar.addEventListener('click', () => {
        // rollback visual: simplemente salir del modo edición
        view.classList.remove('hidden');
        edit.classList.add('hidden');
        accionesEdit.classList.add('hidden');
        if (btnEditar) btnEditar.classList.remove('hidden');
      });
    }
  });
}

// Inicializar
document.addEventListener('DOMContentLoaded', renderTabla);

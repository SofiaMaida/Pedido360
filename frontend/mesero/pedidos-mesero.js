(() => {
const API_BASE = window.API_BASE || localStorage.getItem('API_BASE') || 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', () => {
    setupUserInfo();
    cargarPedidos();
});
const ESTADO_UI = {
    'pendiente': { label: 'Por atender', color: '#facc15', bg: 'rgba(250,204,21,0.15)' },
    'preparando': { label: 'En cocina', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
    'en 10 min': { label: 'Por servir', color: '#a855f7', bg: 'rgba(168,85,247,0.15)' },
    'listo para servir': { label: 'Listo', color: '#22c55e', bg: 'rgba(34,197,94,0.15)' },
    'entregado': { label: 'Entregado', color: '#94a3b8', bg: 'rgba(148,163,184,0.15)' }
};
function setupUserInfo() {
    // Obtener información del usuario del localStorage
    const nombre = localStorage.getItem('usuarioNombre') || 'Mesero';
    const userNameEl = document.getElementById('userName');
    const userAvatarEl = document.getElementById('userAvatar');
    
    // Mostrar nombre e iniciales
    userNameEl.textContent = nombre;
    userAvatarEl.textContent = getInitials(nombre);

    // Configurar menú desplegable
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

    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMenu();
    });

    document.addEventListener('click', (e) => {
        if (!userMenu.contains(e.target)) closeMenu();
    });

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

async function cargarPedidos() {
    const idMesero = localStorage.getItem('usuarioId');
    if (!idMesero) {
        alert('No se encontró identificación del mesero. Por favor, inicie sesión nuevamente.');
        window.location.href = '../login/login.html';
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/pedido/mesero/${idMesero}`);
        const pedidos = await response.json();
        
        const grid = document.getElementById('gridPedidos');
        grid.innerHTML = '';

        let contadores = {
            pendiente: 0,
            preparando: 0,
            'en 10 min': 0,
            'listo para servir': 0
        };

        pedidos.forEach(pedido => {
            const card = crearCardPedido(pedido);
            grid.appendChild(card);

            if (contadores.hasOwnProperty(pedido.estado)) {
                contadores[pedido.estado]++;
            }
        });

        if (!pedidos.length) {
            grid.innerHTML = '<div class="col-span-full text-center text-sm py-6" style="color: var(--text-secondary);">Aún no tienes pedidos asignados.</div>';
        }
        // Actualizar contadores en la UI
        document.getElementById('contadorPendientes').textContent = contadores.pendiente;
        document.getElementById('contadorPreparacion').textContent = contadores.preparando;
        document.getElementById('contadorYaCasi').textContent = contadores['en 10 min'];
        document.getElementById('contadorListos').textContent = contadores['listo para servir'];

    } catch (error) {
        console.error('Error al cargar pedidos:', error);
        alert('Error al cargar los pedidos. Por favor, intente nuevamente.');
    }
}

function crearCardPedido(pedido){
    const meta = ESTADO_UI[pedido.estado] || ESTADO_UI['pendiente'];
    const card = document.createElement('article');
    card.className = 'pedido-card';
    card.style.borderColor = meta.color;
    card.style.boxShadow = `0 10px 30px ${meta.bg}`;

    const items = (pedido.items || []).map(item => `<li>${item.cantidad} x ${item.nombre}</li>`).join('') || '<li>Sin items</li>';
    const hora = new Date(pedido.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

    card.innerHTML = `
      <div class="flex justify-between items-center">
        <div>
          <p class="text-xs" style="color: var(--text-secondary);">Mesa</p>
          <p class="text-2xl font-bold" style="color: var(--text-primary);">${pedido.mesa?.numero || 'N/A'}</p>
        </div>
        <div class="pedido-chip" style="color:${meta.color};">
          <span style="background:${meta.color};"></span>${meta.label}
        </div>
      </div>
      <ul class="pedido-items list-disc ml-5">${items}</ul>
      <div class="text-sm" style="color: var(--text-secondary);">${hora} · Total: <strong style="color: var(--text-primary);">$${pedido.total || 0}</strong></div>
      <div class="pedido-actions">
        <button class="btn-ver bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-500">Ver</button>
        ${pedido.estado !== 'entregado' ? '<button class="btn-entregar bg-emerald-600 text-white px-4 py-2 rounded-lg shadow hover:bg-emerald-500">Entregado</button>' : '<span class="text-sm text-gray-400">Pedido entregado</span>'}
      </div>
    `;

    card.querySelector('.btn-ver').addEventListener('click', () => mostrarDetalles(pedido));
    const btnEntregar = card.querySelector('.btn-entregar');
    if (btnEntregar) {
        btnEntregar.addEventListener('click', () => marcarEntregado(pedido._id));
    }
    return card;
}

async function marcarEntregado(id){
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
        console.error(err);
        alert('No se pudo marcar como entregado');
    }
}

function mostrarDetalles(pedido) {
    const modal = document.getElementById('modalDetalles');
    const detalles = document.getElementById('detallesPedido');

    // Crear el contenido detallado
    const itemsDetalle = pedido.items.map(item => `
        <div class="flex justify-between border-b py-2">
            <div>
                <span class="font-medium">${item.nombre}</span>
                <span class="text-gray-500"> x${item.cantidad}</span>
            </div>
            <div>$${item.precioUnitario * item.cantidad}</div>
        </div>
    `).join('');

    detalles.innerHTML = `
        <div class="border-b pb-4">
            <p class="text-sm text-gray-600">ID del Pedido</p>
            <p class="font-medium">${pedido._id}</p>
        </div>
        <div class="border-b pb-4">
            <p class="text-sm text-gray-600">Mesa</p>
            <p class="font-medium">Mesa ${pedido.mesa?.numero || 'N/A'}</p>
        </div>
        <div class="border-b pb-4">
            <p class="text-sm text-gray-600">Descripción</p>
            <p class="font-medium">${pedido.descripcion || '-'}</p>
        </div>
        <div class="border-b pb-4">
            <p class="text-sm text-gray-600">Items</p>
            <div class="mt-2">
                ${itemsDetalle}
            </div>
        </div>
        <div class="border-b pb-4">
            <p class="text-sm text-gray-600">Total</p>
            <p class="font-medium">$${pedido.total}</p>
        </div>
        <div class="border-b pb-4">
            <p class="text-sm text-gray-600">Estado</p>
            <p class="font-medium">${pedido.estado}</p>
        </div>
        <div>
            <p class="text-sm text-gray-600">Fecha de creación</p>
            <p class="font-medium">${new Date(pedido.createdAt).toLocaleString()}</p>
        </div>
    `;

    modal.classList.remove('hidden');
}

// Configurar cierre del modal
document.getElementById('cerrarModal')?.addEventListener('click', () => {
    document.getElementById('modalDetalles').classList.add('hidden');
});

// Cerrar modal al hacer clic fuera
document.getElementById('modalDetalles')?.addEventListener('click', (e) => {
    if (e.target.id === 'modalDetalles') {
        e.target.classList.add('hidden');
    }
});

})();


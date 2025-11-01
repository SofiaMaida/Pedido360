(() => {
const API_BASE = window.API_BASE || localStorage.getItem('API_BASE') || 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', () => {
    setupUserInfo();
    cargarPedidos();
});
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
        
        const tbody = document.getElementById('tablaPedidos');
        tbody.innerHTML = '';

        let contadores = {
            pendiente: 0,
            preparando: 0,
            'en 10 min': 0,
            'listo para servir': 0
        };

        pedidos.forEach(pedido => {
            const fila = document.createElement('tr');
            fila.className = 'hover:bg-gray-50 cursor-pointer';
            
            // Formatear los items para mostrar
            const itemsResumen = pedido.items.map(item => 
                `${item.cantidad}x ${item.nombre}`
            ).join(', ');

            fila.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${pedido._id}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Mesa ${pedido.mesa?.numero || 'N/A'}</td>
                <td class="px-6 py-4 text-sm text-gray-900">${pedido.descripcion || '-'}</td>
                <td class="px-6 py-4 text-sm text-gray-900">${itemsResumen || 'Sin items'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$${pedido.total || 0}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoColor(pedido.estado)}">
                        ${pedido.estado}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${new Date(pedido.createdAt).toLocaleString()}
                </td>
            `;

            // Actualizar contadores
            if (contadores.hasOwnProperty(pedido.estado)) {
                contadores[pedido.estado]++;
            }

            // Agregar evento para mostrar detalles
            fila.addEventListener('click', () => mostrarDetalles(pedido));
            tbody.appendChild(fila);
        });

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

function getEstadoColor(estado) {
    const colores = {
        'pendiente': 'bg-yellow-100 text-yellow-800',
        'preparando': 'bg-blue-100 text-blue-800',
        'en 10 min': 'bg-purple-100 text-purple-800',
        'listo para servir': 'bg-green-100 text-green-800',
        'entregado': 'bg-gray-100 text-gray-800'
    };
    return colores[estado] || 'bg-gray-100 text-gray-800';
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


document.addEventListener('DOMContentLoaded', () => {
    setupUserMenu();
    cargarEstadisticas();
    setupCerrarSesion();
});

// Base de la API según entorno
const API_BASE =
  location.hostname === 'localhost' || location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:3000'
    : 'https://api.pedido360.com.ar';

function setupUserMenu() {
    const userMenu = document.getElementById('userMenu');
    const userMenuBtn = document.getElementById('userMenuButton');
    const userDropdown = document.getElementById('userDropdown');
    const userName = document.getElementById('userName');
    const userAvatar = document.getElementById('userAvatar');

    // Mostrar nombre desde localStorage
    const nombre = localStorage.getItem('usuarioNombre') || 'Usuario Invitado';
    if (userName) {
        userName.textContent = nombre;
        userName.classList.remove('hidden');
    }
    if (userAvatar) {
        userAvatar.textContent = nombre.trim().split(/\s+/).map(p=>p[0]).slice(0,2).join('').toUpperCase();
    }

    if (userMenuBtn && userDropdown) {
        userMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle('hidden');
            const isHidden = userDropdown.classList.contains('hidden');
            userMenuBtn.setAttribute('aria-expanded', String(!isHidden));
        });

        document.addEventListener('click', (e) => {
            if (userMenu && !userMenu.contains(e.target)) {
                userDropdown.classList.add('hidden');
                userMenuBtn.setAttribute('aria-expanded', 'false');
            }
        });
    }
}

async function cargarEstadisticas() {
    try {
        // Cargar número de miembros
        const resMiembros = await fetch(`${API_BASE}/usuarios`);
        const miembros = await resMiembros.json();
        document.getElementById('totalMiembros').textContent = miembros.length;

        // Cargar pedidos de hoy (no hay endpoint por fecha -> filtramos cliente)
        const resPedidos = await fetch(`${API_BASE}/pedido`);
        let pedidos = await resPedidos.json();
        if (!Array.isArray(pedidos)) pedidos = [];
        const hoyLocal = new Date();
        const esMismoDia = (f) => {
          const d = new Date(f);
          return d.getFullYear() === hoyLocal.getFullYear() &&
                 d.getMonth() === hoyLocal.getMonth() &&
                 d.getDate() === hoyLocal.getDate();
        };
        const pedidosHoy = pedidos.filter(p => p.createdAt && esMismoDia(p.createdAt));
        document.getElementById('totalPedidos').textContent = pedidosHoy.length;

        // Cargar mesas ocupadas
        const resMesas = await fetch(`${API_BASE}/mesas/estado/ocupada`);
        const mesas = await resMesas.json();
        document.getElementById('mesasActivas').textContent = mesas.length;
    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
    }
}

function setupCerrarSesion() {
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

// Actualizar estadísticas cada minuto
setInterval(cargarEstadisticas, 60000);

document.addEventListener('DOMContentLoaded', () => {
    setupUserMenu();
    cargarEstadisticas();
    setupCerrarSesion();
});

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
        const resMiembros = await fetch('http://localhost:3000/usuarios');
        const miembros = await resMiembros.json();
        document.getElementById('totalMiembros').textContent = miembros.length;

        // Cargar pedidos de hoy
        const hoy = new Date().toISOString().split('T')[0];
        const resPedidos = await fetch(`http://localhost:3000/pedido/fecha/${hoy}`);
        const pedidos = await resPedidos.json();
        document.getElementById('totalPedidos').textContent = pedidos.length;

        // Cargar mesas activas
        const resMesas = await fetch('http://localhost:3000/mesas/activas');
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
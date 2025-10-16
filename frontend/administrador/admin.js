document.addEventListener('DOMContentLoaded', () => {
    setupUserMenu();
    cargarEstadisticas();
    setupCerrarSesion();
});

function setupUserMenu() {
    const userMenuBtn = document.getElementById('userMenuBtn');
    if (userMenuBtn) {
        userMenuBtn.addEventListener('click', () => {
            // Implementar menú desplegable si es necesario
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
    const btnCerrarSesion = document.getElementById('cerrarSesion');
    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = '../login/login.html';
        });
    }
}

// Actualizar estadísticas cada minuto
setInterval(cargarEstadisticas, 60000);
const idMesero = localStorage.getItem('usuarioId');
console.log("ID del mesero recuperado:", idMesero);

fetch(`http://localhost:3000/pedido/mesero/${idMesero}`)
  .then(res => res.json())
  .then(pedidos => {
    console.log('Pedidos del mesero:', pedidos); 
    const tbody = document.getElementById('cuerpoTablaPedidos');
    tbody.innerHTML = '';

    let pendientes = 0;
    let preparacion = 0;
    let yaCasi = 0;
    let listos = 0;

    pedidos.forEach((pedido, index) => {
      const fila = document.createElement('tr');
      fila.innerHTML = `
        <td class="px-6 py-3">${index + 1}</td>
        <td class="px-6 py-3">${pedido.mesa.numero || 'N/A'}</td>
        <td class="px-6 py-3">${pedido.estado}</td>
        <td class="px-6 py-3">${new Date(pedido.creadoEn).toLocaleString()}</td>
      `;
      tbody.appendChild(fila);

      // Contar según estado
      switch (pedido.estado) {
        case 'pendiente':
          pendientes++; break;
        case 'preparando':
          preparacion++; break;
        case 'en 10 min':
          yaCasi++; break;
        case 'listo para servir':
          listos++; break;
      }
    });

    document.getElementById('contadorPendientes').textContent = pendientes;
    document.getElementById('contadorPreparacion').textContent = preparacion;
    document.getElementById('contadorYaCasi').textContent = yaCasi;
    document.getElementById('contadorListos').textContent = listos;
  })
  .catch(error => console.error('Error al cargar pedidos:', error));
  // 1) Obtener nombre del mozo (usa lo que tengas guardado)
  // Ejemplo: { nombre: "Brenda Lopez" } almacenado en localStorage como "mozo"
  const mozo = JSON.parse(localStorage.getItem('mozo') || '{}');
  const nombre = mozo.nombre || 'Mozo invitado';

  // 2) Setear nombre e iniciales
  const userNameEl = document.getElementById('userName');
  const userAvatarEl = document.getElementById('userAvatar');
  userNameEl.textContent = nombre;

  function getInitials(n) {
    return n.trim().split(/\s+/).map(p => p[0]).slice(0,2).join('').toUpperCase();
  }
  userAvatarEl.textContent = getInitials(nombre);

  // 3) Toggle del dropdown + accesibilidad
  const userMenu = document.getElementById('userMenu');
  const btn = document.getElementById('userMenuButton');
  const dd = document.getElementById('userDropdown');
  const chevron = document.getElementById('chevron');

  function closeMenu() {
    dd.classList.add('hidden');
    btn.setAttribute('aria-expanded', 'false');
    chevron.classList.remove('rotate-180');
  }
  function toggleMenu() {
    const isHidden = dd.classList.contains('hidden');
    dd.classList.toggle('hidden');
    btn.setAttribute('aria-expanded', String(isHidden));
    chevron.classList.toggle('rotate-180', isHidden);
  }

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  // Cerrar al hacer click fuera
  document.addEventListener('click', (e) => {
    if (!userMenu.contains(e.target)) closeMenu();
  });

  // 4) Cerrar sesión
  document.getElementById('logoutBtn').addEventListener('click', () => {
    // Limpia lo que uses para sesión
    localStorage.removeItem('mozo');
    sessionStorage.clear();
    // Redirige al login
    window.location.href = '/login/login.html';
  });
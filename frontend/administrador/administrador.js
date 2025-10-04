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
    window.location.href = './login.html';
  });
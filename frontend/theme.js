// Sistema de tema claro/oscuro para Pedido360

(function() {
  'use strict';

  // Obtener el tema guardado o usar 'light' por defecto
  function getTheme() {
    const savedTheme = localStorage.getItem('theme');
    // Si no hay tema guardado, forzar modo claro por defecto
    if (!savedTheme) {
      localStorage.setItem('theme', 'light');
      return 'light';
    }
    return savedTheme;
  }

  // Guardar el tema
  function setTheme(theme) {
    localStorage.setItem('theme', theme);
    applyTheme(theme);
  }

  // Aplicar el tema al documento
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      themeToggle.innerHTML = theme === 'dark' ? '☀️' : '🌙';
      themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
    }
  }

  // Inicializar el tema al cargar la página
  function initTheme() {
    const theme = getTheme();
    applyTheme(theme);
  }

  // Toggle del tema
  function toggleTheme() {
    const currentTheme = getTheme();
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  }

  // Inicializar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTheme);
  } else {
    initTheme();
  }

  // Exponer función globalmente
  window.toggleTheme = toggleTheme;
  window.getTheme = getTheme;
  window.setTheme = setTheme;
})();


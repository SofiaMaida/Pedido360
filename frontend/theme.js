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
    // Ajustar la altura del header para posicionar el toggle
    updateHeaderHeight();
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
  
  // Medir altura del header y exponer como variable CSS
  function updateHeaderHeight() {
    try {
      const header = document.querySelector('header');
      if (header) {
        const rect = header.getBoundingClientRect();
        document.documentElement.style.setProperty('--header-height', rect.height + 'px');
      } else {
        document.documentElement.style.setProperty('--header-height', '0px');
      }
    } catch (e) {
      // No bloquear en caso de error
    }
  }

  // Actualizar en eventos relevantes
  window.addEventListener('resize', updateHeaderHeight);
  window.addEventListener('load', updateHeaderHeight);
})();


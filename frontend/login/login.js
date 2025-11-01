const API_BASE = window.API_BASE || localStorage.getItem('API_BASE') || 'http://localhost:3000';

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault(); // Evita que recargue la página

  const correo = document.getElementById('email').value;
  const contra = document.getElementById('password').value;

  try {
    const response = await fetch(`${API_BASE}/usuarios/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo, contra })
    });

    const data = await response.json();
    console.log("Respuesta completa del login:", data);

    // Si el backend devuelve usuario en cualquier caso, usarlo
    const usuario = data && data.usuario ? data.usuario : null;
    if (!usuario || !usuario._id) {
      const mensaje = data && data.mensaje ? data.mensaje : 'Error: el servidor no devolvió datos válidos del usuario';
      alert(mensaje);
      return;
    }

    // Guardar datos en localStorage
    localStorage.setItem('usuarioId', usuario._id);
    localStorage.setItem('usuarioNombre', usuario.nombre || '');
    localStorage.setItem('usuarioRol', usuario.rol || '');

    const rol = (usuario.rol || '').toString().trim().toLowerCase();
    console.log('Rol normalizado:', rol);

    if (rol.includes('mesero')) {
      window.location.href = '../mesero/mesero.html';
    } else if (rol.includes('admin')) {
      window.location.href = '../administrador/admin.html';
    } else if (rol.includes('cocinero')) {
      window.location.href = '../cocina/cocina.html';
    } else {
      alert(`¡Login exitoso! Rol detectado: ${usuario.rol}`);
      window.location.href = '../inicio.html';
    }
  } catch (error) {
    alert('Error de conexión con el servidor');
    console.error(error);
  }
});

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault(); // Evita que recargue la página

  const correo = document.getElementById('email').value;
  const contra = document.getElementById('password').value;

  try {
    const response = await fetch('http://localhost:3000/usuarios/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo, contra })
    });

    const data = await response.json();
console.log("Respuesta completa del login:", data);

    if (response.ok) {
      const usuario = data.usuario;
       if (!usuario || !usuario._id) {
    alert('Error: el servidor no devolvió datos válidos del usuario');
    return;
  }
  localStorage.setItem('usuarioId', usuario._id);
  localStorage.setItem('usuarioNombre', usuario.nombre);
  localStorage.setItem('usuarioRol', usuario.rol);
 
     if (usuario.rol === 'mesero') {

        window.location.href = '../mesero/mesero.html';
      } else {
        alert(`¡Login exitoso! Rol detectado: ${usuario.rol}`);
        // Podés redirigir a otra página según el rol:
        // if (data.rol === 'admin') window.location.href = 'admin.html';
        // if (data.rol === 'cocinero') window.location.href = 'cocinero.html';
      }
    } else {
      alert(data.mensaje);
    }
  } catch (error) {
    alert('Error de conexión con el servidor');
    console.error(error);
  }
});

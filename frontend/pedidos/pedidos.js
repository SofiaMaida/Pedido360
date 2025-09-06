document.addEventListener('DOMContentLoaded', async () => {
  const idMesero = localStorage.getItem('usuarioId');
  const selectMesa = document.getElementById('mesa');
  const formPedido = document.getElementById('formPedido');
  const modal = document.getElementById('modalPedido');
  const detallePedido = document.getElementById('detallePedido');
  const cerrarModalBtn = document.getElementById('cerrarModal');

  // Cargar mesas disponibles
  try {
    const resMesas = await fetch('http://localhost:3000/mesas');
    const mesas = await resMesas.json();
    console.log("Respuesta mesas:", mesas);
    mesas.forEach(mesa => {
      const option = document.createElement('option');
      option.value = mesa._id;
      option.textContent = `Mesa ${mesa.numero}`;
      selectMesa.appendChild(option);
    });
  } catch (err) {
    console.error('Error al cargar mesas:', err);
  }

  // Manejar envío del formulario
  formPedido.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nuevoPedido = {
      mesa: selectMesa.value,
      descripcion: document.getElementById('descripcion').value,
      mesero: idMesero
    };

    try {
      const res = await fetch('http://localhost:3000/pedido', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoPedido)
      });

      if (res.ok) {
        const { pedido } = await res.json(); // Obtenemos solo el objeto `pedido`

        // Mostrar detalles del pedido
        const detalle = `
          <p><strong>Mesa:</strong> ${pedido.mesa.numero}</p>
          <p><strong>Descripción:</strong> ${pedido.descripcion}</p>
          <p><strong>Estado:</strong> ${pedido.estado}</p>
          <p><strong>Creado en:</strong> ${new Date(pedido.creadoEn).toLocaleString()}</p>
          <div class="mt-4">
    <p><strong>QR de seguimiento:</strong></p>
    <img src="${pedido.qrCode}" alt="QR Pedido" class="w-32 h-32 mt-2 mx-auto"/>
  </div>
        `;
        detallePedido.innerHTML = detalle;


        // Mostrar modal y limpiar formulario
        modal.classList.remove('hidden');
        formPedido.reset();
      } else {
        throw new Error('Error al crear pedido');
      }
    } catch (err) {
      console.error(err);
      alert('No se pudo crear el pedido.');
    }
  });

  // Cerrar modal con botón
  cerrarModalBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
  });

  // Cerrar modal al click fuera del contenido
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.add('hidden');
    }
  });
});

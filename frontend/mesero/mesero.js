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

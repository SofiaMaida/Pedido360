// Obtener el ID de la URL como: seguimiento.html?id=IDPEDIDO
const params = new URLSearchParams(window.location.search);
const pedidoId = params.get("id");
const infoBox = document.getElementById("pedido-info");
console.log('ID: ', pedidoId);
// Validamos el ID
if (!pedidoId) {
  document.getElementById("timeline").innerHTML = `
    <p style="color:red;">ID de pedido no proporcionado en la URL.</p>
  `;
} else {
  fetch(`http://127.0.0.1:3000/pedido/${pedidoId}/estado`)
    .then(res => {
      if (!res.ok){ 
         console.error("Código de estado:", res.status);
    return res.text().then(text => {
      console.error("Respuesta:", text);
      throw new Error("No se pudo obtener el estado");
    })
    }
    return res.json();
   })
    .then(data => {
      infoBox.innerHTML = `
        <div class="space-y-4">
          <div class="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
            <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span class="text-white text-sm font-bold">#</span>
            </div>
            <div>
              <p class="text-sm text-gray-600">ID del pedido</p>
              <p class="font-semibold text-gray-800">${data.id}</p>
            </div>
          </div>
          
          <div class="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
            <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <span class="text-white text-sm">📊</span>
            </div>
            <div>
              <p class="text-sm text-gray-600">Estado actual</p>
              <p class="font-semibold text-gray-800">${data.estadoActual}</p>
            </div>
          </div>
          
          <div class="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
            <div class="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
              <span class="text-white text-sm">📅</span>
            </div>
            <div>
              <p class="text-sm text-gray-600">Fecha de creación</p>
              <p class="font-semibold text-gray-800">${new Date(data.creadoEn).toLocaleString('es-AR')}</p>
            </div>
          </div>
          
          <div class="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
            <div class="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
              <span class="text-white text-sm">📝</span>
            </div>
            <div>
              <p class="text-sm text-gray-600">Descripción</p>
              <p class="font-semibold text-gray-800">${data.descripcion}</p>
            </div>
          </div>
          
          <div class="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
            <div class="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <span class="text-white text-sm">💰</span>
            </div>
            <div>
              <p class="text-sm text-gray-600">Total</p>
              <p class="font-semibold text-gray-800">$${data.total}</p>
            </div>
          </div>
        </div>
      `;

      const { estadoActual, horas } = data;

      const estados = [
        { clave: "pendiente", texto: "Recibido" },
        { clave: "preparando", texto: "En preparación" },
        { clave: "en 10 min", texto: "En 10 min" },
        { clave: "listo para servir", texto: "Listo para servir" }
      ];

      const timeline = document.getElementById("timeline");
      timeline.innerHTML = ""; // limpiamos por si ya había algo

      let estadoEncontrado = false;

      estados.forEach(estado => {
        const paso = document.createElement("div");
        paso.classList.add("step");

        if (estado.clave === estadoActual) {
          paso.classList.add("current");
          estadoEncontrado = true;
        } else if (!estadoEncontrado) {
          paso.classList.add("completed");
        }

        paso.innerHTML = `
          <div class="label">${estado.texto}</div>
          <div class="time">${horas[estado.clave] || "--"}</div>
        `;

        timeline.appendChild(paso);
      });
    })
    .catch(err => {
      console.error(err);
      document.getElementById("timeline").innerHTML = `
        <p style="color:red;">Error al cargar el estado del pedido.</p>
      `;
    });
}

// --- Parámetros y nodos ---
const params = new URLSearchParams(window.location.search);
const pedidoId = params.get("id");

const searchPanel = document.getElementById("search-panel");
const resultPanel = document.getElementById("result-panel");
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const infoBox = document.getElementById("pedido-info");
const timeline = document.getElementById("timeline");
const resultMessage = document.getElementById("result-message");

// Detecta entorno (opcional)
const API_BASE =
  location.hostname === "localhost" || location.hostname === "127.0.0.1"
    ? "http://127.0.0.1:3000"
    : "https://api.pedido360.com.ar";

// Estados posibles en el timeline
const estados = [
  { clave: "pendiente", texto: "Recibido" },
  { clave: "preparando", texto: "En preparación" },
  { clave: "ya casi", texto: "¡Ya casi!" },
  { clave: "en 10 min", texto: "En 10 min" },
  { clave: "listo para servir", texto: "Listo para servir" }
];

// --- Utils de UI ---
const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const showSearch = (visible) => {
  if (!searchPanel) return;
  searchPanel.classList.toggle("hidden", !visible);
};

const showResult = (visible) => {
  if (!resultPanel) return;
  resultPanel.classList.toggle("hidden", !visible);
};

const renderLoading = () => {
  resultMessage.innerHTML = `<p class="text-gray-600">Buscando pedido...</p>`;
  infoBox.innerHTML = `
    <div class="space-y-4 animate-pulse">
      <div class="h-4 bg-gray-200 rounded w-3/4"></div>
      <div class="h-4 bg-gray-200 rounded w-1/2"></div>
      <div class="h-4 bg-gray-200 rounded w-2/3"></div>
      <div class="h-4 bg-gray-200 rounded w-1/2"></div>
      <div class="h-4 bg-gray-200 rounded w-1/3"></div>
    </div>
  `;
  timeline.innerHTML = `<div class="pl-6 text-sm text-gray-500">Preparando información...</div>`;
};

const renderError = (message) => {
  const safeMessage = escapeHtml(message || "Error al cargar el estado del pedido.");
  resultMessage.innerHTML = `<p class="text-red-600 font-semibold">${safeMessage}</p>`;
  infoBox.innerHTML = `
    <div class="col-span-full text-center text-sm text-gray-500">
      No se encontró información para el pedido solicitado.
    </div>
  `;
  timeline.innerHTML = "";
  showResult(true); // nos aseguramos de que el panel de resultado esté visible para el mensaje
};

const formatCurrency = (value) => {
  const number = Number(value);
  if (Number.isNaN(number)) return value ?? "-";
  return number.toLocaleString("es-AR", { style: "currency", currency: "ARS" });
};

const renderPedido = (data) => {
  const horas = data.horas || {};
  const safeId = escapeHtml(data.id ?? "-");
  const safeEstado = escapeHtml(data.estadoActual ?? "Sin estado");
  const safeDescripcion = escapeHtml(data.descripcion ?? "-");

  resultMessage.innerHTML = `<p class="text-green-600 font-semibold">Pedido encontrado correctamente.</p>`;

  infoBox.innerHTML = `
    <div class="space-y-4">
      <div class="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
        <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
          <span class="text-white text-sm font-bold">#</span>
        </div>
        <div>
          <p class="text-sm text-gray-600">ID del pedido</p>
          <p class="font-semibold text-gray-800">${safeId}</p>
        </div>
      </div>

      <div class="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
        <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
          <span class="text-white text-sm">📊</span>
        </div>
        <div>
          <p class="text-sm text-gray-600">Estado actual</p>
          <p class="font-semibold text-gray-800">${safeEstado}</p>
        </div>
      </div>

      <div class="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
        <div class="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
          <span class="text-white text-sm">📅</span>
        </div>
        <div>
          <p class="text-sm text-gray-600">Fecha de creación</p>
          <p class="font-semibold text-gray-800">${data.creadoEn ? new Date(data.creadoEn).toLocaleString("es-AR") : "-"}</p>
        </div>
      </div>

      <div class="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
        <div class="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
          <span class="text-white text-sm">📝</span>
        </div>
        <div>
          <p class="text-sm text-gray-600">Descripción</p>
          <p class="font-semibold text-gray-800">${safeDescripcion}</p>
        </div>
      </div>

      <div class="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
        <div class="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
          <span class="text-white text-sm">💰</span>
        </div>
        <div>
          <p class="text-sm text-gray-600">Total</p>
          <p class="font-semibold text-gray-800">${formatCurrency(data.total)}</p>
        </div>
      </div>
    </div>
  `;

  const timelineContent = estados.map((estado) => {
    let circleClass = "border-gray-300 bg-white";
    let labelClass = "text-gray-600";

    const mapHoraKey = {
      'pendiente': 'recibido',
      'preparando': 'en_preparacion',
      'listo para servir': 'listo',
      'entregado': 'entregado',
      'ya casi': null,
      'en 10 min': null
    };

    const key = mapHoraKey[estado.clave] ?? estado.clave;
    const hora = key ? horas[key] : undefined;
    const safeHora = hora ? escapeHtml(hora) : "";

    let timeLabel = '—';
    if (estado.clave === data.estadoActual) {
      timeLabel = hora ? `Registrado a las ${safeHora}` : 'En curso';
    } else if (hora && hora !== '--') {
      timeLabel = `Registrado a las ${safeHora}`;
    }

    if (estado.clave === data.estadoActual) {
      circleClass = "border-purple-500 bg-purple-500";
      labelClass = "text-purple-600 font-semibold";
    } else if (hora && hora !== '--') {
      circleClass = "border-green-500 bg-green-500";
      labelClass = "text-green-600 font-semibold";
    }

    return `
      <div class="relative pl-10">
        <div class="absolute -left-[29px] top-2 w-5 h-5 rounded-full border-4 ${circleClass}"></div>
        <div class="bg-gray-50 rounded-lg p-3 shadow-sm">
          <p class="text-sm ${labelClass}">${estado.texto}</p>
          <p class="text-xs text-gray-500 mt-1">${timeLabel}</p>
        </div>
      </div>
    `;
  }).join("");

  timeline.innerHTML = timelineContent;
  showResult(true); // aseguramos que se vea el panel de resultados
};

// --- Data ---
const fetchPedido = (id) => {
  if (!id) return;

  // Mostrar ambos paneles: buscador + resultados (con loading)
  showSearch(true);
  showResult(true);
  searchInput && (searchInput.value = id);
  renderLoading();

  fetch(`${API_BASE}/pedido/${encodeURIComponent(id)}/estado`)
    .then((res) => {
      if (!res.ok) {
        return res.text().then((text) => {
          const errorMessage = text || "No se pudo obtener el estado del pedido.";
          throw new Error(errorMessage);
        });
      }
      return res.json();
    })
    .then((data) => {
      renderPedido(data);
    })
    .catch((error) => {
      console.error(error);
      renderError(error.message);
    });
};

// --- Estado inicial ---
if (pedidoId) {
  // Hay ?id=... => mostrar ambos paneles y buscar
  fetchPedido(pedidoId);
} else {
  // No hay id => mostrar buscador, ocultar resultados
  showSearch(true);
  showResult(false);
}

// --- Búsqueda por formulario ---
if (searchForm) {
  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const id = (searchInput?.value || "").trim();

    if (!id) {
      renderError("Ingresa un ID de pedido válido.");
      showResult(true);
      return;
    }

    // Actualiza la URL (sin recargar)
    const url = new URL(window.location.href);
    url.searchParams.set("id", id);
    window.history.replaceState({}, "", url);

    fetchPedido(id);
  });
}

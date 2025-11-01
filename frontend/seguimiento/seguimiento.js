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
const API_BASE = window.API_BASE || localStorage.getItem('API_BASE') || 'http://localhost:3000';

// Corrige posibles caracteres corruptos en títulos/encabezados
try {
  const h1 = document.querySelector('header h1');
  if (h1) h1.textContent = 'Pedido360';
  const h2Search = document.querySelector('#search-panel h2');
  if (h2Search) h2Search.textContent = 'Buscar pedido';
  const infoTitle = document.querySelector('#result-panel h2');
  if (infoTitle) infoTitle.textContent = 'Información del Pedido';
  const tlTitle = document.querySelector('#result-panel h3');
  if (tlTitle) tlTitle.textContent = 'Estado actual del pedido';
} catch (_) { /* noop */ }

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

  // Corrige íconos rotos insertando SVGs estables (evita problemas de encoding)
  try {
    const setIcon = (selector, svg) => {
      const el = infoBox.querySelector(selector);
      if (el) el.innerHTML = svg;
    };
    setIcon(
      '.bg-green-500.rounded-full',
      '<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1" /></svg>'
    );
    setIcon(
      '.bg-purple-500.rounded-full',
      '<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>'
    );
    setIcon(
      '.bg-orange-500.rounded-full',
      '<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h10M7 11h10M7 15h6m-6 4h10a2 2 0 002-2V7a2 2 0 00-2-2h-7l-5 5v9a2 2 0 002 2z" /></svg>'
    );
    setIcon(
      '.bg-red-500.rounded-full',
      '<span class="text-white text-lg font-bold">$</span>'
    );
  } catch (_) { /* noop */ }
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
      <div class="w-full flex items-center space-x-3 p-4 lg:p-5 bg-blue-50 rounded-lg">
        <div class="w-10 h-10 lg:w-12 lg:h-12 bg-blue-500 rounded-full flex items-center justify-center">
          <span class="text-white text-sm font-bold">#</span>
        </div>
        <div>
          <p class="text-sm text-gray-600">ID del pedido</p>
          <p class="font-semibold text-gray-800">${safeId}</p>
        </div>
      </div>

      <div class="w-full flex items-center space-x-3 p-4 lg:p-5 bg-green-50 rounded-lg">
        <div class="w-10 h-10 lg:w-12 lg:h-12 bg-green-500 rounded-full flex items-center justify-center">
          <span class="text-white text-sm">📊</span>
        </div>
        <div>
          <p class="text-sm text-gray-600">Estado actual</p>
          <p class="font-semibold text-gray-800">${safeEstado}</p>
        </div>
      </div>

      <div class="w-full flex items-center space-x-3 p-4 lg:p-5 bg-purple-50 rounded-lg">
        <div class="w-10 h-10 lg:w-12 lg:h-12 bg-purple-500 rounded-full flex items-center justify-center">
          <span class="text-white text-sm">📅</span>
        </div>
        <div>
          <p class="text-sm text-gray-600">Fecha de creación</p>
          <p class="font-semibold text-gray-800">${data.creadoEn ? new Date(data.creadoEn).toLocaleString("es-AR") : "-"}</p>
        </div>
      </div>

      <div class="w-full flex items-center space-x-3 p-4 lg:p-5 bg-orange-50 rounded-lg">
        <div class="w-10 h-10 lg:w-12 lg:h-12 bg-orange-500 rounded-full flex items-center justify-center">
          <span class="text-white text-sm">📝</span>
        </div>
        <div>
          <p class="text-sm text-gray-600">Descripción</p>
          <p class="font-semibold text-gray-800">${safeDescripcion}</p>
        </div>
      </div>

      <div class="w-full flex items-center space-x-3 p-4 lg:p-5 bg-red-50 rounded-lg">
        <div class="w-10 h-10 lg:w-12 lg:h-12 bg-red-500 rounded-full flex items-center justify-center">
          <span class="text-white text-sm">💰</span>
        </div>
        <div>
          <p class="text-sm text-gray-600">Total</p>
          <p class="font-semibold text-gray-800">${formatCurrency(data.total)}</p>
        </div>
      </div>

      <div class="w-full flex items-start space-x-3 p-4 lg:p-5 bg-yellow-50 rounded-lg">
        <div class="w-10 h-10 lg:w-12 lg:h-12 bg-yellow-500 rounded-full flex items-center justify-center">
          <span class="text-white text-sm">ID</span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm text-gray-600">Items</p>
          <div class="font-semibold text-gray-800 space-y-1">
            ${(Array.isArray(data.items) && data.items.length) ? data.items.map(it => {
              const n = escapeHtml(it?.nombre ?? "");
              const c = Number(it?.cantidad) || 1;
              const p = Number(it?.precioUnitario) || 0;
              const subtotal = formatCurrency(c * p);
              return `<div class=\"flex justify-between gap-3\"><span class=\"truncate\">${n} x ${c}</span><span class=\"text-gray-600\">${subtotal}</span></div>`;
            }).join("") : '<span class="text-gray-500 font-normal">Sin items</span>'}
          </div>
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
    let safeHora = "";
    if (hora && hora !== '--') {
      const d = new Date(hora);
      if (!Number.isNaN(d.getTime())) {
        safeHora = d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
      } else {
        safeHora = escapeHtml(String(hora));
      }
    }

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
        <div class="bg-gray-50 rounded-lg p-4 lg:p-5 shadow-sm">
          <p class="text-sm ${labelClass}">${estado.texto}</p>
          <p class="text-xs text-gray-500 mt-1">${timeLabel}</p>
        </div>
      </div>
    `;
  }).join("");

  // Recalcula el timeline para que el estado actual coincida con
  // la nomenclatura del frontend y se pinten los estados anteriores.
  try {
    const orden = estados.map(e => e.clave);
    const actual = (data.estadoActual && String(data.estadoActual).toLowerCase() === 'listo') ? 'listo para servir' : data.estadoActual;
    const idxActual = orden.indexOf(actual);
    const mapHoraKey = {
      'pendiente': 'recibido',
      'preparando': 'en_preparacion',
      'en 10 min': 'en_10_min',
      'listo para servir': 'listo',
      'entregado': 'entregado',
      'ya casi': null
    };
    const timelineContent2 = estados.map((estado) => {
      const idx = orden.indexOf(estado.clave);
      const key = mapHoraKey[estado.clave] ?? estado.clave;
      const hora = key ? horas[key] : undefined;
      let safeHora = "";
      if (hora && hora !== '--') {
        const d = new Date(hora);
        if (!Number.isNaN(d.getTime())) {
          safeHora = d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
        } else {
          safeHora = escapeHtml(String(hora));
        }
      }
      const esActual = estado.clave === actual;
      const esPrevio = idx > -1 && idxActual > -1 && idx < idxActual;
      let circleClass = "border-gray-300 bg-white";
      let labelClass = "text-gray-600";
      let timeLabel = '—';
      if (esActual) {
        circleClass = "border-purple-500 bg-purple-500";
        labelClass = "text-purple-600 font-semibold";
        timeLabel = safeHora ? `Registrado a las ${safeHora}` : 'En curso';
      } else if (esPrevio) {
        circleClass = "border-green-500 bg-green-500";
        labelClass = "text-green-600 font-semibold";
        timeLabel = safeHora ? `Registrado a las ${safeHora}` : 'Completado';
      } else if (safeHora) {
        circleClass = "border-green-500 bg-green-500";
        labelClass = "text-green-600 font-semibold";
        timeLabel = `Registrado a las ${safeHora}`;
      }
      return `
        <div class="relative pl-10">
          <div class="absolute -left-[29px] top-2 w-5 h-5 rounded-full border-4 ${circleClass}"></div>
          <div class="bg-gray-50 rounded-lg p-4 lg:p-5 shadow-sm">
            <p class="text-sm ${labelClass}">${estado.texto}</p>
            <p class="text-xs text-gray-500 mt-1">${timeLabel}</p>
          </div>
        </div>
      `;
    }).join("");
    timeline.innerHTML = timelineContent2;
  } catch (_) {
    timeline.innerHTML = timelineContent;
  }
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

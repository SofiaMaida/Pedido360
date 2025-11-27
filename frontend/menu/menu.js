const API = window.API_BASE || localStorage.getItem('API_BASE') || 'http://localhost:3000';

const CATEGORY_STYLES = {
  "Entradas": { icon: "🥗", gradient: "from-green-400 to-green-600" },
  "Platos principales": { icon: "🍝", gradient: "from-blue-400 to-blue-600" },
  "Bebidas": { icon: "🥤", gradient: "from-yellow-400 to-orange-500" },
  "Postres": { icon: "🍰", gradient: "from-pink-400 to-purple-500" }
};

const DEFAULT_GRADIENTS = [
  "from-indigo-400 to-purple-600",
  "from-emerald-400 to-teal-500",
  "from-rose-400 to-red-500",
  "from-sky-400 to-blue-600"
];

const FALLBACK_ICON = "🍽️";
const PLACEHOLDER_IMAGE = "https://dummyimage.com/600x400/e5e7eb/1f2937&text=Sin+imagen";

const $filters = document.getElementById("filters");
const $menu = document.getElementById("menu");

let currentCategoryId = null;
let activeButton = null;
let gradientCursor = 0;

init();

async function init() {
  await renderFilters();
  await loadItems();
  injectAnimations();
}

async function renderFilters() {
  clearFilters();

  const categories = await fetchJSON(`${API}/menu/categories`).catch(() => []);

  const allButton = createFilterButton("Ver todo", { icon: "👀", gradient: "from-gray-500 to-gray-700" });
  allButton.addEventListener("click", async () => {
    setActive(allButton);
    currentCategoryId = null;
    await loadItems();
  });
  $filters.appendChild(allButton);
  setActive(allButton);

  categories.forEach(category => {
    const style = getStyleForCategory(category.nombre);
    const button = createFilterButton(category.nombre, style);
    button.addEventListener("click", async () => {
      setActive(button);
      currentCategoryId = category._id;
      await loadItems();
    });
    $filters.appendChild(button);
  });
}

function clearFilters() {
  $filters.innerHTML = "";
  activeButton = null;
}

function getStyleForCategory(name) {
  if (CATEGORY_STYLES[name]) {
    return CATEGORY_STYLES[name];
  }
  const gradient = DEFAULT_GRADIENTS[gradientCursor % DEFAULT_GRADIENTS.length];
  gradientCursor += 1;
  return { icon: FALLBACK_ICON, gradient };
}

function createFilterButton(label, style) {
  const button = document.createElement("button");
  button.className = `btn-filter bg-gradient-to-r ${style.gradient} text-white px-6 py-3 rounded-full font-semibold shadow-lg flex items-center gap-2`;
  button.innerHTML = `<span>${style.icon || FALLBACK_ICON}</span><span>${escapeHtml(label)}</span>`;
  return button;
}

function setActive(button) {
  if (activeButton === button) return;
  if (activeButton) {
    activeButton.classList.remove("active");
  }
  button.classList.add("active");
  activeButton = button;
}

async function loadItems() {
  const url = currentCategoryId
    ? `${API}/menu/items?categoryId=${encodeURIComponent(currentCategoryId)}`
    : `${API}/menu/items`;

  const payload = await fetchJSON(url).catch(() => ({ items: [] }));
  const items = Array.isArray(payload.items) ? payload.items : [];
  renderItems(items);
}

function renderItems(items) {
  $menu.innerHTML = "";

  if (!items.length) {
    $menu.innerHTML = `<div class="col-span-full text-center text-lg" style="color: var(--text-secondary);">Sin resultados</div>`;
    return;
  }

  items.forEach((item, index) => {
    const card = document.createElement("article");
    card.className = "card-hover rounded-2xl shadow-lg overflow-hidden border flex flex-col";
    card.style.animationDelay = `${index * 0.1}s`;
    card.style.background = "var(--card-bg)";
    card.style.borderColor = "var(--border-color)";

    const imageUrl = item.imageUrl || PLACEHOLDER_IMAGE;
    const rawDescription = typeof item.descripcion === 'string' && item.descripcion.trim() ? item.descripcion : "Sin descripción";
    const description = escapeHtml(rawDescription);
    const price = formatPrice(item.precio);
    const priceSpeech = formatPriceSpeech(item.precio);
    const rawName = typeof item.nombre === 'string' ? item.nombre : '';
    const speakText = `${rawName}. ${rawDescription}. Precio: ${priceSpeech} pesos`.replace(/\s+/g, ' ').trim();

    const imageWrapper = document.createElement('div');
    imageWrapper.className = 'relative overflow-hidden';
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = escapeHtml(item.nombre || 'Plato');
    img.className = 'w-full h-56 object-cover transition-transform duration-300 hover:scale-110';
    imageWrapper.appendChild(img);

    const body = document.createElement('div');
    body.className = 'p-6 flex flex-col flex-1';

    const infoRow = document.createElement('div');
    infoRow.className = 'flex items-start gap-2 mb-4';

    const textBox = document.createElement('div');
    textBox.className = 'flex-1';

    const titleEl = document.createElement('h3');
    titleEl.className = 'text-xl font-bold mb-1';
    titleEl.style.color = 'var(--text-primary)';
    titleEl.textContent = rawName;

    const descEl = document.createElement('p');
    descEl.className = 'text-sm h-12 overflow-hidden';
    descEl.style.color = 'var(--text-secondary)';
    descEl.innerHTML = description;

    textBox.appendChild(titleEl);
    textBox.appendChild(descEl);

    const speakBtn = document.createElement('button');
    speakBtn.type = 'button';
    speakBtn.className = 'inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-700 hover:bg-purple-200 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-1';
    speakBtn.setAttribute('aria-label', 'Escuchar información del plato');
    speakBtn.setAttribute('title', 'Escuchar información del plato');
    speakBtn.textContent = '🔊';
    speakBtn.addEventListener('click', () => {
      if (window.ttsSpeakText) window.ttsSpeakText(speakText);
    });

    infoRow.appendChild(textBox);
    infoRow.appendChild(speakBtn);

    const priceRow = document.createElement('div');
    priceRow.className = 'flex justify-end items-center gap-2 mt-auto';
    const priceEl = document.createElement('span');
    priceEl.className = 'text-2xl font-bold';
    priceEl.style.color = 'var(--accent)';
    priceEl.textContent = price;
    priceRow.appendChild(priceEl);

    body.appendChild(infoRow);
    body.appendChild(priceRow);

    card.appendChild(imageWrapper);
    card.appendChild(body);

    $menu.appendChild(card);
  });
}


async function fetchJSON(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return await response.json();
}

function formatPrice(value) {
  const number = Number(value);
  if (Number.isNaN(number)) return "";
  return number.toLocaleString("es-AR", { style: "currency", currency: "ARS" });
}

function formatPriceSpeech(value) {
  const number = Number(value);
  if (Number.isNaN(number)) return "0";
  return number.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function escapeHtml(text) {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function injectAnimations() {
  const style = document.createElement("style");
  style.textContent = `
    .card-hover {
      animation: fadeInUp 0.45s ease-out forwards;
      opacity: 0;
    }
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;
  document.head.appendChild(style);
}

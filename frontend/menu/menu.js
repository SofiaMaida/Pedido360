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
    $menu.innerHTML = `<div class="col-span-full text-center text-gray-500 text-lg">Sin resultados</div>`;
    return;
  }

  items.forEach((item, index) => {
    const card = document.createElement("article");
    card.className = "card-hover bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 flex flex-col";
    card.style.animationDelay = `${index * 0.1}s`;

    const imageUrl = item.imageUrl || PLACEHOLDER_IMAGE;
    const description = item.descripcion ? escapeHtml(item.descripcion) : "Sin descripción";
    const price = formatPrice(item.precio);

    card.innerHTML = `
      <div class="relative overflow-hidden">
        <img src="${imageUrl}" alt="${escapeHtml(item.nombre)}" class="w-full h-56 object-cover transition-transform duration-300 hover:scale-110" />
      </div>
      <div class="p-6 flex flex-col flex-1">
        <h3 class="text-xl font-bold text-gray-800 mb-2">${escapeHtml(item.nombre)}</h3>
        <p class="text-gray-600 text-sm mb-4 h-12 overflow-hidden">${description}</p>
        <div class="flex justify-end items-center mt-auto">
          <span class="text-2xl font-bold text-indigo-600">${price}</span>
        </div>
      </div>
    `;

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
  return `$${number.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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

const API = "http://127.0.0.1:3000";

// Emojis opcionales por nombre de categoría
const ICONS = {
  "Entradas": "🥗",
  "Platos principales": "🍽️",
  "Bebidas": "🥤",
  "Postres": "🍰"
};

let currentCategoryId = null;

const $filters = document.getElementById("filters");
const $menu    = document.getElementById("menu");

init();

async function init(){
  await renderFilters();
  await loadItems(); // “Ver todo” por defecto
}

// ----- UI: Filtros -----
async function renderFilters(){
  const cats = await fetchJSON(`${API}/menu/categories`).catch(()=>[]);

  // Botón “Ver todo”
  const allBtn = makePill("Ver todo", "👀");
  allBtn.classList.add("pill--active");
  allBtn.addEventListener("click", async () => {
    setActive(allBtn);
    currentCategoryId = null;
    await loadItems();
  });
  $filters.appendChild(allBtn);

  // Botones por categoría desde la API
  cats.forEach(cat => {
    const emoji = ICONS[cat.nombre] || "📁";
    const btn = makePill(cat.nombre, emoji);
    btn.addEventListener("click", async () => {
      setActive(btn);
      currentCategoryId = cat._id;
      await loadItems();
    });
    $filters.appendChild(btn);
  });
}

function makePill(text, emoji){
  const b = document.createElement("button");
  b.className = "pill";
  b.textContent = ` ${text}`;
  const span = document.createElement("span");
  span.textContent = emoji;
  b.prepend(span);
  return b;
}

function setActive(btn){
  [...$filters.querySelectorAll(".pill")].forEach(p=>p.classList.remove("pill--active"));
  btn.classList.add("pill--active");
}

// ----- Data: Items -----
async function loadItems(){
  const url = currentCategoryId
    ? `${API}/menu/items?categoryId=${encodeURIComponent(currentCategoryId)}`
    : `${API}/menu/items`;

  const data = await fetchJSON(url).catch(() => ({ items: [] }));
  renderItems(Array.isArray(data.items) ? data.items : []);
}

function renderItems(items){
  $menu.innerHTML = "";
  if (!items.length){
    $menu.innerHTML = `<div class="empty">Sin resultados</div>`;
    return;
  }
  items.forEach(it=>{
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <img class="card__img" src="${it.imageUrl}" alt="${escapeHtml(it.nombre)}">
      <div class="card__body">
        <h3 class="card__title">${escapeHtml(it.nombre)}</h3>
        <p class="card__desc">${escapeHtml(it.descripcion || "—")}</p>
        <div class="card__price">$${Number(it.precio).toLocaleString("es-AR")}</div>
      </div>
    `;
    $menu.appendChild(card);
  });
}

// ----- helpers -----
async function fetchJSON(url, opts){
  const r = await fetch(url, opts);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return await r.json();
}
function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

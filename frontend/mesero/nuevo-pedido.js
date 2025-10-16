const API_BASE = 'http://localhost:3000';

const selectors = {
  mesa: document.getElementById('mesa'),
  mesero: document.getElementById('mesero'),
  descripcion: document.getElementById('descripcion'),
  form: document.getElementById('formNuevoPedido'),
  itemsContainer: document.getElementById('itemsContainer'),
  resumen: document.getElementById('resumenItems'),
  total: document.getElementById('totalPedido'),
  alert: document.getElementById('alertContainer'),
  error: document.getElementById('errorContainer'),
  addItemBtn: document.getElementById('agregarItemBtn'),
  userMenu: document.getElementById('userMenu'),
  userMenuBtn: document.getElementById('userMenuButton'),
  userDropdown: document.getElementById('userDropdown'),
  userChevron: document.getElementById('chevron'),
  userName: document.getElementById('userName'),
  userAvatar: document.getElementById('userAvatar'),
  logoutBtn: document.getElementById('logoutBtn')
};

const state = {
  menuItems: [],
  mesas: [],
  meseros: [],
  defaultMeseroId: null,
};

function showMessage(container, message) {
  if (!container) return;
  if (!message) {
    container.classList.add('hidden');
    container.textContent = '';
    return;
  }
  container.textContent = message;
  container.classList.remove('hidden');
}

function createOption(value, label) {
  const option = document.createElement('option');
  option.value = value;
  option.textContent = label;
  return option;
}

function formatCurrency(value) {
  return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value || 0);
}

function createItemRow(defaults = {}) {
  const row = document.createElement('div');
  row.className = 'bg-purple-50/60 border border-purple-100 rounded-2xl px-4 py-4 grid gap-3 md:grid-cols-[minmax(0,1.4fr)_120px_120px_120px_40px] items-start';
  row.dataset.itemRow = 'true';

  // Label para el campo de producto (Nombre)
  const nombreCol = document.createElement('div');
  nombreCol.className = 'flex flex-col gap-2';
  const nombreLabel = document.createElement('span');
  nombreLabel.className = 'text-xs font-semibold text-purple-800';
  nombreLabel.textContent = 'Nombre';
  nombreCol.appendChild(nombreLabel);

  // Select de producto
  const select = document.createElement('select');
  select.className = 'rounded-xl border border-purple-100 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400';
  select.dataset.field = 'menuItemId';
  select.appendChild(createOption('', 'Selecciona del menú o personaliza'));
  state.menuItems.forEach(item => {
    const option = createOption(item._id, `${item.nombre} — ${formatCurrency(item.precio)}`);
    option.dataset.nombre = item.nombre;
    option.dataset.precio = item.precio;
    select.appendChild(option);
  });
  const customOption = createOption('custom', '➕ Producto personalizado');
  select.appendChild(customOption);
  nombreCol.appendChild(select);

  // Input de nombre
  const nombreInput = document.createElement('input');
  nombreInput.type = 'text';
  nombreInput.placeholder = 'Ej. Lomo saltado';
  nombreInput.required = true;
  nombreInput.className = 'rounded-xl border border-purple-100 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 mt-2';
  nombreInput.dataset.field = 'nombre';
  nombreCol.appendChild(nombreInput);

  const qtyWrapper = document.createElement('div');
  qtyWrapper.className = 'flex flex-col gap-2';
  const qtyLabel = document.createElement('span');
  qtyLabel.className = 'text-xs font-semibold text-purple-800';
  qtyLabel.textContent = 'Cantidad';
  const qtyInput = document.createElement('input');
  qtyInput.type = 'number';
  qtyInput.min = '1';
  qtyInput.value = defaults.cantidad || 1;
  qtyInput.required = true;
  qtyInput.className = 'rounded-xl border border-purple-100 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400';
  qtyInput.dataset.field = 'cantidad';
  qtyWrapper.append(qtyLabel, qtyInput);

  const priceWrapper = document.createElement('div');
  priceWrapper.className = 'flex flex-col gap-2';
  const priceLabel = document.createElement('span');
  priceLabel.className = 'text-xs font-semibold text-purple-800';
  priceLabel.textContent = 'Precio unitario (S/)';
  const priceInput = document.createElement('input');
  priceInput.type = 'number';
  priceInput.min = '0';
  priceInput.step = '0.01';
  priceInput.required = true;
  priceInput.value = defaults.precioUnitario ?? '';
  priceInput.className = 'rounded-xl border border-purple-100 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400';
  priceInput.dataset.field = 'precioUnitario';
  priceWrapper.append(priceLabel, priceInput);

  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'mt-6 inline-flex items-center justify-center rounded-full bg-white border border-purple-200 text-purple-500 hover:text-purple-700 hover:border-purple-400 h-10 w-10 transition';
  deleteBtn.innerHTML = '<span aria-hidden="true">&times;</span>';

  // Orden: nombreCol (label+select+input), cantidad, precio, eliminar
  row.append(nombreCol, qtyWrapper, priceWrapper, deleteBtn);

  if (defaults.menuItemId) {
    select.value = defaults.menuItemId;
  }
  if (defaults.nombre) {
    nombreInput.value = defaults.nombre;
  }
  if (defaults.precioUnitario) {
    priceInput.value = defaults.precioUnitario;
  }

  select.addEventListener('change', () => {
    const option = select.selectedOptions[0];
    if (!option) return;

    if (option.value === 'custom' || option.value === '') {
      nombreInput.value = '';
      priceInput.value = '';
      nombreInput.removeAttribute('readonly');
      priceInput.removeAttribute('readonly');
      nombreInput.focus();
      return updateSummary();
    }

    const { nombre, precio } = option.dataset;
    nombreInput.value = nombre || '';
    priceInput.value = precio || '';
    nombreInput.setAttribute('readonly', 'true');
    priceInput.setAttribute('readonly', 'true');
    updateSummary();
  });

  [nombreInput, qtyInput, priceInput].forEach(input => {
    input.addEventListener('input', () => {
      if (input === nombreInput && !nombreInput.hasAttribute('readonly')) {
        select.value = 'custom';
      }
      updateSummary();
    });
  });

  deleteBtn.addEventListener('click', () => {
    row.remove();
    updateSummary();
  });

  selectors.itemsContainer.appendChild(row);
  updateSummary();
}

function updateSummary() {
  const rows = Array.from(selectors.itemsContainer.querySelectorAll('[data-item-row]'));
  if (!rows.length) {
    selectors.resumen.innerHTML = '<li class="text-gray-400">Agrega productos para ver el resumen aquí.</li>';
    selectors.total.textContent = formatCurrency(0);
    return;
  }

  let total = 0;
  const fragment = document.createDocumentFragment();
  rows.forEach((row, index) => {
    const nombre = row.querySelector('[data-field="nombre"]').value.trim();
    const cantidad = Number(row.querySelector('[data-field="cantidad"]').value) || 0;
    const precioUnitario = Number(row.querySelector('[data-field="precioUnitario"]').value) || 0;
    const subtotal = cantidad * precioUnitario;
    total += subtotal;

    const li = document.createElement('li');
    li.className = 'flex items-center justify-between gap-3 bg-purple-50/60 border border-purple-100 rounded-2xl px-4 py-3';
    li.innerHTML = `
      <div class="flex flex-col">
        <span class="font-semibold text-purple-900">${nombre || 'Producto sin nombre'}</span>
        <span class="text-xs text-gray-500">${cantidad} × ${formatCurrency(precioUnitario)}</span>
      </div>
      <span class="text-sm font-semibold text-purple-700">${formatCurrency(subtotal)}</span>
    `;
    li.setAttribute('data-index', String(index));
    fragment.appendChild(li);
  });

  selectors.resumen.innerHTML = '';
  selectors.resumen.appendChild(fragment);
  selectors.total.textContent = formatCurrency(total);
}

async function fetchJSON(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

async function loadMesas() {
  try {
    const mesas = await fetchJSON(`${API_BASE}/mesas`);
    state.mesas = Array.isArray(mesas) ? mesas : [];
    state.mesas
      .sort((a, b) => (a.numero || 0) - (b.numero || 0))
      .forEach(mesa => {
        const option = createOption(mesa._id, `Mesa ${mesa.numero || ''}`.trim());
        selectors.mesa.appendChild(option);
      });
  } catch (error) {
    console.error('Error al cargar mesas', error);
    showMessage(selectors.error, 'No fue posible cargar las mesas disponibles.');
  }
}
async function loadMeseros() {
  try {
    const usuarios = await fetchJSON(`${API_BASE}/usuarios`);
    state.meseros = (Array.isArray(usuarios) ? usuarios : []).filter(u => u.rol === 'mesero');
    state.meseros
      .sort((a, b) => a.nombre.localeCompare(b.nombre))
      .forEach(mesero => {
        const option = createOption(mesero._id, mesero.nombre);
        selectors.mesero.appendChild(option);
      });

    const storedMesero = localStorage.getItem('usuarioId');
    if (storedMesero && state.meseros.some(m => m._id === storedMesero)) {
      state.defaultMeseroId = storedMesero;
      selectors.mesero.value = storedMesero;
    }
  } catch (error) {
    console.error('Error al cargar meseros', error);
    showMessage(selectors.error, 'No fue posible cargar el listado de meseros.');
  }
}
async function loadMenuItems() {
  try {
    const { items } = await fetchJSON(`${API_BASE}/menu/items?limit=200`);
    state.menuItems = Array.isArray(items) ? items : [];
  } catch (error) {
    console.error('Error al cargar el menú', error);
    state.menuItems = [];
  }
}

function gatherItems() {
  const rows = Array.from(selectors.itemsContainer.querySelectorAll('[data-item-row]'));
  return rows.map(row => {
    const select = row.querySelector('[data-field="menuItemId"]');
    const nombreInput = row.querySelector('[data-field="nombre"]');
    const qtyInput = row.querySelector('[data-field="cantidad"]');
    const priceInput = row.querySelector('[data-field="precioUnitario"]');

    const menuItem = select.value && select.value !== 'custom' ? select.value : undefined;
    const nombre = nombreInput.value.trim();
    const cantidad = Number(qtyInput.value);
    const precioUnitario = Number(priceInput.value);

    return { menuItem, nombre, cantidad, precioUnitario };
  });
}

function validateForm() {
  const items = gatherItems();
  if (!items.length) {
    showMessage(selectors.error, 'Agrega al menos un producto al pedido.');
    return false;
  }

  const invalidItem = items.find(item => !item.nombre || !Number.isFinite(item.cantidad) || item.cantidad <= 0 || !Number.isFinite(item.precioUnitario) || item.precioUnitario <= 0);
  if (invalidItem) {
    showMessage(selectors.error, 'Verifica el nombre, cantidad y precio de cada producto.');
    return false;
  }

  if (!selectors.mesa.value) {
    showMessage(selectors.error, 'Selecciona una mesa para el pedido.');
    return false;
  }

  if (!selectors.mesero.value) {
    showMessage(selectors.error, 'Selecciona el mesero responsable.');
    return false;
  }

  showMessage(selectors.error, '');
  return true;
}

async function submitForm(event) {
  event.preventDefault();
  if (!validateForm()) return;

  const items = gatherItems().map(item => {
    const payload = {
      nombre: item.nombre,
      cantidad: item.cantidad,
      precioUnitario: item.precioUnitario
    };
    if (item.menuItem) {
      payload.menuItem = item.menuItem;
    }
    return payload;
  });

  const nuevoPedido = {
    mesa: selectors.mesa.value,
    mesero: selectors.mesero.value,
    descripcion: selectors.descripcion.value.trim(),
    items
  };

  try {
    const response = await fetch(`${API_BASE}/pedido`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevoPedido)
    });

    if (!response.ok) {
      throw new Error('No fue posible guardar el pedido');
    }

    showMessage(selectors.alert, '¡Pedido registrado correctamente!');
    setTimeout(() => showMessage(selectors.alert, ''), 4000);
    selectors.form.reset();
    selectors.mesa.selectedIndex = 0;
    if (state.defaultMeseroId) {
      selectors.mesero.value = state.defaultMeseroId;
    } else {
      selectors.mesero.selectedIndex = 0;
    }
    selectors.itemsContainer.innerHTML = '';
    createItemRow();
    updateSummary();
  } catch (error) {
    console.error('Error al crear pedido', error);
    showMessage(selectors.error, 'Ocurrió un problema al guardar el pedido. Inténtalo nuevamente.');
  }
}

function setupUserMenu() {
  if (!selectors.userMenu || !selectors.userMenuBtn) return;

  // USAR usuarioNombre del localStorage
  const nombre = localStorage.getItem('usuarioNombre') || 'Usuario Invitado';
  selectors.userName.textContent = nombre;
  selectors.userAvatar.textContent = nombre
    .trim()
    .split(/\s+/)
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'UI';

  function closeMenu() {
    selectors.userDropdown.classList.add('hidden');
    selectors.userMenuBtn.setAttribute('aria-expanded', 'false');
    selectors.userChevron.classList.remove('rotate-180');
  }

  selectors.userMenuBtn.addEventListener('click', event => {
    event.stopPropagation();
    const isHidden = selectors.userDropdown.classList.contains('hidden');
    selectors.userDropdown.classList.toggle('hidden');
    selectors.userMenuBtn.setAttribute('aria-expanded', String(isHidden));
    selectors.userChevron.classList.toggle('rotate-180', isHidden);
  });

  document.addEventListener('click', event => {
    if (!selectors.userMenu.contains(event.target)) {
      closeMenu();
    }
  });

  selectors.logoutBtn?.addEventListener('click', () => {
    localStorage.removeItem('usuarioNombre');
    localStorage.removeItem('usuarioId');
    sessionStorage.clear();
    window.location.href = '../login/login.html';
  });
}

async function init() {
  setupUserMenu();
  await Promise.all([loadMenuItems(), loadMesas(), loadMeseros()]);
  createItemRow();
}

selectors.addItemBtn?.addEventListener('click', () => createItemRow());
selectors.form?.addEventListener('submit', submitForm);

document.addEventListener('DOMContentLoaded', init);
// ============ Estado ============
const API = '/api';
let token = localStorage.getItem('farmabol_token') || null;
let user = JSON.parse(localStorage.getItem('farmabol_user') || 'null');
let productosCache = [];

// ============ Helper HTTP ============
async function api(ruta, opciones = {}) {
  const res = await fetch(API + ruta, {
    ...opciones,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opciones.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Error en la solicitud');
  return data;
}

const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);
const Bs = (n) => `Bs ${Number(n).toFixed(2)}`;

// ============ Login ============
$('#form-login').addEventListener('submit', async (e) => {
  e.preventDefault();
  $('#login-error').textContent = '';
  try {
    const data = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: $('#login-username').value,
        password: $('#login-password').value,
      }),
    });
    token = data.token;
    user = data.user;
    localStorage.setItem('farmabol_token', token);
    localStorage.setItem('farmabol_user', JSON.stringify(user));
    iniciarApp();
  } catch (err) {
    $('#login-error').textContent = err.message;
  }
});

$('#btn-logout').addEventListener('click', () => {
  localStorage.clear();
  location.reload();
});

// ============ Navegación ============
$$('.nav__item').forEach((btn) => {
  btn.addEventListener('click', () => {
    $$('.nav__item').forEach((b) => b.classList.remove('is-active'));
    $$('.tab').forEach((t) => t.classList.remove('is-active'));
    btn.classList.add('is-active');
    $(`.tab[data-tab="${btn.dataset.tab}"]`).classList.add('is-active');
    if (btn.dataset.tab === 'dashboard') cargarDashboard();
    if (btn.dataset.tab === 'productos') cargarProductos();
    if (btn.dataset.tab === 'venta') cargarSelectVenta();
    if (btn.dataset.tab === 'ventas') cargarVentas();
  });
});

// ============ Arranque ============
function iniciarApp() {
  $('#vista-login').classList.add('hidden');
  $('#vista-app').classList.remove('hidden');
  $('#user-info').textContent = `${user.nombre} · ${user.rol}`;
  if (user.rol !== 'ADMIN') {
    $$('.admin-only').forEach((el) => el.classList.add('hidden'));
  }
  cargarDashboard();
}

// ============ Dashboard ============
async function cargarDashboard() {
  try {
    const [low, today, productos] = await Promise.all([
      api('/sales/dashboard/low-stock'),
      api('/sales/dashboard/today'),
      api('/products'),
    ]);
    $('#cards-resumen').innerHTML = `
      ${card('Ventas hoy', today.cantidad)}
      ${card('Ingresos hoy', Bs(today.total))}
      ${card('Productos', productos.length)}
      ${card('Stock bajo', low.length)}
    `;
    $('#stock-bajo').innerHTML = low.length
      ? low.map((p) => `
        <div class="alert">
          <span><strong>${p.nombre}</strong> <small>(${p.codigo})</small></span>
          <span class="pill pill--low">stock ${p.stock}</span>
        </div>`).join('')
      : '<p class="empty">Todo el inventario está en niveles saludables ✅</p>';
  } catch (err) {
    console.error(err);
  }
}
const card = (label, value) => `
  <div class="card"><div class="card__label">${label}</div><div class="card__value">${value}</div></div>`;

// ============ Productos ============
$('#buscar-producto').addEventListener('input', () => renderProductos());

async function cargarProductos() {
  productosCache = await api('/products');
  renderProductos();
}

function renderProductos() {
  const filtro = ($('#buscar-producto').value || '').toLowerCase();
  const lista = productosCache.filter(
    (p) =>
      p.nombre.toLowerCase().includes(filtro) ||
      p.codigo.toLowerCase().includes(filtro) ||
      (p.laboratorio || '').toLowerCase().includes(filtro)
  );
  const esAdmin = user.rol === 'ADMIN';
  $('#tabla-productos tbody').innerHTML = lista.map((p) => `
    <tr>
      <td>${p.codigo}</td>
      <td>${p.nombre}</td>
      <td>${p.laboratorio || '-'}</td>
      <td>${Bs(p.precio)}</td>
      <td><span class="pill ${p.stock < 5 ? 'pill--low' : 'pill--ok'}">${p.stock}</span></td>
      <td>${esAdmin ? `
        <button class="btn btn--ghost btn--mini" onclick="editarProducto(${p.id})">Editar</button>
        <button class="btn btn--ghost btn--mini" onclick="eliminarProducto(${p.id})">🗑</button>` : ''}</td>
    </tr>`).join('') || '<tr><td colspan="6" class="empty">Sin productos</td></tr>';
}

// ============ Modal producto ============
const modal = $('#modal-producto');
$('#btn-nuevo-producto').addEventListener('click', () => abrirModal());
$('#cancelar-producto').addEventListener('click', () => modal.classList.add('hidden'));

function abrirModal(p = null) {
  $('#prod-error').textContent = '';
  $('#modal-titulo').textContent = p ? 'Editar producto' : 'Nuevo producto';
  $('#prod-id').value = p?.id || '';
  $('#prod-codigo').value = p?.codigo || '';
  $('#prod-nombre').value = p?.nombre || '';
  $('#prod-laboratorio').value = p?.laboratorio || '';
  $('#prod-precio').value = p?.precio ?? 0;
  $('#prod-stock').value = p?.stock ?? 0;
  modal.classList.remove('hidden');
}

window.editarProducto = (id) => {
  const p = productosCache.find((x) => x.id === id);
  abrirModal(p);
};

window.eliminarProducto = async (id) => {
  if (!confirm('¿Eliminar este producto?')) return;
  await api('/products/' + id, { method: 'DELETE' });
  cargarProductos();
};

$('#form-producto').addEventListener('submit', async (e) => {
  e.preventDefault();
  $('#prod-error').textContent = '';
  const id = $('#prod-id').value;
  const body = {
    codigo: $('#prod-codigo').value,
    nombre: $('#prod-nombre').value,
    laboratorio: $('#prod-laboratorio').value,
    precio: parseFloat($('#prod-precio').value) || 0,
    stock: parseInt($('#prod-stock').value) || 0,
  };
  try {
    if (id) await api('/products/' + id, { method: 'PUT', body: JSON.stringify(body) });
    else await api('/products', { method: 'POST', body: JSON.stringify(body) });
    modal.classList.add('hidden');
    cargarProductos();
  } catch (err) {
    $('#prod-error').textContent = err.message;
  }
});

// ============ Registrar venta ============
async function cargarSelectVenta() {
  productosCache = await api('/products');
  $('#venta-producto').innerHTML = productosCache
    .map((p) => `<option value="${p.id}" data-precio="${p.precio}" data-stock="${p.stock}">${p.nombre} — ${Bs(p.precio)} (stock ${p.stock})</option>`)
    .join('');
  calcularTotal();
}

function calcularTotal() {
  const opt = $('#venta-producto').selectedOptions[0];
  const precio = opt ? Number(opt.dataset.precio) : 0;
  const cant = Number($('#venta-cantidad').value) || 0;
  $('#venta-total').textContent = Bs(precio * cant);
}
$('#venta-producto').addEventListener('change', calcularTotal);
$('#venta-cantidad').addEventListener('input', calcularTotal);

$('#form-venta').addEventListener('submit', async (e) => {
  e.preventDefault();
  $('#venta-msg').textContent = '';
  try {
    const venta = await api('/sales', {
      method: 'POST',
      body: JSON.stringify({
        product_id: Number($('#venta-producto').value),
        cantidad: Number($('#venta-cantidad').value),
      }),
    });
    $('#venta-msg').style.color = 'var(--mint)';
    $('#venta-msg').textContent = `✅ Venta #${venta.id} registrada · ${Bs(venta.total)}`;
    cargarSelectVenta();
  } catch (err) {
    $('#venta-msg').style.color = 'var(--danger)';
    $('#venta-msg').textContent = err.message;
  }
});

// ============ Historial ============
async function cargarVentas() {
  const ventas = await api('/sales');
  $('#tabla-ventas tbody').innerHTML = ventas.map((v) => `
    <tr>
      <td>#${v.id}</td>
      <td>${new Date(v.fecha + 'Z').toLocaleString('es-BO')}</td>
      <td>${v.producto}</td>
      <td>${v.cantidad}</td>
      <td>${Bs(v.precio_unit)}</td>
      <td><strong>${Bs(v.total)}</strong></td>
      <td>${v.vendedor}</td>
    </tr>`).join('') || '<tr><td colspan="7" class="empty">Sin ventas registradas</td></tr>';
}

// ============ Auto-login ============
if (token && user) iniciarApp();

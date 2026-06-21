let editingProductId = null;
let editingVentaId = null;
let productCounter = 4;
let ventaCounter = 57;

// Mostrar template
function showTemplate(templateName) {
  document.querySelectorAll('.template').forEach(t => {
    t.classList.remove('active');
  });
  document.querySelectorAll('.modal').forEach(m => {
    m.classList.remove('active');
  });

  const template = document.getElementById(`template-${templateName}`);
  if (template) {
    const content = template.innerHTML;
    const container = document.querySelector('.container');
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    tempDiv.className = 'template active';
    
    const oldTemplate = document.querySelector('.template.active');
    if (oldTemplate && oldTemplate !== template) {
      oldTemplate.remove();
    }
    
    container.appendChild(tempDiv);
    
    // Reasignar listeners después de cambiar contenido
    setTimeout(() => {
      attachFormListeners();
      attachModalClickListener();
      if (templateName === 'ventas') {
        updateVentasStats();
      }
      if (templateName === 'productos') {
        updateProductsStats();
      }
    }, 0);
  }

  document.querySelectorAll('.navbar__link').forEach(link => {
    link.classList.remove('active');
  });
  event.target.classList.add('active');
}

// Modal functions
function openModal(modalName) {
  editingProductId = null;
  editingVentaId = null;
  document.getElementById(`modal-${modalName}`).classList.add('active');
  const form = document.querySelector(`#modal-${modalName} form`);
  if (form) form.reset();
}

function closeModal(modalName) {
  document.getElementById(`modal-${modalName}`).classList.remove('active');
}

function attachModalClickListener() {
  document.querySelectorAll('.modal').forEach(modal => {
    modal.removeEventListener('click', modalClickHandler);
    modal.addEventListener('click', modalClickHandler);
  });
}

function modalClickHandler(e) {
  if (e.target === this) {
    this.classList.remove('active');
  }
}

// PRODUCTOS
function editProduct(id) {
  editingProductId = id;
  const row = document.querySelector(`#tabla-productos tr:nth-child(${id})`);
  if (row) {
    const cells = row.querySelectorAll('td');
    document.querySelector('#modal-addProduct input[placeholder*="Cuaderno"]').value = cells[0].textContent;
    document.querySelector('#modal-addProduct select').value = cells[1].textContent;
    document.querySelector('#modal-addProduct input[placeholder*="0.00"]').value = cells[2].textContent.replace('$', '');
    document.querySelector('#modal-addProduct input[placeholder*="0"]').value = cells[3].textContent;
  }
  openModal('addProduct');
}

function deleteProduct(id) {
  if (confirm('¿Está seguro de que desea quitar este producto?')) {
    const row = document.querySelector(`#tabla-productos tr:nth-child(${id})`);
    if (row) row.remove();
    updateProductsStats();
  }
}

// VENTAS
function editVenta(id) {
  editingVentaId = id;
  const row = document.querySelector(`#tabla-ventas tr:nth-child(${id})`);
  if (row) {
    const cells = row.querySelectorAll('td');
    document.querySelector('#modal-addVenta input[placeholder*="Nombre"]').value = cells[2].textContent;
    document.querySelector('#modal-addVenta select[required]').value = cells[2].textContent;
    document.querySelector('#modal-addVenta input[placeholder*="1"]').value = '1';
    document.querySelectorAll('#modal-addVenta select')[1].value = cells[4].textContent;
  }
  openModal('addVenta');
}

function deleteVenta(id) {
  if (confirm('¿Está seguro de que desea quitar esta venta?')) {
    const row = document.querySelector(`#tabla-ventas tr:nth-child(${id})`);
    if (row) row.remove();
    updateVentasStats();
  }
}

// STOCK
function updateStock(id) {
  const cantidad = prompt('Ingrese la nueva cantidad:', '');
  if (cantidad !== null && cantidad !== '') {
    const row = document.querySelector(`#tabla-stock tr:nth-child(${id})`);
    if (row) {
      row.querySelector('td:nth-child(3)').textContent = cantidad;
    }
  }
}

function deleteStock(id) {
  if (confirm('¿Está seguro de que desea quitar este producto?')) {
    const row = document.querySelector(`#tabla-stock tr:nth-child(${id})`);
    if (row) row.remove();
  }
}

// Guardar producto
function saveProduct(e) {
  e.preventDefault();
  const form = e.target;
  const inputs = form.querySelectorAll('input, select');
  const nombre = inputs[0].value;
  const categoria = inputs[1].value;
  const precio = inputs[2].value;
  const stock = inputs[3].value;

  if (editingProductId) {
    const row = document.querySelector(`#tabla-productos tr:nth-child(${editingProductId})`);
    if (row) {
      row.querySelector('td:nth-child(1)').innerHTML = `<strong>${nombre}</strong>`;
      row.querySelector('td:nth-child(2)').textContent = categoria;
      row.querySelector('td:nth-child(3)').textContent = `$${precio}`;
      row.querySelector('td:nth-child(4)').textContent = stock;
    }
  } else {
    productCounter++;
    const tbody = document.querySelector('#tabla-productos');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
      <td><strong>${nombre}</strong></td>
      <td>${categoria}</td>
      <td>$${precio}</td>
      <td>${stock}</td>
      <td><span class="badge badge--success">Disponible</span></td>
      <td>
        <div class="actions">
          <button class="action-btn" title="Editar" onclick="editProduct(${tbody.children.length + 1})">✏️</button>
          <button class="action-btn" title="Quitar" onclick="deleteProduct(${tbody.children.length + 1})">🗑️</button>
        </div>
      </td>
    `;
    tbody.appendChild(newRow);
  }
  
  form.reset();
  closeModal('addProduct');
  updateProductsStats();
}

// Guardar venta
function saveVenta(e) {
  e.preventDefault();
  const form = e.target;
  const inputs = form.querySelectorAll('input, select');
  const cliente = inputs[0].value;
  const producto = inputs[1].value;
  const cantidad = inputs[2].value;
  const pago = inputs[3].value;

  if (editingVentaId) {
    const row = document.querySelector(`#tabla-ventas tr:nth-child(${editingVentaId})`);
    if (row) {
      row.querySelector('td:nth-child(3)').textContent = cliente;
      row.querySelector('td:nth-child(4)').textContent = `$${cantidad * 1000}`;
      row.querySelector('td:nth-child(5)').textContent = pago;
    }
  } else {
    ventaCounter++;
    const tbody = document.querySelector('#tabla-ventas');
    const fecha = new Date().toLocaleDateString('es-ES');
    const hora = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
      <td><strong>VTA-000${ventaCounter}</strong></td>
      <td>${fecha} ${hora}</td>
      <td>${cliente}</td>
      <td>$${cantidad * 1000}</td>
      <td>${pago}</td>
      <td><span class="badge badge--success">Completada</span></td>
      <td>
        <div class="actions">
          <button class="action-btn" title="Editar" onclick="editVenta(${tbody.children.length + 1})">✏️</button>
          <button class="action-btn" title="Quitar" onclick="deleteVenta(${tbody.children.length + 1})">🗑️</button>
        </div>
      </td>
    `;
    tbody.appendChild(newRow);
  }

  form.reset();
  closeModal('addVenta');
  updateVentasStats();
}

// Filtrar tabla
function filterTable(tableId) {
  const table = document.getElementById(tableId);
  if (!table) return;
  
  const searchInput = document.querySelector(`#search-${tableId.split('-')[1]}`);
  const filter = searchInput ? searchInput.value.toUpperCase() : '';
  
  const rows = table.querySelectorAll('tr');
  rows.forEach(row => {
    const text = row.textContent.toUpperCase();
    row.style.display = text.includes(filter) ? '' : 'none';
  });
}

// Actualizar stats de productos
function updateProductsStats() {
  const tbody = document.querySelector('#tabla-productos');
  
  if (!tbody) return;
  
  const rows = Array.from(tbody.querySelectorAll('tr')).filter(row => row.style.display !== 'none');
  let total = rows.length;
  let activos = 0;
  let bajoStock = 0;
  let sinStock = 0;
  
  rows.forEach(row => {
    const badgeCell = row.querySelector('td:nth-child(5) .badge');
    const badgeText = badgeCell ? badgeCell.textContent : '';
    
    if (badgeText.includes('Disponible')) {
      activos++;
    } else if (badgeText.includes('Bajo')) {
      bajoStock++;
    } else if (badgeText.includes('Sin')) {
      sinStock++;
    }
  });
  
  const statTotal = document.querySelector('#stat-total');
  const statActivos = document.querySelector('#stat-activos');
  const statBajo = document.querySelector('#stat-bajo');
  const statSin = document.querySelector('#stat-sin');
  
  if (statTotal) statTotal.textContent = total;
  if (statActivos) statActivos.textContent = activos;
  if (statBajo) statBajo.textContent = bajoStock;
  if (statSin) statSin.textContent = sinStock;
}

// Actualizar stats de ventas
function updateVentasStats() {
  const tbody = document.querySelector('#tabla-ventas');
  const today = new Date().toLocaleDateString('es-ES');
  
  if (!tbody) return;
  
  const rows = Array.from(tbody.querySelectorAll('tr')).filter(row => row.style.display !== 'none');
  let totalVentas = rows.length;
  let ingresos = 0;
  let ventasHoy = 0;
  
  rows.forEach(row => {
    const fechaCell = row.querySelector('td:nth-child(2)').textContent;
    const totalCell = row.querySelector('td:nth-child(4)').textContent;
    const monto = parseFloat(totalCell.replace('$', '').replace(/\./g, ''));
    
    ingresos += monto;
    
    const fecha = fechaCell.split(' ')[0];
    if (fecha === today) {
      ventasHoy++;
    }
  });
  
  const promedio = totalVentas > 0 ? Math.floor(ingresos / totalVentas) : 0;
  
  const statVentas = document.querySelector('#stat-ventas');
  const statIngresos = document.querySelector('#stat-ingresos');
  const statHoy = document.querySelector('#stat-hoy');
  const statPromedio = document.querySelector('#stat-promedio');
  
  if (statVentas) statVentas.textContent = totalVentas;
  if (statIngresos) statIngresos.textContent = `$${ingresos.toLocaleString('es-ES')}`;
  if (statHoy) statHoy.textContent = ventasHoy;
  if (statPromedio) statPromedio.textContent = `$${promedio.toLocaleString('es-ES')}`;
}

function attachFormListeners() {
  const formProduct = document.querySelector('#form-product');
  const formVenta = document.querySelector('#form-venta');
  
  if (formProduct) {
    formProduct.removeEventListener('submit', saveProduct);
    formProduct.addEventListener('submit', saveProduct);
  }
  if (formVenta) {
    formVenta.removeEventListener('submit', saveVenta);
    formVenta.addEventListener('submit', saveVenta);
  }
}

// Mostrar template inicial
window.addEventListener('load', () => {
  showTemplate('inicio');
});

// ===== LOGIN SYSTEM =====
function handleLogin() {
  const user = document.querySelector('#loginUser').value.trim();
  const pass = document.querySelector('#loginPass').value.trim();
  const errorDiv = document.querySelector('#loginError');

  // Credenciales
  if (user === 'admin' && pass === '1234') {
    // Guardar sesi�n
    sessionStorage.setItem('loggedIn', 'true');
    sessionStorage.setItem('username', user);
    
    // Ocultar modal y mostrar sistema
    document.querySelector('#loginModal').classList.add('hidden');
    showTemplate('inicio');
  } else {
    errorDiv.classList.add('show');
  }
}

function handleLogout() {
  // Limpiar sesi�n
  sessionStorage.removeItem('loggedIn');
  sessionStorage.removeItem('username');
  
  // Mostrar login
  document.querySelector('#loginModal').classList.remove('hidden');
  document.querySelector('#loginUser').value = '';
  document.querySelector('#loginPass').value = '';
  document.querySelector('#loginError').classList.remove('show');
}

function checkLogin() {
  if (!sessionStorage.getItem('loggedIn')) {
    document.querySelector('#loginModal').classList.remove('hidden');
  } else {
    document.querySelector('#loginModal').classList.add('hidden');
  }
}

// Permitir Enter en formulario de login
document.addEventListener('DOMContentLoaded', () => {
  const loginPassInput = document.querySelector('#loginPass');
  if (loginPassInput) {
    loginPassInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleLogin();
    });
  }
});

// Verificar login al cargar
window.addEventListener('load', () => {
  checkLogin();
  if (sessionStorage.getItem('loggedIn')) {
    showTemplate('inicio');
  }
});

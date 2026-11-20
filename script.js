let editingProductId = null;
let editingVentaId = null;
let editingStockId = null;
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
  const activeLink = Array.from(document.querySelectorAll('.navbar__link'))
    .find(link => link.textContent.trim().toLocaleLowerCase('es') === templateName);
  if (activeLink) activeLink.classList.add('active');
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
  const row = document.querySelector(`#tabla-stock tr:nth-child(${id})`);
  if (!row) return;

  editingStockId = id;
  openModal('editStock');
  document.querySelector('#stock-edit-product').textContent = row.querySelector('td:nth-child(1)').textContent.trim();
  document.querySelector('#stock-edit-quantity').value = row.querySelector('td:nth-child(3)').textContent.trim();
}

function saveStock(e) {
  e.preventDefault();
  const quantity = Number(document.querySelector('#stock-edit-quantity').value);
  if (!Number.isInteger(quantity) || quantity < 0) return;

  const row = document.querySelector(`#tabla-stock tr:nth-child(${editingStockId})`);
  if (!row) return;

  const minimum = Number(row.querySelector('td:nth-child(4)').textContent);
  const badge = row.querySelector('td:nth-child(5) .badge');
  row.querySelector('td:nth-child(3)').textContent = quantity;

  if (quantity === 0) {
    badge.className = 'badge badge--danger';
    badge.textContent = 'Sin';
  } else if (quantity <= minimum) {
    badge.className = 'badge badge--warning';
    badge.textContent = 'Bajo';
  } else {
    badge.className = 'badge badge--success';
    badge.textContent = 'Disponible';
  }

  editingStockId = null;
  closeModal('editStock');
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
  const formStock = document.querySelector('#form-stock');
  
  if (formProduct) {
    formProduct.removeEventListener('submit', saveProduct);
    formProduct.addEventListener('submit', saveProduct);
  }
  if (formVenta) {
    formVenta.removeEventListener('submit', saveVenta);
    formVenta.addEventListener('submit', saveVenta);
  }
  if (formStock) {
    formStock.removeEventListener('submit', saveStock);
    formStock.addEventListener('submit', saveStock);
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

// ASISTENTE DE AYUDA
function initStockBot() {
  const panel = document.querySelector('#stock-bot-panel');
  const toggle = document.querySelector('#stock-bot-toggle');
  const close = document.querySelector('#stock-bot-close');
  const messages = document.querySelector('#stock-bot-messages');
  const form = document.querySelector('#stock-bot-form');
  const input = document.querySelector('#stock-bot-input');

  if (!panel || !toggle || !messages || !form || !input) return;

  const answers = {
    producto: 'Para agregar un artículo, entrá en Productos y elegí “Nuevo producto”. Completá nombre, categoría, precio y cantidad; luego seleccioná “Guardar”.',
    venta: 'Para registrar una operación, abrí Ventas, seleccioná “Nueva venta” y completá cliente, producto, cantidad y método de pago. Después presioná “Registrar”.',
    stock: 'En la sección Stock podés revisar las cantidades y el estado de cada artículo. “Bajo” indica que conviene reponerlo y “Sin” que no quedan unidades.',
    buscar: 'En Productos o Stock usá el campo de búsqueda para filtrar por nombre. En Productos también podés elegir una categoría.',
    acceso: 'En esta versión de demostración, el acceso de prueba es usuario “admin” y contraseña “1234”. No uses esas credenciales en un sistema publicado.',
    ayuda: 'Stock Fácil permite consultar productos, registrar ventas y controlar el inventario de un pequeño emprendimiento. Este asistente responde preguntas frecuentes y no consulta datos reales.'
  };

  function addMessage(text, sender) {
    const message = document.createElement('p');
    message.className = `stock-bot__message stock-bot__message--${sender}`;
    message.textContent = text;
    messages.appendChild(message);
    messages.scrollTop = messages.scrollHeight;
  }

  function answerQuestion(topic, question) {
    const normalized = question.toLocaleLowerCase('es')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[¿?¡!.,;:]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    let selectedTopic = topic;

    if (!selectedTopic) {
      if (/^(hola|buenas|buenos dias|buenas tardes|buenas noches)\b/.test(normalized)) {
        addMessage('¡Hola! Preguntame sobre productos, ventas, stock, búsquedas o el acceso al sistema y te respondo por acá.', 'bot');
        return;
      }
      if (/^(gracias|muchas gracias|perfecto|listo)$/.test(normalized)) {
        addMessage('¡De nada! Cuando tengas otra consulta, escribila acá.', 'bot');
        return;
      }

      if (/\b(venta|ventas|vender|cliente|pago|pagos|cobrar|operacion|transaccion)\b/.test(normalized)) selectedTopic = 'venta';
      else if (/\b(stock|inventario|cantidad|reponer|faltante|disponible)\b/.test(normalized)) selectedTopic = 'stock';
      else if (/\b(buscar|busqueda|filtro|filtrar|categoria|encontrar)\b/.test(normalized)) selectedTopic = 'buscar';
      else if (/\b(login|acceso|usuario|contrasena|ingresar|clave)\b/.test(normalized)) selectedTopic = 'acceso';
      else if (/\b(producto|productos|articulo|articulos|agregar|cargar|catalogo|nuevo)\b/.test(normalized)) selectedTopic = 'producto';
    }

    addMessage(answers[selectedTopic] || 'Todavía no tengo una respuesta para esa consulta. Puedo ayudarte con productos, ventas, stock, búsquedas o el acceso al sistema. ¿Sobre cuál querés saber?', 'bot');
  }

  function setPanelOpen(isOpen) {
    panel.hidden = !isOpen;
    toggle.setAttribute('aria-expanded', String(isOpen));
    if (isOpen) input.focus();
  }

  toggle.addEventListener('click', () => setPanelOpen(panel.hidden));
  close.addEventListener('click', () => setPanelOpen(false));

  document.querySelectorAll('[data-bot-topic]').forEach(button => {
    button.addEventListener('click', () => {
      const question = button.textContent.trim();
      addMessage(question, 'user');
      answerQuestion(button.dataset.botTopic, question);
    });
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    const question = input.value.trim();
    if (!question) return;
    addMessage(question, 'user');
    answerQuestion(null, question);
    input.value = '';
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !panel.hidden) setPanelOpen(false);
  });
}

document.addEventListener('DOMContentLoaded', initStockBot);

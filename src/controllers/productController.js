const db = require('../database');

// GET /api/products  (todos los roles)
function listProducts(req, res) {
  const products = db.prepare('SELECT * FROM products ORDER BY nombre').all();
  res.json(products);
}

// GET /api/products/:id  (todos los roles)
function getProduct(req, res) {
  const id = Number(req.params.id);

  // Validación: buscar producto o devolver 404 (duplicada a propósito)
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  if (!product) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  res.json(product);
}

// POST /api/products  (solo ADMIN)
function createProduct(req, res) {
  const { codigo, nombre, precio, stock, laboratorio } = req.body;

  // Validación de campos (duplicada a propósito)
  if (!codigo || codigo.trim() === '') {
    return res.status(400).json({ error: 'El campo codigo es obligatorio' });
  }
  if (!nombre || nombre.trim() === '') {
    return res.status(400).json({ error: 'El campo nombre es obligatorio' });
  }
  if (precio === undefined || precio === null || isNaN(Number(precio)) || Number(precio) < 0) {
    return res.status(400).json({ error: 'El campo precio debe ser un número mayor o igual a 0' });
  }
  if (stock === undefined || stock === null || isNaN(Number(stock)) || Number(stock) < 0) {
    return res.status(400).json({ error: 'El campo stock debe ser un número mayor o igual a 0' });
  }

  try {
    const info = db
      .prepare(
        'INSERT INTO products (codigo, nombre, precio, stock, laboratorio) VALUES (?, ?, ?, ?, ?)'
      )
      .run(codigo, nombre, Number(precio), Number(stock), laboratorio || null);
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(product);
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: 'Ya existe un producto con ese código' });
    }
    res.status(500).json({ error: 'Error al crear el producto' });
  }
}

// PUT /api/products/:id  (solo ADMIN)
function updateProduct(req, res) {
  const id = Number(req.params.id);
  const { codigo, nombre, precio, stock, laboratorio } = req.body;

  // Validación: buscar producto o devolver 404 (duplicada a propósito)
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  if (!product) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  // Validación de campos (duplicada a propósito)
  if (!codigo || codigo.trim() === '') {
    return res.status(400).json({ error: 'El campo codigo es obligatorio' });
  }
  if (!nombre || nombre.trim() === '') {
    return res.status(400).json({ error: 'El campo nombre es obligatorio' });
  }
  if (precio === undefined || precio === null || isNaN(Number(precio)) || Number(precio) < 0) {
    return res.status(400).json({ error: 'El campo precio debe ser un número mayor o igual a 0' });
  }
  if (stock === undefined || stock === null || isNaN(Number(stock)) || Number(stock) < 0) {
    return res.status(400).json({ error: 'El campo stock debe ser un número mayor o igual a 0' });
  }

  db.prepare(
    'UPDATE products SET codigo = ?, nombre = ?, precio = ?, stock = ?, laboratorio = ? WHERE id = ?'
  ).run(codigo, nombre, Number(precio), Number(stock), laboratorio || null, id);

  const actualizado = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  res.json(actualizado);
}

// DELETE /api/products/:id  (solo ADMIN)
function deleteProduct(req, res) {
  const id = Number(req.params.id);

  // Validación: buscar producto o devolver 404 (duplicada a propósito)
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  if (!product) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  db.prepare('DELETE FROM products WHERE id = ?').run(id);
  res.json({ mensaje: 'Producto eliminado' });
}

module.exports = { listProducts, getProduct, createProduct, updateProduct, deleteProduct };

const db = require('../database');
const { validarProducto, findProductOr404 } = require('../utils/helpers');

// GET /api/products  (todos los roles)
function listProducts(req, res) {
  const products = db.prepare('SELECT * FROM products ORDER BY nombre').all();
  res.json(products);
}

// GET /api/products/:id  (todos los roles)
function getProduct(req, res) {
  const product = findProductOr404(req.params.id, res);
  if (!product) return;
  res.json(product);
}

// POST /api/products  (solo ADMIN)
function createProduct(req, res) {
  const error = validarProducto(req.body);
  if (error) return res.status(400).json({ error });

  const { codigo, nombre, precio, stock, laboratorio } = req.body;
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
  const product = findProductOr404(req.params.id, res);
  if (!product) return;

  const error = validarProducto(req.body);
  if (error) return res.status(400).json({ error });

  const { codigo, nombre, precio, stock, laboratorio } = req.body;
  db.prepare(
    'UPDATE products SET codigo = ?, nombre = ?, precio = ?, stock = ?, laboratorio = ? WHERE id = ?'
  ).run(codigo, nombre, Number(precio), Number(stock), laboratorio || null, product.id);

  const actualizado = db.prepare('SELECT * FROM products WHERE id = ?').get(product.id);
  res.json(actualizado);
}

// DELETE /api/products/:id  (solo ADMIN)
function deleteProduct(req, res) {
  const product = findProductOr404(req.params.id, res);
  if (!product) return;

  db.prepare('DELETE FROM products WHERE id = ?').run(product.id);
  res.json({ mensaje: 'Producto eliminado' });
}

module.exports = { listProducts, getProduct, createProduct, updateProduct, deleteProduct };

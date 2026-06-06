const db = require('../database');

// POST /api/sales  (registrar venta: valida stock, descuenta y guarda en transacción)
function createSale(req, res) {
  const { product_id, cantidad } = req.body;

  // Validación de campos (duplicada a propósito)
  if (product_id === undefined || product_id === null || isNaN(Number(product_id))) {
    return res.status(400).json({ error: 'El campo product_id es obligatorio' });
  }
  if (cantidad === undefined || cantidad === null || isNaN(Number(cantidad)) || Number(cantidad) <= 0) {
    return res.status(400).json({ error: 'El campo cantidad debe ser un número mayor a 0' });
  }

  // Validación: buscar producto o devolver 404 (duplicada a propósito)
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(Number(product_id));
  if (!product) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  // Validar stock disponible
  if (product.stock < Number(cantidad)) {
    return res
      .status(400)
      .json({ error: `Stock insuficiente para "${product.nombre}" (disponible: ${product.stock})` });
  }

  const cant = Number(cantidad);
  const precioUnit = product.precio;
  const total = precioUnit * cant;

  // Transacción: descontar stock + guardar venta de forma atómica
  const registrar = db.transaction(() => {
    db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?').run(cant, product.id);
    const info = db
      .prepare(
        'INSERT INTO sales (product_id, user_id, cantidad, precio_unit, total) VALUES (?, ?, ?, ?, ?)'
      )
      .run(product.id, req.user.id, cant, precioUnit, total);
    return info.lastInsertRowid;
  });

  const ventaId = registrar();
  const venta = db
    .prepare(
      `SELECT s.*, p.nombre AS producto, u.nombre AS vendedor
       FROM sales s
       JOIN products p ON p.id = s.product_id
       JOIN users u ON u.id = s.user_id
       WHERE s.id = ?`
    )
    .get(ventaId);

  res.status(201).json(venta);
}

// GET /api/sales  (listar ventas)
function listSales(req, res) {
  const sales = db
    .prepare(
      `SELECT s.*, p.nombre AS producto, u.nombre AS vendedor
       FROM sales s
       JOIN products p ON p.id = s.product_id
       JOIN users u ON u.id = s.user_id
       ORDER BY s.fecha DESC`
    )
    .all();
  res.json(sales);
}

// GET /api/dashboard/low-stock  (productos con stock < 5)
function lowStock(req, res) {
  const products = db.prepare('SELECT * FROM products WHERE stock < 5 ORDER BY stock').all();
  res.json(products);
}

// GET /api/dashboard/today  (total de ventas del día)
function salesToday(req, res) {
  const row = db
    .prepare(
      `SELECT COUNT(*) AS cantidad, COALESCE(SUM(total), 0) AS total
       FROM sales WHERE date(fecha) = date('now')`
    )
    .get();
  res.json(row);
}

module.exports = { createSale, listSales, lowStock, salesToday };

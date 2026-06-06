const db = require('../database');
const { validarVenta, findProductOr404 } = require('../utils/helpers');

// POST /api/sales  (registrar venta: valida stock, descuenta y guarda en transacción)
function createSale(req, res) {
  const { product_id, cantidad } = req.body;

  const error = validarVenta(req.body);
  if (error) return res.status(400).json({ error });

  const product = findProductOr404(product_id, res);
  if (!product) return;

  const cant = Number(cantidad);
  if (product.stock < cant) {
    return res
      .status(400)
      .json({ error: `Stock insuficiente para "${product.nombre}" (disponible: ${product.stock})` });
  }

  const ventaId = registrarVenta(product, cant, req.user.id);
  res.status(201).json(buscarVentaDetalle(ventaId));
}

// Transacción: descontar stock + guardar venta de forma atómica
function registrarVenta(product, cant, userId) {
  const total = product.precio * cant;
  const tx = db.transaction(() => {
    db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?').run(cant, product.id);
    const info = db
      .prepare(
        'INSERT INTO sales (product_id, user_id, cantidad, precio_unit, total) VALUES (?, ?, ?, ?, ?)'
      )
      .run(product.id, userId, cant, product.precio, total);
    return info.lastInsertRowid;
  });
  return tx();
}

function buscarVentaDetalle(id) {
  return db
    .prepare(
      `SELECT s.*, p.nombre AS producto, u.nombre AS vendedor
       FROM sales s
       JOIN products p ON p.id = s.product_id
       JOIN users u ON u.id = s.user_id
       WHERE s.id = ?`
    )
    .get(id);
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

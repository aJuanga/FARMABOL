const db = require('../database');

/**
 * Valida los campos de un producto.
 * Devuelve un mensaje de error (string) o null si todo es válido.
 */
function validarProducto({ codigo, nombre, precio, stock }) {
  if (!codigo || codigo.trim() === '') return 'El campo codigo es obligatorio';
  if (!nombre || nombre.trim() === '') return 'El campo nombre es obligatorio';
  if (precio === undefined || precio === null || isNaN(Number(precio)) || Number(precio) < 0) {
    return 'El campo precio debe ser un número mayor o igual a 0';
  }
  if (stock === undefined || stock === null || isNaN(Number(stock)) || Number(stock) < 0) {
    return 'El campo stock debe ser un número mayor o igual a 0';
  }
  return null;
}

/**
 * Busca un producto por id. Si no existe, responde 404 y devuelve null.
 * Si existe, devuelve el producto.
 */
function findProductOr404(id, res) {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(Number(id));
  if (!product) {
    res.status(404).json({ error: 'Producto no encontrado' });
    return null;
  }
  return product;
}

/**
 * Valida los campos de una venta.
 * Devuelve un mensaje de error (string) o null si todo es válido.
 */
function validarVenta({ product_id, cantidad }) {
  if (product_id === undefined || product_id === null || isNaN(Number(product_id))) {
    return 'El campo product_id es obligatorio';
  }
  if (cantidad === undefined || cantidad === null || isNaN(Number(cantidad)) || Number(cantidad) <= 0) {
    return 'El campo cantidad debe ser un número mayor a 0';
  }
  return null;
}

module.exports = { validarProducto, validarVenta, findProductOr404 };

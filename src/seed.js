// Inserta usuarios y productos de ejemplo (idempotente).
// Se ejecuta solo (npm run seed) o automáticamente al arrancar el servidor.
const bcrypt = require('bcryptjs');
const db = require('./database');

const users = [
  { username: 'admin', password: 'admin123', nombre: 'Administrador', rol: 'ADMIN' },
  { username: 'vendedor', password: 'vende123', nombre: 'Vendedor Uno', rol: 'VENDEDOR' },
];

const products = [
  { codigo: 'MED001', nombre: 'Paracetamol 500mg', precio: 5.5, stock: 120, laboratorio: 'Bago' },
  { codigo: 'MED002', nombre: 'Ibuprofeno 400mg', precio: 8.0, stock: 80, laboratorio: 'Inti' },
  { codigo: 'MED003', nombre: 'Amoxicilina 500mg', precio: 15.0, stock: 40, laboratorio: 'Bago' },
  { codigo: 'MED004', nombre: 'Loratadina 10mg', precio: 6.5, stock: 60, laboratorio: 'Inti' },
  { codigo: 'MED005', nombre: 'Omeprazol 20mg', precio: 12.0, stock: 3, laboratorio: 'Vita' },
  { codigo: 'MED006', nombre: 'Alcohol en gel 250ml', precio: 18.0, stock: 2, laboratorio: 'Vita' },
];

// Siembra datos solo si faltan (seguro de llamar en cada arranque).
function runSeed() {
  for (const u of users) {
    const existe = db.prepare('SELECT id FROM users WHERE username = ?').get(u.username);
    if (!existe) {
      const hash = bcrypt.hashSync(u.password, 10);
      db.prepare('INSERT INTO users (username, password, nombre, rol) VALUES (?, ?, ?, ?)').run(
        u.username,
        hash,
        u.nombre,
        u.rol
      );
    }
  }

  for (const p of products) {
    const existe = db.prepare('SELECT id FROM products WHERE codigo = ?').get(p.codigo);
    if (!existe) {
      db.prepare(
        'INSERT INTO products (codigo, nombre, precio, stock, laboratorio) VALUES (?, ?, ?, ?, ?)'
      ).run(p.codigo, p.nombre, p.precio, p.stock, p.laboratorio);
    }
  }
}

module.exports = runSeed;

// Permite ejecutarlo manualmente: npm run seed
if (require.main === module) {
  console.log('🌱 Sembrando datos de FARMABOL...');
  runSeed();
  console.log('✅ Listo. Credenciales -> admin/admin123  ·  vendedor/vende123');
  db.close();
}

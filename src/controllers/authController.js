const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'farmabol_secret_inseguro';

// POST /api/auth/login
function login(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'username y password son obligatorios' });
  }

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user) {
    return res.status(401).json({ error: 'Credenciales incorrectas' });
  }

  const valido = bcrypt.compareSync(password, user.password);
  if (!valido) {
    return res.status(401).json({ error: 'Credenciales incorrectas' });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, nombre: user.nombre, rol: user.rol },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

  res.json({
    token,
    user: { id: user.id, username: user.username, nombre: user.nombre, rol: user.rol },
  });
}

module.exports = { login };

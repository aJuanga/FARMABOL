const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'farmabol_secret_inseguro';

// Verifica el JWT enviado en Authorization: Bearer <token>
function verifyToken(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

// Restringe el acceso a un rol específico (ej. requireRole('ADMIN'))
function requireRole(rol) {
  return (req, res, next) => {
    if (!req.user || req.user.rol !== rol) {
      return res.status(403).json({ error: 'No tienes permiso para esta acción' });
    }
    next();
  };
}

module.exports = { verifyToken, requireRole };

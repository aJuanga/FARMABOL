const { Router } = require('express');
const {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = Router();

// Todos los roles pueden consultar
router.get('/', verifyToken, listProducts);
router.get('/:id', verifyToken, getProduct);

// Solo ADMIN puede crear / editar / eliminar
router.post('/', verifyToken, requireRole('ADMIN'), createProduct);
router.put('/:id', verifyToken, requireRole('ADMIN'), updateProduct);
router.delete('/:id', verifyToken, requireRole('ADMIN'), deleteProduct);

module.exports = router;

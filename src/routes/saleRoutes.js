const { Router } = require('express');
const { createSale, listSales, lowStock, salesToday } = require('../controllers/saleController');
const { verifyToken } = require('../middleware/auth');

const router = Router();

router.post('/', verifyToken, createSale);
router.get('/', verifyToken, listSales);

// Dashboard
router.get('/dashboard/low-stock', verifyToken, lowStock);
router.get('/dashboard/today', verifyToken, salesToday);

module.exports = router;

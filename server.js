const path = require('path');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./src/routes/authRoutes');
const productRoutes = require('./src/routes/productRoutes');
const saleRoutes = require('./src/routes/saleRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Frontend estático
app.use(express.static(path.join(__dirname, 'public')));

// API
app.get('/api/health', (req, res) => res.json({ status: 'ok', sistema: 'FARMABOL' }));
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sales', saleRoutes);

app.listen(PORT, () => {
  console.log(`🏥 FARMABOL corriendo en http://localhost:${PORT}`);
});

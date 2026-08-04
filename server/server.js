import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import menuRoutes from './routes/menuRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    app: 'Pizza House API',
    time: new Date().toISOString()
  });
});

// Connect Database & Start Server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Pizza House Express Server running on http://localhost:${PORT}`);
  });
});

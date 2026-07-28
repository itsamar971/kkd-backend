import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';

import userRoutes from './routes/userRoutes';
import productRoutes from './routes/productRoutes';
import orderRoutes from './routes/orderRoutes';
import adminRoutes from './routes/adminRoutes';
import marketRoutes from './routes/marketRoutes';

const app = express();

app.disable('etag'); // Disables 304 Not Modified responses, forces 200 OK

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(morgan('dev')); // HTTP request logger

// Serve static files
app.use('/public', express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/market', marketRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

export default app;

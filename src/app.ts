import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';

import userRoutes from './routes/userRoutes';
import productRoutes from './routes/productRoutes';
import orderRoutes from './routes/orderRoutes';
import adminRoutes from './routes/adminRoutes';
import marketRoutes from './routes/marketRoutes';
import messageRoutes from './routes/messageRoutes';
import settingsRoutes from './routes/settingsRoutes';
import verificationRoutes from './routes/verificationRoutes';
import announcementRoutes from './routes/announcementRoutes';
import promotionRoutes from './routes/promotionRoutes';
import disputeRoutes from './routes/disputeRoutes';
import financeRoutes from './routes/financeRoutes';
import mandiRoutes from './routes/mandiRoutes';
import analyticsRoutes from './routes/analyticsRoutes';

const app = express();

app.disable('etag'); // Disables 304 Not Modified responses, forces 200 OK

// CORS configuration — allow all origins with credentials support
const corsOptions = {
  origin: true, // reflect the request origin — allows all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

// Handle preflight OPTIONS for ALL routes BEFORE anything else
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(morgan('dev')); // HTTP request logger

// Serve static files
app.use('/public', express.static(path.join(__dirname, '../public')));

// Health check (before auth middleware)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/messages', messageRoutes);
app.use('/api/admin/settings', settingsRoutes);
app.use('/api/admin/verification', verificationRoutes);
app.use('/api/admin/announcements', announcementRoutes);
app.use('/api/admin/promotions', promotionRoutes);
app.use('/api/admin/disputes', disputeRoutes);
app.use('/api/admin/finance', financeRoutes);
app.use('/api/admin/mandi', mandiRoutes);
app.use('/api/admin/analytics', analyticsRoutes);
app.use('/api/market', marketRoutes);

export default app;

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import errorHandler from './middleware/errorHandler.js';

// ─── Routes ───────────────────────────────────────────────────────────────────
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import vendorRoutes from './routes/vendor.routes.js';
import requirementRoutes from './routes/requirement.routes.js';
import leadRoutes from './routes/lead.routes.js';
import bidRoutes from './routes/bid.routes.js';
import categoryRoutes from './routes/category.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import faqRoutes from './routes/faq.routes.js';
import adminRoutes from './routes/admin.routes.js';
import planRoutes from './routes/plan.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import vehicleRoutes from './routes/vehicle.routes.js';
import chatRoutes from './routes/chat.routes.js';
import paymentRoutes from './routes/payment.routes.js';

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, callback) => {
    if (process.env.NODE_ENV === 'development' || !origin) {
      return callback(null, true);
    }

    const allowedOrigins = process.env.FRONTEND_URL
      ? process.env.FRONTEND_URL.split(',').map(url => url.trim().replace(/\/$/, ''))
      : [];

    if (allowedOrigins.indexOf(origin.replace(/\/$/, '')) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static('uploads'));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'GetGoLoad API is running 🚀', env: process.env.NODE_ENV });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/vendors', vendorRoutes);
app.use('/requirements', requirementRoutes);
app.use('/leads', leadRoutes);
app.use('/bids', bidRoutes);
app.use('/categories', categoryRoutes);
app.use('/settings', settingsRoutes);
app.use('/faqs', faqRoutes);
app.use('/admin', adminRoutes);
app.use('/plans', planRoutes);
app.use('/upload', uploadRoutes);
app.use('/vehicles', vehicleRoutes);
app.use('/chats', chatRoutes);
app.use('/payments', paymentRoutes);

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'NOT_FOUND', message: `Route ${req.method} ${req.path} not found` });
});

// ─── Global Error Handler (must be last) ──────────────────────────────────────
app.use(errorHandler);

export default app;

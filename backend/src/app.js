import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import errorHandler from './middleware/errorHandler.js';

// ─── Routes ───────────────────────────────────────────────────────────────────
import authRoutes from './routes/auth.routes.js';

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.NODE_ENV === 'development'
    ? ['http://localhost:5173', 'http://localhost:3000']
    : process.env.FRONTEND_URL,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Safar Setto API is running 🚀', env: process.env.NODE_ENV });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'NOT_FOUND', message: `Route ${req.method} ${req.path} not found` });
});

// ─── Global Error Handler (must be last) ──────────────────────────────────────
app.use(errorHandler);

export default app;

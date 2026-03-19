import 'dotenv/config';
import { validateEnv } from './config/validateEnv.js';
validateEnv(); // crash early if .env is incomplete

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import { connectDB } from './config/db.js';
import { sanitise } from './middleware/sanitise.middleware.js';
import authRoutes    from './routes/auth.routes.js';
import tripRoutes    from './routes/trip.routes.js';
import expenseRoutes from './routes/expense.routes.js';
import { errorHandler } from './middleware/error.middleware.js';

const app    = express();
const isProd = process.env.NODE_ENV === 'production';

// ── CORS ──────────────────────────────────────────────────────
// In production, CLIENT_ORIGIN can be comma-separated:
// e.g. https://splitit.vercel.app,https://www.splitit.app
const allowedOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(',').map(o => o.trim())
  : ['http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
  credentials: true,
}));

// ── Core middleware ───────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(sanitise);
app.use(passport.initialize());

// ── Routes ────────────────────────────────────────────────────
app.use('/api/v1/auth',  authRoutes);
app.use('/api/v1/trips', tripRoutes);
app.use('/api/v1/trips', expenseRoutes);

app.get('/health', (_, res) => res.json({
  status: 'ok',
  env: isProd ? 'production' : 'development',
}));

app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () =>
    console.log(`Server running on port ${PORT} [${isProd ? 'production' : 'development'}]`)
  );
});

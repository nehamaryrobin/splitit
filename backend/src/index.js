import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import tripRoutes from './routes/trip.routes.js';
import expenseRoutes from './routes/expense.routes.js';
import { errorHandler } from './middleware/error.middleware.js';

const app = express();

app.use(cors({
  origin: process.env.CLIENT_ORIGIN,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

app.use('/api/v1/auth',  authRoutes);
app.use('/api/v1/trips', tripRoutes);
app.use('/api/v1/trips', expenseRoutes);

app.get('/health', (_, res) => res.json({ status: 'ok' }));
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});

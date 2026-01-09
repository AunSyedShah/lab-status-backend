import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import labRoutes from './routes/labs.js';
import batchRoutes from './routes/batches.js';
import facultyRoutes from './routes/faculties.js';
import bookRoutes from './routes/books.js';
import timeSlotRoutes from './routes/timeSlots.js';
import allocationRoutes from './routes/allocations.js';
import seedRoutes from './routes/seed.js';
import logger from './utils/logger.js';

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lab_status';
const CORS_ORIGINS = process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:3000'];

logger.info('Starting Lab Status Express Server', { PORT, MONGODB_URI });

// Rate Limiting Configuration
// Tiered limits: Most restrictive for seed (initialization), moderate for mutations, permissive for reads
const seedLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 1, // 1 request per 10 minutes
  message: 'Seed endpoint is limited to 1 request per 10 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

const mutateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: 'Too many write requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

const readLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 200, // 200 requests per minute
  message: 'Too many read requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// CORS Configuration
const corsOptions = {
  origin: CORS_ORIGINS,
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
logger.debug('CORS middleware enabled', { origins: CORS_ORIGINS });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  const startTime = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.logRequest(req.method, req.path, res.statusCode, duration);
  });
  next();
});

// Connect to MongoDB
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    logger.success('Connected to MongoDB', { uri: MONGODB_URI });
  })
  .catch((error) => {
    logger.error('MongoDB connection failed', error);
  });

// Routes
logger.info('Setting up routes...');
app.use('/api/seed', seedLimiter, seedRoutes); // Most restrictive: 1 request per 10 minutes
app.use('/api/labs', readLimiter, labRoutes); // Read limiter: 200 requests per minute
app.use('/api/batches', mutateLimiter, batchRoutes); // Mutation limiter: 10 requests per minute (includes GET)
app.use('/api/faculties', mutateLimiter, facultyRoutes); // Mutation limiter: 10 requests per minute
app.use('/api/books', mutateLimiter, bookRoutes); // Mutation limiter: 10 requests per minute
app.use('/api/timeslots', readLimiter, timeSlotRoutes); // Read limiter: 200 requests per minute
app.use('/api/allocations', mutateLimiter, allocationRoutes); // Mutation limiter: 10 requests per minute
logger.success('Routes configured successfully with rate limiting');

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Server is running' });
});

// 404 handler
app.use((req, res) => {
  logger.warn('Route not found', { method: req.method, path: req.path });
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(`Error in ${req.method} ${req.path}`, err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  logger.success(`Server running on http://localhost:${PORT}`);
  logger.info('Environment', { NODE_ENV: process.env.NODE_ENV || 'development' });
});
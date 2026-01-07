import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import labRoutes from './routes/labs.js';
import batchRoutes from './routes/batches.js';
import facultyRoutes from './routes/faculties.js';
import bookRoutes from './routes/books.js';
import timeSlotRoutes from './routes/timeSlots.js';
import allocationRoutes from './routes/allocations.js';
import seedRoutes from './routes/seed.js';


const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lab_status';
const CORS_ORIGINS = process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:3000'];

// CORS Configuration
const corsOptions = {
  origin: CORS_ORIGINS,
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

// Routes
app.use('/api/labs', labRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/faculties', facultyRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/timeslots', timeSlotRoutes);
app.use('/api/allocations', allocationRoutes);
app.use('/api/seed', seedRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Server is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
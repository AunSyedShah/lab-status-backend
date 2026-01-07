import express from 'express';
import { seedDatabase } from '../controllers/seedController.js';

const router = express.Router();

// Seed endpoint
router.post('/', seedDatabase);

export default router;

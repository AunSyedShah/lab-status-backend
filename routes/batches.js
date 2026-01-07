import express from 'express';
import {
  getAllBatches,
  getBatchById,
  createBatch,
  updateBatch,
  deleteBatch
} from '../controllers/batchController.js';

const router = express.Router();

// Routes
router.get('/', getAllBatches);
router.get('/:id', getBatchById);
router.post('/', createBatch);
router.put('/:id', updateBatch);
router.delete('/:id', deleteBatch);

export default router;

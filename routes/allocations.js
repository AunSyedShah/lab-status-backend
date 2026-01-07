import express from 'express';
import {
  getAllAllocations,
  getAllocationById,
  getAllocationsByLab,
  getAllocationsByBatch,
  createAllocation,
  updateAllocation,
  deleteAllocation
} from '../controllers/allocationController.js';

const router = express.Router();

// Routes
router.get('/', getAllAllocations);
router.get('/:id', getAllocationById);
router.get('/lab/:labId', getAllocationsByLab);
router.get('/batch/:batchId', getAllocationsByBatch);
router.post('/', createAllocation);
router.put('/:id', updateAllocation);
router.delete('/:id', deleteAllocation);

export default router;

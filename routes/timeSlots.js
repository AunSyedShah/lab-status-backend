import express from 'express';
import {
  getAllTimeSlots,
  getTimeSlotById,
  createTimeSlot,
  updateTimeSlot,
  deleteTimeSlot
} from '../controllers/timeSlotController.js';

const router = express.Router();

// Routes
router.get('/', getAllTimeSlots);
router.get('/:id', getTimeSlotById);
router.post('/', createTimeSlot);
router.put('/:id', updateTimeSlot);
router.delete('/:id', deleteTimeSlot);

export default router;

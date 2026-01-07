import express from 'express';
import {
  getAllFaculties,
  getFacultyById,
  createFaculty,
  updateFaculty,
  deleteFaculty
} from '../controllers/facultyController.js';

const router = express.Router();

// Routes
router.get('/', getAllFaculties);
router.get('/:id', getFacultyById);
router.post('/', createFaculty);
router.put('/:id', updateFaculty);
router.delete('/:id', deleteFaculty);

export default router;

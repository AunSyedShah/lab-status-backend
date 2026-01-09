import Batch from '../models/Batch.js';
import logger from '../utils/logger.js';
import { checkBatchDependencies, createDependencyConflictError } from '../utils/dependencyChecker.js';

// Get all batches
export const getAllBatches = async (req, res) => {
  try {
    const batches = await Batch.find().populate('faculty').populate('currentBook').populate('upcomingBook');
    res.status(200).json({ success: true, data: batches });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get batch by ID
export const getBatchById = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id).populate('faculty').populate('currentBook').populate('upcomingBook');
    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }
    res.status(200).json({ success: true, data: batch });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create new batch
export const createBatch = async (req, res) => {
  try {
    const { code, faculty, currentSemester, currentBook, upcomingBook, numberOfStudents } = req.body;
    logger.info('Creating new batch', { code, faculty });
    const batch = new Batch({ code, faculty, currentSemester, currentBook, upcomingBook, numberOfStudents });
    await batch.save();
    const populatedBatch = await Batch.findById(batch._id).populate('faculty').populate('currentBook').populate('upcomingBook');
    logger.success('Batch created', { batchId: populatedBatch._id, code: populatedBatch.code });
    res.status(201).json({ success: true, data: populatedBatch });
  } catch (error) {
    logger.error('Error creating batch', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update batch
export const updateBatch = async (req, res) => {
  try {
    // Prepare update data - remove empty/null book fields to preserve existing values
    const updateData = { ...req.body };
    
    if (!updateData.currentBook) {
      delete updateData.currentBook;
    }
    if (!updateData.upcomingBook) {
      delete updateData.upcomingBook;
    }
    
    const batch = await Batch.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    }).populate('faculty').populate('currentBook').populate('upcomingBook');
    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }
    res.status(200).json({ success: true, data: batch });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete batch
export const deleteBatch = async (req, res) => {
  try {
    logger.info('Deleting batch', { batchId: req.params.id });
    
    // Check for dependencies
    const dependencies = await checkBatchDependencies(req.params.id);
    if (dependencies.hasDependencies) {
      const error = createDependencyConflictError('Batch', req.params.id, dependencies);
      logger.warn('Cannot delete batch - has dependencies', { batchId: req.params.id, count: dependencies.count });
      return res.status(409).json({
        success: false,
        code: error.code,
        message: error.message,
        details: error.details
      });
    }
    
    const batch = await Batch.findByIdAndDelete(req.params.id);
    if (!batch) {
      logger.warn('Batch not found for deletion', { batchId: req.params.id });
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }
    logger.success('Batch deleted', { batchId: batch._id, code: batch.code });
    res.status(200).json({ success: true, message: 'Batch deleted successfully' });
  } catch (error) {
    logger.error('Error deleting batch', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

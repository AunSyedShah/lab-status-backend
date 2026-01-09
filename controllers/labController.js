import Lab from '../models/Lab.js';
import logger from '../utils/logger.js';
import { checkLabDependencies, createDependencyConflictError } from '../utils/dependencyChecker.js';

// Get all labs
export const getAllLabs = async (req, res) => {
  try {
    const labs = await Lab.find();
    res.status(200).json({ success: true, data: labs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get lab by ID
export const getLabById = async (req, res) => {
  try {
    const lab = await Lab.findById(req.params.id);
    if (!lab) {
      return res.status(404).json({ success: false, message: 'Lab not found' });
    }
    res.status(200).json({ success: true, data: lab });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create new lab
export const createLab = async (req, res) => {
  try {
    const { code, capacity, location } = req.body;
    logger.info('Creating new lab', { code, capacity });
    const lab = new Lab({ code, capacity, location });
    await lab.save();
    logger.success('Lab created', { labId: lab._id, code: lab.code });
    res.status(201).json({ success: true, data: lab });
  } catch (error) {
    logger.error('Error creating lab', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update lab
export const updateLab = async (req, res) => {
  try {
    const lab = await Lab.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!lab) {
      return res.status(404).json({ success: false, message: 'Lab not found' });
    }
    res.status(200).json({ success: true, data: lab });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete lab
export const deleteLab = async (req, res) => {
  try {
    logger.info('Deleting lab', { labId: req.params.id });
    
    // Check for dependencies
    const dependencies = await checkLabDependencies(req.params.id);
    if (dependencies.hasDependencies) {
      const error = createDependencyConflictError('Lab', req.params.id, dependencies);
      logger.warn('Cannot delete lab - has dependencies', { labId: req.params.id, count: dependencies.count });
      return res.status(409).json({
        success: false,
        code: error.code,
        message: error.message,
        details: error.details
      });
    }
    
    const lab = await Lab.findByIdAndDelete(req.params.id);
    if (!lab) {
      logger.warn('Lab not found for deletion', { labId: req.params.id });
      return res.status(404).json({ success: false, message: 'Lab not found' });
    }
    logger.success('Lab deleted', { labId: lab._id, code: lab.code });
    res.status(200).json({ success: true, message: 'Lab deleted successfully' });
  } catch (error) {
    logger.error('Error deleting lab', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

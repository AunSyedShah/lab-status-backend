import Batch from '../models/Batch.js';

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
    const batch = new Batch({ code, faculty, currentSemester, currentBook, upcomingBook, numberOfStudents });
    await batch.save();
    await batch.populate('faculty').populate('currentBook').populate('upcomingBook');
    res.status(201).json({ success: true, data: batch });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update batch
export const updateBatch = async (req, res) => {
  try {
    const batch = await Batch.findByIdAndUpdate(req.params.id, req.body, {
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
    const batch = await Batch.findByIdAndDelete(req.params.id);
    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }
    res.status(200).json({ success: true, message: 'Batch deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

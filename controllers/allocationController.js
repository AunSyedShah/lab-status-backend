import Allocation from '../models/Allocation.js';

// Get all allocations
export const getAllAllocations = async (req, res) => {
  try {
    const allocations = await Allocation.find()
      .populate('lab')
      .populate('batch')
      .populate('timeSlot');
    res.status(200).json({ success: true, data: allocations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get allocation by ID
export const getAllocationById = async (req, res) => {
  try {
    const allocation = await Allocation.findById(req.params.id)
      .populate('lab')
      .populate('batch')
      .populate('timeSlot');
    if (!allocation) {
      return res.status(404).json({ success: false, message: 'Allocation not found' });
    }
    res.status(200).json({ success: true, data: allocation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get allocations by lab
export const getAllocationsByLab = async (req, res) => {
  try {
    const allocations = await Allocation.find({ lab: req.params.labId })
      .populate('lab')
      .populate('batch')
      .populate('timeSlot');
    res.status(200).json({ success: true, data: allocations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get allocations by batch
export const getAllocationsByBatch = async (req, res) => {
  try {
    const allocations = await Allocation.find({ batch: req.params.batchId })
      .populate('lab')
      .populate('batch')
      .populate('timeSlot');
    res.status(200).json({ success: true, data: allocations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create new allocation
export const createAllocation = async (req, res) => {
  try {
    const { lab, batch, timeSlot, dayPattern } = req.body;
    const allocation = new Allocation({ lab, batch, timeSlot, dayPattern });
    await allocation.save();
    await allocation.populate('lab').populate('batch').populate('timeSlot');
    res.status(201).json({ success: true, data: allocation });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update allocation
export const updateAllocation = async (req, res) => {
  try {
    const allocation = await Allocation.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('lab').populate('batch').populate('timeSlot');
    if (!allocation) {
      return res.status(404).json({ success: false, message: 'Allocation not found' });
    }
    res.status(200).json({ success: true, data: allocation });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete allocation
export const deleteAllocation = async (req, res) => {
  try {
    const allocation = await Allocation.findByIdAndDelete(req.params.id);
    if (!allocation) {
      return res.status(404).json({ success: false, message: 'Allocation not found' });
    }
    res.status(200).json({ success: true, message: 'Allocation deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

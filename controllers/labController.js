import Lab from '../models/Lab.js';

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
    const lab = new Lab({ code, capacity, location });
    await lab.save();
    res.status(201).json({ success: true, data: lab });
  } catch (error) {
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
    const lab = await Lab.findByIdAndDelete(req.params.id);
    if (!lab) {
      return res.status(404).json({ success: false, message: 'Lab not found' });
    }
    res.status(200).json({ success: true, message: 'Lab deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

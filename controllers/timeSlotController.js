import TimeSlot from '../models/TimeSlot.js';
import logger from '../utils/logger.js';

// Get all time slots
export const getAllTimeSlots = async (req, res) => {
  try {
    const timeSlots = await TimeSlot.find().sort({ orderIndex: 1 });
    res.status(200).json({ success: true, data: timeSlots });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get time slot by ID
export const getTimeSlotById = async (req, res) => {
  try {
    const timeSlot = await TimeSlot.findById(req.params.id);
    if (!timeSlot) {
      return res.status(404).json({ success: false, message: 'Time slot not found' });
    }
    res.status(200).json({ success: true, data: timeSlot });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create new time slot
export const createTimeSlot = async (req, res) => {
  try {
    const { startTime, endTime, label, orderIndex } = req.body;
    const timeSlot = new TimeSlot({ startTime, endTime, label, orderIndex });
    await timeSlot.save();
    res.status(201).json({ success: true, data: timeSlot });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update time slot
export const updateTimeSlot = async (req, res) => {
  try {
    const timeSlot = await TimeSlot.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!timeSlot) {
      return res.status(404).json({ success: false, message: 'Time slot not found' });
    }
    res.status(200).json({ success: true, data: timeSlot });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete time slot
export const deleteTimeSlot = async (req, res) => {
  try {
    const timeSlot = await TimeSlot.findByIdAndDelete(req.params.id);
    if (!timeSlot) {
      return res.status(404).json({ success: false, message: 'Time slot not found' });
    }
    res.status(200).json({ success: true, message: 'Time slot deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

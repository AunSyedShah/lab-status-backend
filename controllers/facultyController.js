import Faculty from '../models/Faculty.js';
import Allocation from '../models/Allocation.js';
import TimeSlot from '../models/TimeSlot.js';
import logger from '../utils/logger.js';
import { checkFacultyDependencies, createDependencyConflictError } from '../utils/dependencyChecker.js';

// Get all faculties
export const getAllFaculties = async (req, res) => {
  try {
    logger.debug('Fetching all faculties');
    const faculties = await Faculty.find();
    logger.success('Faculties fetched', { count: faculties.length });
    res.status(200).json({ success: true, data: faculties });
  } catch (error) {
    logger.error('Error fetching faculties', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get faculty by ID
export const getFacultyById = async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) {
      return res.status(404).json({ success: false, message: 'Faculty not found' });
    }
    res.status(200).json({ success: true, data: faculty });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create new faculty
export const createFaculty = async (req, res) => {
  try {
    const { name } = req.body;
    const faculty = new Faculty({ name });
    await faculty.save();
    res.status(201).json({ success: true, data: faculty });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update faculty
export const updateFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!faculty) {
      return res.status(404).json({ success: false, message: 'Faculty not found' });
    }
    res.status(200).json({ success: true, data: faculty });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete faculty
export const deleteFaculty = async (req, res) => {
  try {
    logger.info('Deleting faculty', { facultyId: req.params.id });
    
    // Check for dependencies
    const dependencies = await checkFacultyDependencies(req.params.id);
    if (dependencies.hasDependencies) {
      const error = createDependencyConflictError('Faculty', req.params.id, dependencies);
      logger.warn('Cannot delete faculty - has dependencies', { facultyId: req.params.id, count: dependencies.count });
      return res.status(409).json({
        success: false,
        code: error.code,
        message: error.message,
        details: error.details
      });
    }
    
    const faculty = await Faculty.findByIdAndDelete(req.params.id);
    if (!faculty) {
      return res.status(404).json({ success: false, message: 'Faculty not found' });
    }
    logger.success('Faculty deleted', { facultyId: faculty._id, name: faculty.name });
    res.status(200).json({ success: true, message: 'Faculty deleted successfully' });
  } catch (error) {
    logger.error('Error deleting faculty', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get free faculties for each time slot with day-wise breakdown
export const getFreeFacultiesBySlot = async (req, res) => {
  try {
    logger.debug('Fetching free faculties by slot');
    const DAY_PATTERNS = ['MWF', 'TTS', 'REGULAR'];
    const faculties = await Faculty.find();
    const timeSlots = await TimeSlot.find().sort({ orderIndex: 1 });
    
    logger.debug('Data fetched', { 
      facultiesCount: faculties.length, 
      timeSlotsCount: timeSlots.length 
    });
    
    const result = [];

    for (const timeSlot of timeSlots) {
      // Get all allocations for this time slot
      const allocations = await Allocation.find({ timeSlot: timeSlot._id })
        .populate({
          path: 'batch',
          populate: { path: 'faculty' }
        });

      // Create a map of faculty ID to busy day patterns (MWF and TTS only)
      const facultyDayMap = {};
      allocations.forEach(alloc => {
        if (alloc.batch && alloc.batch.faculty) {
          const facultyId = alloc.batch.faculty._id.toString();
          if (!facultyDayMap[facultyId]) {
            facultyDayMap[facultyId] = new Set();
          }
          // If REGULAR, mark both MWF and TTS as busy
          if (alloc.dayPattern === 'REGULAR') {
            facultyDayMap[facultyId].add('MWF');
            facultyDayMap[facultyId].add('TTS');
          } else {
            facultyDayMap[facultyId].add(alloc.dayPattern);
          }
        }
      });

      // For each faculty, determine free and busy day patterns
      const facultySummary = faculties.map(faculty => {
        const facultyId = faculty._id.toString();
        const busyDayPatternsSet = facultyDayMap[facultyId] || new Set();
        
        // Determine which patterns are busy
        const mwfBusy = busyDayPatternsSet.has('MWF');
        const ttsBusy = busyDayPatternsSet.has('TTS');

        const freeDayPatterns = [];
        const busyDayPatterns = [];

        // Determine MWF and TTS status
        if (mwfBusy) {
          busyDayPatterns.push('MWF');
        } else {
          freeDayPatterns.push('MWF');
        }

        if (ttsBusy) {
          busyDayPatterns.push('TTS');
        } else {
          freeDayPatterns.push('TTS');
        }

        // REGULAR is busy if EITHER MWF or TTS is busy
        if (mwfBusy || ttsBusy) {
          busyDayPatterns.push('REGULAR');
        } else {
          freeDayPatterns.push('REGULAR');
        }

        return {
          faculty: {
            _id: faculty._id,
            name: faculty.name
          },
          freeDayPatterns: freeDayPatterns,
          busyDayPatterns: busyDayPatterns,
          isFreeCompletely: busyDayPatterns.length === 0,
          isBusyCompletely: freeDayPatterns.length === 0
        };
      });

      // Separate completely free and partially free faculties
      const completelFreeFaculties = facultySummary.filter(f => f.isFreeCompletely);
      const partiallyFreeFaculties = facultySummary.filter(
        f => !f.isFreeCompletely && f.freeDayPatterns.length > 0
      );
      const busyFaculties = facultySummary.filter(f => f.isBusyCompletely);

      result.push({
        timeSlot: {
          _id: timeSlot._id,
          label: timeSlot.label,
          startTime: timeSlot.startTime,
          endTime: timeSlot.endTime,
          orderIndex: timeSlot.orderIndex
        },
        facultySummary: facultySummary,
        completelFreeFaculties: completelFreeFaculties,
        partiallyFreeFaculties: partiallyFreeFaculties,
        busyFaculties: busyFaculties,
        stats: {
          totalFaculties: faculties.length,
          completelFree: completelFreeFaculties.length,
          partiallyFree: partiallyFreeFaculties.length,
          busy: busyFaculties.length
        }
      });
    }

    logger.success('Free faculties summary generated', { 
      slotsCount: result.length 
    });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    logger.error('Error fetching free faculties by slot', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

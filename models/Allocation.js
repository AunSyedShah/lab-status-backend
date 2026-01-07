import mongoose from 'mongoose';

const AllocationSchema = new mongoose.Schema({
  lab: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Lab', 
    required: [true, 'Lab is required'] 
  },
  batch: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Batch', 
    required: [true, 'Batch is required'] 
  },
  timeSlot: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'TimeSlot', 
    required: [true, 'Time slot is required'] 
  },
  dayPattern: { 
    type: String, 
    enum: ['MWF', 'TTS', 'REGULAR'], 
    required: [true, 'Day pattern is required (MWF, TTS, or REGULAR)'] 
  }
}, { timestamps: true });

// --- INDEXING ---
// Ensures you cannot create a duplicate entry for the exact same lab, time, and pattern.
AllocationSchema.index({ lab: 1, timeSlot: 1, dayPattern: 1 }, { unique: true });

export default mongoose.model('Allocation', AllocationSchema);
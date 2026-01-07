import mongoose from 'mongoose';

const TimeSlotSchema = new mongoose.Schema({
  startTime: { 
    type: String, 
    required: true, 
    trim: true // Format: "09:00"
  },
  endTime: { 
    type: String, 
    required: true, 
    trim: true // Format: "11:00"
  },
  label: { 
    type: String, 
    trim: true // Display name: "09:00 AM - 11:00 AM"
  },
  orderIndex: { 
    type: Number, 
    required: true, 
    unique: true // 1, 2, 3... for sorting columns
  }
});

export default mongoose.model('TimeSlot', TimeSlotSchema);
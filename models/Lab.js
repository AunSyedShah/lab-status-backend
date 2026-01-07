import mongoose from 'mongoose';

const LabSchema = new mongoose.Schema({
  code: { 
    type: String, 
    required: [true, 'Lab code is required'], 
    unique: true, 
    trim: true,
    uppercase: true 
  },
  capacity: { 
    type: Number, 
    required: [true, 'Lab capacity is required'],
    min: [1, 'Capacity must be at least 1']
  },
  location: { 
    type: String, 
    trim: true 
  } 
}, { timestamps: true });

export default mongoose.model('Lab', LabSchema);
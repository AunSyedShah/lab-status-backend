import mongoose from 'mongoose';

const FacultySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Faculty name is required'], 
    unique: true,
    trim: true 
  }
}, { timestamps: true });

export default mongoose.model('Faculty', FacultySchema);

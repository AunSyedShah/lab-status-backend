import mongoose from 'mongoose';

const BatchSchema = new mongoose.Schema({
  code: { 
    type: String, 
    required: [true, 'Batch code is required'], 
    unique: { sparse: true },
    trim: true 
  },
  faculty: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Faculty', 
    required: [true, 'Faculty is required'] 
  },
  currentSemester: { 
    type: String, 
    required: true,
    trim: true 
  },
  currentBook: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Book'
  },
  upcomingBook: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Book'
  },
  numberOfStudents: { 
    type: Number, 
    default: 0,
    min: 0 
  }
}, { timestamps: true });

export default mongoose.model('Batch', BatchSchema);
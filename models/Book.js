import mongoose from 'mongoose';

const BookSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'Book title is required'], 
    unique: true,
    trim: true 
  },
  isbn: { 
    type: String, 
    trim: true 
  },
  author: { 
    type: String, 
    trim: true 
  },
  edition: { 
    type: String, 
    trim: true 
  }
}, { timestamps: true });

export default mongoose.model('Book', BookSchema);

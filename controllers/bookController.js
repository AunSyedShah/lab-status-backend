import Book from '../models/Book.js';

// Get all books
export const getAllBooks = async (req, res) => {
  try {
    const books = await Book.find();
    res.status(200).json({ success: true, data: books });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get book by ID
export const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }
    res.status(200).json({ success: true, data: book });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create new book
export const createBook = async (req, res) => {
  try {
    const { title, isbn, author, edition } = req.body;
    const book = new Book({ title, isbn, author, edition });
    await book.save();
    res.status(201).json({ success: true, data: book });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update book
export const updateBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }
    res.status(200).json({ success: true, data: book });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete book
export const deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }
    res.status(200).json({ success: true, message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

import Book from '../models/Book.js';
import logger from '../utils/logger.js';
import { checkBookDependencies, createDependencyConflictError } from '../utils/dependencyChecker.js';

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
    logger.info('Creating new book', { title, isbn });
    const book = new Book({ title, isbn, author, edition });
    await book.save();
    logger.success('Book created', { bookId: book._id, title: book.title });
    res.status(201).json({ success: true, data: book });
  } catch (error) {
    logger.error('Error creating book', error);
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
    logger.info('Deleting book', { bookId: req.params.id });
    
    // Check for dependencies
    const dependencies = await checkBookDependencies(req.params.id);
    if (dependencies.hasDependencies) {
      const error = createDependencyConflictError('Book', req.params.id, dependencies);
      logger.warn('Cannot delete book - has dependencies', { bookId: req.params.id, count: dependencies.count });
      return res.status(409).json({
        success: false,
        code: error.code,
        message: error.message,
        details: error.details
      });
    }
    
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) {
      logger.warn('Book not found for deletion', { bookId: req.params.id });
      return res.status(404).json({ success: false, message: 'Book not found' });
    }
    logger.success('Book deleted', { bookId: book._id, title: book.title });
    res.status(200).json({ success: true, message: 'Book deleted successfully' });
  } catch (error) {
    logger.error('Error deleting book', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

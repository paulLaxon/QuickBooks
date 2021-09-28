const express = require('express'); // framework for middleware
const catchAsync = require('../utils/catch_async');
const validateBook = require('../public/javascript/validate_book');
const Book = require('../models/book');
const router = express.Router();
const { isLoggedIn } = require('../middleware');

router.get('/', isLoggedIn, catchAsync(async (req, res) => {
  const books = await Book.find({});
  res.render('books/index', { books })
}))

router.get('/new',isLoggedIn, async (req, res) => {
  res.render('books/new');
})

router.post('/', isLoggedIn, validateBook, catchAsync(async (req, res, next) => {
  const book = new Book(req.body.book);
  await book.save();
  req.flash('success', 'Successfully added a new book.')
  res.redirect(`/books/${book._id}`)
}))

router.get('/:id', catchAsync(async (req, res) => {
  const book = await Book.findById(req.params.id)
  if(!book) {
    req.flash('error', 'Cannot find that book.');
    res.redirect('/books');
  }
  res.render('books/show', { book });
}))

router.get('/:id/edit', isLoggedIn, catchAsync(async (req, res) => {
  const book = await Book.findById(req.params.id)
  res.render('books/edit', { book });
}))

router.put('/:id', isLoggedIn, validateBook, catchAsync(async(req, res) => {
  const { id } = req.params;
  const book = await Book.findByIdAndUpdate(id, { ...req.body.book });
  req.flash('success', 'Successfully updated the book.')
  res.redirect(`/books/${book._id}`)
}))

router.delete('/:id', isLoggedIn, catchAsync(async(req, res) => {
  const { id } = req.params;
  const book = await Book.findById(id);
  await Book.findByIdAndDelete(id);
  req.flash('success', `Successfully deleted the book '${book.title}' by ${book.author}.`)
  res.redirect('/books');
}))

module.exports = router;
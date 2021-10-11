const express = require('express'); // framework for middleware
const catchAsync = require('../utils/catch_async');
const validateBook = require('../public/javascript/validate_book');
const Book = require('../models/book');
const router = express.Router();
const { isLoggedIn } = require('../middleware');
const bookController = require('../controllers/book_controller');

router.route('/')
  .get(isLoggedIn, catchAsync(bookController.index))
  .post(isLoggedIn, validateBook, catchAsync(bookController.saveNewBook))

router.get('/new',isLoggedIn, bookController.renderNewForm)

router.route('/:id')
  .get(catchAsync(bookController.showBook))
  .put(isLoggedIn, validateBook, catchAsync(bookController.updateBook))
  .delete(isLoggedIn, catchAsync(bookController.deleteBook))

router.get('/:id/edit', isLoggedIn, catchAsync(bookController.renderEditForm))

module.exports = router;
const Book = require('../models/book');

module.exports.index = async (req, res) => {
  const books = await Book.find({});
  res.render('books/index', { books })
}

module.exports.saveNewBook = async (req, res, next) => {
  const book = new Book(req.body.book);
  await book.save();
  req.flash('success', 'Successfully added a new book.')
  res.redirect(`/books/${book._id}`)
}

module.exports.renderNewForm = async (req, res) => {
  res.render('books/new');
}

module.exports.showBook = async (req, res) => {
  const book = await Book.findById(req.params.id)
  if(!book) {
    req.flash('error', 'Cannot find that book.');
    res.redirect('/books');
  }
  res.render('books/show', { book });
}

module.exports.updateBook = async(req, res) => {
  const { id } = req.params;
  const book = await Book.findByIdAndUpdate(id, { ...req.body.book });
  req.flash('success', 'Successfully updated the book.')
  res.redirect(`/books/${book._id}`)
}

module.exports.deleteBook = async(req, res) => {
  const { id } = req.params;
  const book = await Book.findById(id);
  await Book.findByIdAndDelete(id);
  req.flash('success', `Successfully deleted the book '${book.title}' by ${book.author}.`)
  res.redirect('/books');
}

module.exports.renderEditForm = async (req, res) => {
  const book = await Book.findById(req.params.id)
  res.render('books/edit', { book });
}

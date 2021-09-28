const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BookSchema = new Schema({
  title: String,
  author: String,
  isbn: String,
  image: String,
  type: String,
  genre: String,
  publisher: String,
  description: String
});

module.exports = mongoose.model('Book', BookSchema);

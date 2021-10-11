const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PageSchema = new Schema({
  url: String,
  browser: String,
});

module.exports = mongoose.model('Page', PageSchema);

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
  books: [
    {
      type: Schema.Types.ObjectId,
      ref: 'OrderItem'
    }
  ],
  date: Date,
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
});

module.exports = mongoose.model('Order', OrderSchema);

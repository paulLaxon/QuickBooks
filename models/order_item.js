const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderItemSchema = new Schema({
  book: {
    type: Schema.Types.ObjectId,
    ref: 'Book'
  },
  price: Number,
  quantity: {
    type: Number,
    default: 1,
  },
  vendor: {
    type: String,
    default: 'Amazon',
  }
});

module.exports = mongoose.model('OrderItem', OrderItemSchema);

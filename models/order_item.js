const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderItemSchema = new Schema({
  book: {
    type: Schema.Types.ObjectId,
    ref: 'Book'
  },
  price: Number,
  quantity: Number,
  vendor: String,
});

module.exports = mongoose.model('OrderItem', OrderItemSchema);

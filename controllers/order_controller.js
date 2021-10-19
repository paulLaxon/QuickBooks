const Order = require('../models/order');
const OrderItem = require('../models/order_item');
const Book = require('../models/book');

module.exports.index = async (req, res) => {
  const orders = await Order.find({ owner: req.user._id });
  let sumPrices = [];
  for (let order of orders) {
    await order.populate({
      path: 'books',
    });

    let cost = totalCost(order.books);
    sumPrices.push(cost);
  }
  res.render('orders/index', { orders, sumPrices })
}

module.exports.renderNewOrderForm = async (req, res) => {
  const orderItems = [];
  res.render('orders/new', { orderItems });
}

module.exports.saveNewOrder = async (req, res, next) => {
  const items = req.body;
  const itemsSize = items.orderItem.book.title.length;
  const books = [];
  for (let i = 0; i < itemsSize; i++) {
    let newBook = new Book({
      title: items.orderItem.book.title[i],
      author: items.orderItem.book.author[i],
      isbn: items.orderItem.book.isbn[i],
    });
    await newBook.save();

    const amount = parseFloat(items.orderItem.price[i].replace('$', '').replace(',', ''));

    let newItem = new OrderItem({
      book: newBook,
      price: amount,
      vendor: items.orderItem.vendor[i],
    });
    await newItem.save();
    books.push(newItem);
  }
    const order = new Order({
    books: books,
    owner: req.user._id,
  });
  console.log(`Attempting to save order: ${order}`);
  await order.save();
  req.flash('success', 'Successfully added a new order.');
  res.redirect(`/orders/${order._id}`);
}

module.exports.showOrder = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if(!order) {
    req.flash('error', 'Cannot find that order.');
    res.redirect('/orders');
  }
  
  await order.populate({
    path: 'books',
    populate: {
      path: 'book',
      select: {
        title: 1, author: 1, isbn: 1
      }
    }
  });

  const sumPrices = totalCost(order.books);
  res.render('orders/show', { order, sumPrices });
}

module.exports.updateOrder = async(req, res) => {
  const { id } = req.params;
  const ord = await Order.findById(id);
  if (!ord.owner.equals(req.user._id)) {
    res.redirect('/login');
  }

  console.log("Attempting to update");
  const order = await Order.findByIdAndUpdate(id, { ...req.body.order });
  req.flash('success', 'Successfully updated the order.')
  res.redirect(`/orders/${order._id}`)
}

module.exports.deleteOrder = async(req, res) => {
  const { id } = req.params;
  const order = await Order.findById(id);
  await Order.findByIdAndDelete(id);
  req.flash('success', `Successfully deleted the order '${order.title}' by ${order.author}.`)
  res.redirect('/orders');
}

function totalCost(items) {
  let cost = 0;
  for (let item of items) {
    cost += item.price * item.quantity;
  }
  return cost;
}

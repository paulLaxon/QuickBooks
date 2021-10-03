const Order = require('../models/order');
const scraperObject = require('../scraper/browser');

module.exports.index = async (req, res) => {
  const orders = await Order.find({});
  let sumPrices = [];
  for (let order of orders) {
    await order.populate({
      path: 'books',
      populate: {
        path: 'book',
        select: {
          title: 1, author: 1, isbn: 1
        }
      }
    });

    let cost = totalCost(order.books);
    sumPrices.push(cost);
  }
  res.render('orders/index', { orders, sumPrices })
}

module.exports.renderNewOrderForm = async (req, res) => {
  res.render('orders/new', { scraperObject:scraperObject.startBrowser });
}

module.exports.saveNewOrder = async (req, res, next) => {
  const order = new Order(req.body.order);
  order.owner = req.user._id;
  await order.save();
  req.flash('success', 'Successfully added a new order.')
  res.redirect(`/orders/${order._id}`)
}

module.exports.showOrder = async (req, res) => {
  const order = await (await Order.findById(req.params.id))
    .populate({
      path: 'books',
      populate: {
        path: 'book',
        select: {
          title: 1, author: 1, isbn: 1
        }
      }
    });
  if(!order) {
    req.flash('error', 'Cannot find that order.');
    res.redirect('/orders');
  }
  const sumPrices = totalCost(order.books);
  res.render('orders/show', { order, sumPrices });
}

module.exports.updateOrder = async(req, res) => {
  const { id } = req.params;
  const ord = await Order.findById(id);
  if (!ord.owner.equals(req.user._id)) {
    res.redirect('/login');
  }
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

function totalCost(books) {
  let cost = 0;
  for (let book of books) {
    cost += book.price * book.quantity;
  }
  return cost;
}

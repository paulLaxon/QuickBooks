const express = require('express'); // framework for middleware
const catchAsync = require('../utils/catch_async');
const orderController = require('../controllers/order_controller');
const Order = require('../models/order');
const OrderItem = require('../models/order_item'); // needed to show an order
const router = express.Router();
const { isLoggedIn, isOwner } = require('../middleware');
const book = require('../models/book');

router.route('/')
  .get(isLoggedIn, catchAsync(orderController.index))
  .post(isLoggedIn, catchAsync(orderController.saveNewOrder))

router.get('/new', isLoggedIn, orderController.renderNewOrderForm)

router.route('/:id')
  .get(isLoggedIn, isOwner, catchAsync(orderController.showOrder))
  .put(isLoggedIn, isOwner, catchAsync(orderController.updateOrder))
  .delete(isLoggedIn, isOwner, catchAsync(orderController.deleteOrder))

module.exports = router;

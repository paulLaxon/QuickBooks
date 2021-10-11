const express = require('express'); // framework for middleware
const catchAsync = require('../utils/catch_async');
const pageController = require('../controllers/page_controller');
const Page = require('../models/page');
const router = express.Router();
const { isLoggedIn } = require('../middleware');

router.route('/')
  .post(isLoggedIn, catchAsync(pageController.pageOptions))
  // .post(isLoggedIn, catchAsync(pageController.closeBrowser))
  // .post(isLoggedIn, catchAsync(pageController.gotoUrl))
  // .post(isLoggedIn, catchAsync(pageController.scrapePage))

module.exports = router;

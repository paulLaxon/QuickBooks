const express = require('express'); // framework for middleware
const router = express.Router();
const catchAsync = require('../utils/catch_async');
const userController = require('../controllers/user_controller');
const passport = require('passport');

router.route('/register')
  .get(userController.renderRegistrationPage)
  .post(catchAsync(userController.saveNewUser))

router.route('/login')
  .get(userController.renderLoginPage)
  .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), userController.loginUser)

router.get('/logout', userController.logoutUser)

module.exports = router;

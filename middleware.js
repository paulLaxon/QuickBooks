const Order = require('./models/order');

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalURL;
    req.flash('error', 'You must be signed in');
    return res.redirect('/login');
  }
  next();
}

module.exports.isOwner = async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order.owner.equals(req.user._id)) {
    req.flash('error', 'You do not have permission to do that.');
    return res.redirect('/books');
  }
  next();
}

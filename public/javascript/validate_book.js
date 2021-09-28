const { bookSchema } = require('../../joi_schemas');
const ExpressError = require('../../utils/express_error');

module.exports = (req, res, next) => {
  const { error } = bookSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(', ')
    throw new ExpressError(400, msg)
  } else {
    next();
  }
}

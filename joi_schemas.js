const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

const extension = (joi) => ({
  type: 'string',
  base: joi.string(),
  messages: {
    'string.escapeHTML': '{{#label}} must not include HTML!'
  },
  rules: {
    escapeHTML: {
      validate(value, helpers) {
        const clean = sanitizeHtml(value, {
          allowedTags: [],
          allowedAttributes: {},
        });
        if (clean !== value) return helpers.error('string.escapeHTML', { value })
        return clean;
      }
    }
  }
});

const Joi = BaseJoi.extend(extension);

module.exports.bookSchema = Joi.object({
  book: Joi.object({
    title: Joi.string().required().escapeHTML(),
    author: Joi.string().required().escapeHTML(),
    isbn: Joi.string().length(13).required().escapeHTML(), // see wikipedia isbn for check-sum
    type: Joi.string().allow(null, '').escapeHTML(),
    description: Joi.string().allow(null, '').escapeHTML(),
    publisher: Joi.string().allow(null, '').escapeHTML(),
    image: Joi.string().allow(null, '').escapeHTML()  
  }).required()
});

module.exports.orderSchema = Joi.object({
  order: Joi.object({
    date: Joi.string().required().escapeHTML(),
    owner: Joi.string().required().escapeHTML(),
  }).required()
});

module.exports.orderItemSchema = Joi.object({
  orderItem: Joi.object({
    quantity: Joi.number().min(1).required(),
    price: Joi.number().min(0).required(),
    owner: Joi.string().required().escapeHTML(),
  }).required()
});

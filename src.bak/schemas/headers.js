const Joi = require('joi');

const contentType = {
  applicationJSON: Joi.string().required().valid('application/json'),
};
const authorization = Joi.string()
// eslint-disable-next-line max-len
    .pattern(new RegExp('^Bearer [A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+\/=]*$'))
    .required();

module.exports = {
  contentType,
  authorization,
};

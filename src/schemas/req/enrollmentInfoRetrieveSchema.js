const Joi = require('joi');
const {authorization, contentType} = require('../headers');

const headersSchema = Joi.object({
  'authorization': authorization,
  'content-type': contentType.applicationJSON,
});

const bodySchema = Joi.object({
  'id_card': Joi.string().required().length(13),
  'requester': Joi.string().required(),
  'info_type': Joi.string().valid('text', 'photo', 'all').required(),

});

module.exports = {
  headersSchema,
  bodySchema,
};

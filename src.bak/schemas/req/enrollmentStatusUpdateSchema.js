const Joi = require('joi');
const {authorization, contentType} = require('../headers');

const headersSchema = Joi.object({
  'authorization': authorization,
  'content-type': contentType.applicationJSON,
});

const bodySchema = Joi.object({
  'id_card': Joi.string().required().length(13),
  'requester': Joi.string().required(),
  'status': Joi.string().required(),

});

module.exports = {
  headersSchema,
  bodySchema,
};

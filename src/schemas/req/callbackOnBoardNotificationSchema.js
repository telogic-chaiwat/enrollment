const Joi = require('joi');
const {contentType} = require('../headers');

const headersSchema = Joi.object({
  'content-type': contentType.applicationJSON,
});

const bodySchema = Joi.object({
  'node_id': Joi.string().required(),
  'type': Joi.string().required().valid('create_identity_result'),
  'reference_id': Joi.string().required(),
  'request_id': Joi.string().required(),
  'reference_group_code': Joi.string().required(),
  'success': Joi.boolean().required(),
  'error': Joi.object({
    'code': Joi.number().required(),
    'message': Joi.string().required(),
  }).required(),
});

module.exports = {
  headersSchema,
  bodySchema,
};

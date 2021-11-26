const Joi = require('joi');
const {contentType} = require('../headers');

const headersSchema = Joi.object({
  'content-type': contentType.applicationJSON,
});

const bodySchema = Joi.object({
  'node_id': Joi.string().required(),
  'type': Joi.string().required().valid('revoke_identity_association_result'),
  'reference_id': Joi.string().required(),
  'request_id': Joi.string().required(),
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

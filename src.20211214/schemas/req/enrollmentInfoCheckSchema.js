const Joi = require('joi');
const {authorization, contentType} = require('../headers');

const headersSchema = Joi.object({
  'authorization': authorization,
  'content-type': contentType.applicationJSON,
});

const bodySchema = Joi.object({
  'id_card': Joi.string().optional().length(13),
  'requester': Joi.string().required(),
  'reference_group_code': Joi.string().when('id_card', {
    is: Joi.exist(),
    then: Joi.optional(),
    otherwise: Joi.required(),
  }),

});

module.exports = {
  headersSchema,
  bodySchema,
};

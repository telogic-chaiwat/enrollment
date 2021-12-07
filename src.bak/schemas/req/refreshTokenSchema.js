const Joi = require('joi');
const {contentType, authorization} = require('../headers');

/**
 *
 * @param {string} value
 * @param {Joi} helpers
 * @return {string}
 */
function verifyRefreshToken(value, helpers) {
  const {verifyRefreshToken} = require('../../services/authFunctions');
  const validate = verifyRefreshToken(value);

  if (validate.error) {
    if (validate.error === 'invalid' ) {
      return helpers.error('any.invalid');
    }

    throw new Error(validate.error);
  }

  return validate;
}

const headersSchema = Joi.object({
  'content-type': contentType.applicationJSON,
  'authorization': authorization,
});

const bodySchema = Joi.object({
  refreshToken: Joi.string()
  // eslint-disable-next-line max-len
      .pattern(new RegExp('^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+\/=]*$'))
      .custom(verifyRefreshToken)
      .required(),
});


module.exports = {
  headersSchema,
  bodySchema,
};

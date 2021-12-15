const Joi = require('joi');

const headersSchema = Joi.object({
  authorization: Joi.string()
      // eslint-disable-next-line max-len
      .pattern(new RegExp('^Basic (?:[A-Za-z0-9+\/]{4}\\n?)*(?:[A-Za-z0-9+\/]{2}==|[A-Za-z0-9+\/]{3}=)?$'))
      .required()
      .custom(isValidAuthorization, 'require username and password'),
});

const credentialsSchema = Joi.object({
  username: Joi
      .string()
      .required(),

  password: Joi
      .string()
      .required(),
});

/**
 *
 * @param {*} value
 * @param {*} helpers
 * @return {*}
 */
function isValidAuthorization(value, helpers) {
  const base64Credentials = value.split(' ')[1];
  const credentials = Buffer
      .from(base64Credentials, 'base64').toString('ascii');
  const [username, password] = credentials.split(':');

  const valid = credentialsSchema.validate(
      {'username': username, 'password': password});
  if (valid.error) {
    return helpers.error(valid.error.message);
  }

  return valid;
}

module.exports = {
  headersSchema,
};

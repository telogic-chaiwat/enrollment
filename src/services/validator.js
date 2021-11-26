/* eslint-disable linebreak-style */
validate = {};
validate.paramsBySchema = function(schema, data, fields) {
  let dataValidation = {};

  if (fields && fields != '') {
    const fieldsArr = fields.trim('').split(',');
    fieldsArr.map((value) => dataValidation[value] = data[value]);
  } else if (data) {
    dataValidation = data;
  } else if (schema.validate) {
    return {error: 'can`t validate undefined schema'};
  } else {
    return {error: 'param fields undefine'};
  }

  return schema.validate(dataValidation);
};

module.exports = {
  validate,
};

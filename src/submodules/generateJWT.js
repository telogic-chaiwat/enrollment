module.exports.generateJWT = async function() {
  const jwt = require('jsonwebtoken');

  const defaultPayLoad ={
    sub: 'KONG_NDID_AIS',
    name: 'AWN',
    iat: 1598860800,
    iss: 'IOmapcmdL0N7hvNXIyYMoKCSOQazozmI',
  };
  const secretAccess = this.utils().app().const('jwtSecretKey');

  const signResult = jwt.sign(
      (this.req.payLoadNDID)?this.req.payLoadNDID:defaultPayLoad,
      secretAccess);

  return signResult;
};

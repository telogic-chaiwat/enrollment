module.exports.hashMD5 = function(str) {
  const crypto = require('crypto');
  const hash = crypto.createHash('md5').update(str).digest('hex');
  return hash;
};

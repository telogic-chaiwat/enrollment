module.exports.encodeBase64 = function(str) {
  return Buffer.from(str).toString('base64');
};

module.exports.decodeBase64 = function(str) {
  const buff = Buffer.from(str, 'base64');
  return buff.toString('utf8');
};

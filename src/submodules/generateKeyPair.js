module.exports.generateKey = function() {
  return new Promise((resolve, reject)=>{
    const confKey = this.utils().app().conf('key_pair_config');
    const defaultConfig = {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'pkcs1',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs1',
        format: 'pem'
      }
    };
    const {generateKeyPair} = require('crypto');
    generateKeyPair('rsa', confKey || defaultConfig,
        (err, publicKey, privateKey) => {
          // Handle errors and use the generated key pair.

          if (err) {
            this.debug('error generet key: ' + err.message);
            resolve({
              publicKey: '',
              privateKey: '',
            });
          }
          resolve({
            publicKey: publicKey,
            privateKey: privateKey,
          });
        });
  });
};

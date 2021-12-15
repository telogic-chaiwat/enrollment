module.exports.generateKey = function() {
  return new Promise((resolve, reject)=>{
    const confKey = this.utils().app().conf('key_pair_config');
    const defaultConfig = {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
        cipher: 'aes-256-cbc',
        passphrase: 'top secret',
      },
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

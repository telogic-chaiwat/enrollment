
// eslint-disable-next-line prefer-const
let caCertValue = {};
module.exports.caCertValue = caCertValue;

module.exports.loadCaCert = function(services, self) {
  const fs = require('fs');
  // eslint-disable-next-line prefer-const

  for (const [keyService, valueService] of Object.entries(services)) {
    for (const [keyCommand, valueCommand] of Object.entries(valueService)) {
      // eslint-disable-next-line prefer-const
      let options = {};
      if (valueCommand['conn_type'] == 'https') {
        try {
          if (valueCommand['ca-cert']) {
            options['ca'] = fs.readFileSync(valueCommand['ca-cert']);

            // eslint-disable-next-line max-len
            self.debug('successful load ca-cert for ->' + keyService +'.'+keyCommand);
          }
        } catch (err) {
          // eslint-disable-next-line max-len
          self.error('Error read ca-cert -> '+ keyService +'.'+keyCommand+' file : '+ err);
        }

        try {
          let cert = null;
          let key = null;
          if (valueCommand.clientCert && valueCommand.clientCert.cert) {
            cert = fs.readFileSync(valueCommand.clientCert.cert);
            // eslint-disable-next-line max-len
            self.debug('successful load cert for ->' + keyService +'.'+keyCommand);
          }
          if (valueCommand.clientCert && valueCommand.clientCert.key) {
            key = fs.readFileSync(valueCommand.clientCert.key);
            // eslint-disable-next-line max-len
            self.debug('successful load key for ->' + keyService +'.'+keyCommand);
          }

          if (cert && key) {
            options['cert'] = cert;
            options['key'] = key;
          } else {
            if (cert || key) {
              // eslint-disable-next-line max-len
              self.error('Error missing one of cert or key file, canceling load cert and key');
            }
          }
        } catch (err) {
          // eslint-disable-next-line max-len
          self.error('Error read client certificate (cert or key) file : '+ err);
        }

        // eslint-disable-next-line max-len
        if (Object.keys(options).length != 0 && options.constructor === Object) {
          if (caCertValue[keyService]==null) {
            caCertValue[keyService] = {};
          }
          caCertValue[keyService][keyCommand] = options;
          // self.debug('load '+ JSON.stringify(options));
        }
      }
    }
  }

  /*


    */
};

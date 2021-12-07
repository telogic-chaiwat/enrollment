module.exports.createHttpsAgent = function(service, command) {
  const https = require('https');
  const conf = this.utils().services(service).
      conf(command);
  const {caCertValue} = require('./../services/loadCaCert');


  if (conf && conf.conn_type && conf.conn_type == 'https') {
    // eslint-disable-next-line prefer-const
    let options = {};

    if (conf.rejectUnauthorized != null) {
      Object.assign(options, {rejectUnauthorized: conf.rejectUnauthorized});
    }

    // eslint-disable-next-line max-len
    if (Object.keys(caCertValue).length != 0 && caCertValue.constructor === Object) {
      if (caCertValue[service]&& caCertValue[service][command]) {
        Object.assign(options, caCertValue[service][command]);
      }
    }

    const agent = new https.Agent(options);
    return agent;
  } else {
    return null;
  }
};


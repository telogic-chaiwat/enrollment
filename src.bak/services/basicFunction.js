/* eslint-disable max-len */

module.exports.buildNewSession = function(req, appName) {
  // return req.headers['x-tid'];
  let session = (req.headers['x-session-id'])?
        req.headers['x-session-id'] :'';
  session += ':';
    (req.headers['x-rtid'])?session+= req.headers['x-rtid']:'';
    session += ':';
    const initInvoke = generateXTid(appName);
    session+= initInvoke;
    return session;
};


const generateXTid = (nodeName) => {
  const dateFormat = require('dateformat');
  const now = new Date();
  const date = dateFormat(now, 'yymmdd');
  let commandId = nodeName + '-' + date;
  const remaininglength = 12;
  commandId += randomstring(remaininglength);
  return commandId;
};
module.exports.generateXTid = generateXTid;

const randomstring = (index, appLog) => {
  const randomstring = require('randomstring');
  return randomstring.generate(index);
};

exports.loggingWhenWhitelist = function(req, res, options) {
  const onFinished = require('on-finished');
  const appName = 'enroll';
  const cmd = 'unknown';
  const identity = req.body.reference_id || '';
  const detail = req.rodSession.detail(req.invoke, cmd, identity);
  const summary = req.rodSession.summary(req.invoke, cmd, identity);
  let rawData = null;
  if (detail.isRawDataEnabled()) {
    rawData = Object.keys(req.body).length === 0 ? null : JSON.stringify(req.body);
  }
  detail.addInputRequest('client', cmd, req.invoke,
      rawData,
      {
        Headers: req.headers,
        Url: req.url,
        QueryString: Object.keys(req.query).length === 0 ? null : req.query,
        Body: Object.keys(req.body).length === 0 ? null : req.body,
      },
      req.protocol, req.method);
  summary.addErrorBlock('ndid', cmd, null,
      'invalid=ip');
  req.rodSession.stat(appName+' received unknown_ip request');
  onFinished(res, function(err, res) {
    req.rodSession.stat(appName+' returned unknown_ip error');
    if ( detail ) {
      let rawData = null;
      if (detail.isRawDataEnabled() ) {
        if (res.body) {
          rawData = typeof res.body === 'string' ? res.body : JSON.stringify(res.body);
        }
      }
      detail.addOutputResponse('client', cmd, detail.InitInvoke,
          rawData,
          {
            Header: res.getHeaders(),
            Body: res.body || null,
          });

      if (typeof detail._async !== 'function' || detail._async()!==true) {
        try {
          detail.end();
        } catch (e) {
          req.rodSession.error(e);
        }
      }
    }

    const summary = req.rodSession.summary();
    if ( summary && !summary.isEnd() && summary._async!==true ) {
      let responseResult = null;
      let responseDesc = null;
      if ( typeof res.body === 'object') {
        responseResult = res.body.resultCode;
        responseDesc = res.body.developerMessage;
      }
      req.rodSession.summary().end(responseResult, responseDesc);
    }

    if ( req.rodSession._cbWaitFinished ) {
      req.rodSession._cbWaitFinished();
    }
  });
};

/* eslint-disable max-len */
module.exports.validateHeader = async function(appName, nodeCmd, headersReqSchema, keyparams) {
  const parseErrorMulti = this.utils().submodules('parseError')
      .modules('parseErrorMulti');
  const status = this.utils().services('enum').
      modules('status');
  const buildResponse = this.utils().submodules('buildResponse')
      .modules('buildResponse');
  const validator = this.utils().services('validator').
      modules('validate.paramsBySchema');


  const validateHeaderReq = validator(headersReqSchema, this.req.headers,
      keyparams || 'authorization,content-type');
  const invalids = [validateHeaderReq.error].filter(Boolean);
  if (invalids.length > 0) {
    const errorString = parseErrorMulti(invalids);
    this.summary().addErrorBlock('client', nodeCmd, null,
        errorString);
    this.debug('invalid request headers params with error message' +
              validateHeaderReq.error);

    this.stat(appName + ' received ' + nodeCmd + ' request');
    this.stat(appName+' returned '+nodeCmd+' error invalid_or_missing_parameter');
    const response = buildResponse(status.MISSING_INVALID_PARAMETER);
    return response;
  }
  return null;
};


/* eslint-disable max-len */
module.exports.validateBody = async function(appName, nodeCmd, bodyReqSchema) {
  const parseErrorMulti = this.utils().submodules('parseError')
      .modules('parseErrorMulti');
  const status = this.utils().services('enum').
      modules('status');
  const buildResponse = this.utils().submodules('buildResponse')
      .modules('buildResponse');
  const validator = this.utils().services('validator').
      modules('validate.paramsBySchema');

  const validateBodyReq = validator(bodyReqSchema, this.req.body);
  invalids = [validateBodyReq.error].filter(Boolean);
  if (invalids.length > 0) {
    const errorString = parseErrorMulti(invalids);
    this.summary().addErrorBlock('client', nodeCmd, null,
        errorString);
    this.debug('invalid body params with error message ' +
              validateBodyReq.error);
    this.stat(appName + ' received ' + nodeCmd + ' request');
    this.stat(appName+' returned '+nodeCmd+' error invalid_or_missing_parameter');
    const response = buildResponse(status.MISSING_INVALID_PARAMETER);
    return response;
  }
  return null;
};



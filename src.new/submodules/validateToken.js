/* eslint-disable max-len */
module.exports.validateToken = async function(appName, nodeCmd) {
  const verifyAccessToken = this.utils().services('authFunctions').
      modules('verifyAccesToken');
  const status = this.utils().services('enum').
      modules('status');
  const buildResponse = this.utils().submodules('buildResponse')
      .modules('buildResponse');
  const validateToken = await verifyAccessToken(this.req.headers.authorization);
  const invalids = [validateToken.error].filter(Boolean);
  if (invalids.length > 0) {
    this.summary().addErrorBlock('client', nodeCmd, null,
        'unauthorized');
    this.debug('invalid token with error message ' + validateToken.error);

    this.stat(appName + ' received ' + nodeCmd + ' request');

    this.stat(appName+' returned '+nodeCmd+' error unauthorized');
    const response = buildResponse(status.ACCESS_DENIED);
    return response;
  }
  return null;
};

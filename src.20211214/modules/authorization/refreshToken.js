/* eslint-disable no-invalid-this */
const ObjectID = require('mongodb').ObjectID;

module.exports.NAME = async function(req, res) {
  const jwt = require('jsonwebtoken');
  const secretAccess = this.utils().services('authConfig')
      .modules('secret_access');
  const secretRefresh = this.utils().services('authConfig')
      .modules('secret_refresh');
  const mongoUpdate = this.utils().services('mongoFunction').modules('update');
  const status = this.utils().services('enum').modules('status');
  // eslint-disable-next-line max-len
  const collectionName = this.utils().services('enum').modules('collectionMongo');

  const headersReqSchema =this.utils().
      schemas('req.refreshTokenSchema.headersSchema');
  const bodyReqSchema =this.utils().
      schemas('req.refreshTokenSchema.bodySchema');

  const authTokens = this.utils()
      .services('authFunctions').modules('authTokens');
  const buildResponse = this.utils().submodules('buildResponse')
      .modules('buildResponse');

  const parseErrorMulti = this.utils().submodules('parseError')
      .modules('parseErrorMulti');
  const validator = this.utils().services('validator').
      modules('validate.paramsBySchema');

  const appName = 'enroll';
  this.appName = appName;
  const cmdDetail = 'refresh_token';
  const conf = this.utils().services('authFunctions').conf('authUser');

  let response;

  let that = this;
  /**
   *
   */
  function statBadAuth() {
    that.stat(appName + ' received bad ' + cmdDetail + ' request');
    that.stat(appName + ' returned ' + cmdDetail + ' error');
  }


  const refreshToken = req.body.refreshToken;
  const authorization = req.headers.authorization;
  const validateHeaderReq = validator(headersReqSchema, req.headers,
      'authorization,content-type');
  const validateBodyReq = validator(bodyReqSchema, req.body);

  let invalids = [validateHeaderReq.error].filter(Boolean);

  if (invalids.length > 0) {
    const errorString = parseErrorMulti(invalids);
    this.commonLog(req, cmdDetail);
    this.summary().addErrorBlock('client', cmdDetail, null,
        errorString);
    statBadAuth();
    response = buildResponse(status.ACCESS_DENIED);
    return res.status(response.status).send(response.body);
  }

  /**
   * @param {*} res response
   * @return {response} response http
   */
  function handleSystemError(res) {
    that.stat(appName + ' returned ' + cmdDetail + ' system error');
    response = buildResponse(status.SYSTEM_ERROR);
    return res.status(response.status).send(response.body);
  }

  /**
   * @param {*} res  response
   */
  function handleDBError() {
    that.stat(appName + ' returned ' + cmdDetail + ' system error');
  }
  /**
   * @param {response} res use to response
   * @return {response}
   */
  function handleUpdateError(res) {
    handleDBError();
    response = buildResponse(status.DB_UPDATE_ERROR);
    return res.status(response.status).send(response.body);
  }

  invalids = [validateBodyReq.error].filter(Boolean);

  let decoded;
  if (invalids.length > 0) {
    const errorString = parseErrorMulti(invalids);
    decoded = validateBodyReq.value.refreshToken &&
              validateBodyReq.value.refreshToken.decoded;
    if (decoded && decoded.id) {
      this.commonLog(req, cmdDetail, decoded.id);
    } else {
      this.commonLog(req, cmdDetail);
    }

    this.summary().addErrorBlock('client', cmdDetail, null,
        errorString);
    statBadAuth();
    response = buildResponse(status.ACCESS_DENIED);
    return res.status(response.status).send(response.body);
  }

  decoded = validateBodyReq.value.refreshToken.decoded;
  this.commonLog(req, cmdDetail, decoded.id);

  this.summary().addSuccessBlock('client', cmdDetail, null, 'Success');
  this.stat(appName + ' received ' + cmdDetail +' request');

  let accessToken;
  try {
    accessToken = authorization.split(' ')[1];
  } catch (error) {
    this.error('split authorization error ' + error);
  }

  authTokens(accessToken, refreshToken, decoded.id, async (err, doc) => {
    if (err) {
      if (err === status.DB_ERROR) {
        handleDBError();
      } else if (err == status.DATA_NOT_FOUND) {
        that.stat(appName + ' returned ' + cmdDetail + ' error');
        // that.summary().addErrorBlock(nodeName,
        //     cmdDetail, null, 'data not found');
      } else {
        return handleSystemError(res);
      }

      response = buildResponse(err);
      return res.status(response.status).send(response.body);
    } else {
      const accessTokenExpired =
                  +(conf.access_token_exp || '86400');
      const refreshTokenExpired =
                  +(conf.refresh_token_exp || '172800');
      const accToken = jwt.sign({'id': doc._id,
        'kind': 'access_token'},
      secretAccess, {expiresIn: accessTokenExpired});
      const refrToken = jwt.sign({'id': doc._id,
        'kind': 'refresh_token'}, secretRefresh,
      {expiresIn: refreshTokenExpired});
      // this.summary()
      //    .addSuccessBlock(nodeName, cmdDetail, null, 'success');

      const data = {
        $set: {
          accessToken: accToken,
          refreshToken: refrToken,
          refresh_at: new Date(),
        },
      };

      const initInvoke = this.detail().InitInvoke;
      const optionAttribut = {
        collection: collectionName.CREDENTIAL,
        commandName: 'update_credential',
        invoke: initInvoke,
        selector: {'_id': new ObjectID(doc._id)},
        update: data,
        max_retry: conf.max_retry,
        timeout: (conf.timeout*1000),
        options: {upsert: false},
        retry_condition: conf.retry_condition,
      };

      const updateResponse =
                await mongoUpdate(this, optionAttribut);

      if (updateResponse && updateResponse === 'error') {
        that.debug('error on update');
        that = this;
        return handleUpdateError(res);
      }

      this.stat(appName + ' returned ' + cmdDetail + ' success');

      response = {
        status: status.SUCCESS.HTTP_STATUS,
        body: {
          'resultCode': status.SUCCESS.RESULT_CODE,
          'developerMessage': status.SUCCESS.DEVELOPER_MESSAGE,
          'resultData': [
            {
              'tokenType': 'Bearer',
              'accessToken': accToken,
              'refreshToken': refrToken,
              'expiresIn': accessTokenExpired,
            },
          ],
        },
      };

      res.status(response.status).send(response.body);

      // MAKE SURE YOU HAVE TO ADD THIS LINE AFTER send response
      await this.waitFinished();
    }
  });
};

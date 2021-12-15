/* eslint-disable new-cap */
/* eslint-disable no-invalid-this */
const ObjectID = require('mongodb').ObjectID;

/**
 * @param {*} req  http request
 * @param {*} res  http response
 */
module.exports.getToken = async function(req, res) {
  const jwt = require('jsonwebtoken');
  const secretAccess = this.utils().services('authConfig')
      .modules('secret_access');
  const secretRefresh = this.utils().services('authConfig')
      .modules('secret_refresh');
  const mongoUpdate = this.utils().services('mongoFunction').modules('update');
  const status = this.utils().services('enum').modules('status');
  // eslint-disable-next-line max-len
  const collectionName = this.utils().services('enum').modules('collectionMongo');
  // const collectionName = require('../../enum/collectionMongo');
  const headersSchema = this.utils().
      schemas('req.getTokenSchema.headersSchema');
  const appName = 'enroll';
  this.appName = appName;
  const cmdDetail = 'get_token';
  const conf = this.utils().services('authFunctions').conf('authUser');
  const authUser = this.utils().services('authFunctions').modules('authUser');
  const buildResponse = this.utils().submodules('buildResponse')
      .modules('buildResponse');
  const parseErrorMulti = this.utils().submodules('parseError')
      .modules('parseErrorMulti');
  const validator = this.utils().services('validator').
      modules('validate.paramsBySchema');

  const that = this;

  /**
   * @return {response} http response
   */
  function invalidOrMissingReturn() {
    that.stat(appName + ' received bad ' + cmdDetail + ' request');
    that.stat(appName + ' returned ' + cmdDetail + ' error');
    response = buildResponse(status.MISSING_INVALID_PARAMETER);
    return res.status(response.status).send(response.body);
  }

  const validateHeaderReq = validator(headersSchema, req.headers,
      'authorization');
  const invalids = [validateHeaderReq.error].filter(Boolean);
  if (invalids.length > 0) {
    this.commonLog(req, cmdDetail);
    const errorString = parseErrorMulti(invalids);
    this.summary().addErrorBlock('client', cmdDetail, null,
        errorString);

    return invalidOrMissingReturn();
  }

  const base64Credentials = req.headers.authorization.split(' ')[1];
  const credentials = Buffer
      .from(base64Credentials, 'base64').toString('ascii');
  const [username, password] = credentials.split(':');
  this.commonLog(req, cmdDetail, username);
  that.stat(appName + ' received ' + cmdDetail + ' request');

  /**
   * @param {response} res use to response
   * @return {response}
   */
  function handleSystemError(res) {
    response = buildResponse(status.SYSTEM_ERROR);
    that.stat(appName + ' returned ' + cmdDetail + ' system error');
    // that.summary().addErrorBlock('client', cmdDetail, null, 'system_error');
    return res.status(response.status).send(response.body);
  }

  /**
     *
     * @param {Object} res
     * @return {Response}
     */
  function handleDBError(res) {
    that.stat(appName + ' returned ' + cmdDetail +' system error');
    response = buildResponse(status.DB_ERROR);
    return res.status(response.status).send(response.body);
  }

  this.summary().addSuccessBlock('client', cmdDetail, null, 'success');
  // this.stat(appName + ' returned '+ cmdDetail +' success');

  authUser(username, password, async (err, doc) => {
    if (err) {
      if (err === status.SYSTEM_ERROR) {
        return handleSystemError(res);
      } else if (err === status.DATA_NOT_FOUND) {
        that.stat(appName + ' returned ' + cmdDetail + ' error');
        // this.summary().addErrorBlock('client',
        //     cmdDetail, null, 'data not found');
      } else if (err === status.ACCESS_DENIED) {
        that.stat(appName + ' returned ' + cmdDetail + ' error');
        // this.summary().addErrorBlock('client',
        //     cmdDetail, null, 'unauthorized');
      } else if (err === status.DB_ERROR) {
        return handleDBError(res);
      } else {
        return handleSystemError(res);
      }
      response = buildResponse(err);
      return res.status(response.status).send(response.body);
    }

    const accessTokenExpired = +(conf.access_token_exp || '86400');
    const refreshTokenExpired = +(conf.refresh_token_exp || '172800');
    const accToken = jwt.sign({'id': doc._id, 'kind': 'access_token'},
        secretAccess, {expiresIn: accessTokenExpired});
    const refrToken = jwt.sign({'id': doc._id, 'kind': 'refresh_token'},
        secretRefresh, {expiresIn: refreshTokenExpired});
    const data = {
      $set: {
        accessToken: accToken,
        refreshToken: refrToken,
        login_at: new Date(),
      },
    };

    const initInvoke = this.detail().InitInvoke;
    const optionAttribut = {
      collection: collectionName.CREDENTIAL,
      commandName: 'update_credential',
      invoke: initInvoke,
      selector: {'_id': ObjectID(doc._id)},
      update: data,
      max_retry: conf.max_retry,
      timeout: (conf.timeout*1000),
      options: {upsert: false},
      retry_condition: conf.retry_condition,
    };

    const updateResponse = await mongoUpdate(this, optionAttribut);

    if (updateResponse && updateResponse === 'error') {
      this.debug('error on update');
      return handleDBError(res);
    }

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

    if (response.body.resultCode == '20000') {
      this.stat(appName+' returned ' + cmdDetail +' success');
    } else if (response.body.resultCode == '50000') {
      this.stat(appName+' returned ' + cmdDetail +' system error');
    } else {
      this.stat(appName+' returned ' + cmdDetail +' error');
    }

    res.status(response.status).send(response.body);

    // MAKE SURE YOU HAVE TO ADD THIS LINE AFTER send response
    await this.waitFinished();
  });
};


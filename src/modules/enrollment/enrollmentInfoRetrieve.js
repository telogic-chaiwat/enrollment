module.exports.NAME = async function(req, res, next) {
  const headersReqSchema = this.utils().
      schemas('req.enrollmentInfoRetrieveSchema.headersSchema');
  const bodyReqSchema = this.utils().
      schemas('req.enrollmentInfoRetrieveSchema.bodySchema');
  const validateToken = this.utils().submodules('validateToken').
      modules('validateToken');
  const validateHeader = this.utils().submodules('validateHeader').
      modules('validateHeader');
  const validateBody = this.utils().submodules('validateBody').
      modules('validateBody');
  const status = this.utils().services('enum').
      modules('status');
  const buildResponse = this.utils().submodules('buildResponse')
      .modules('buildResponse');
  const mongoFindOne = this.utils().services('mongoFunction')
      .modules('findOne');
  const collectionName = this.utils().services('enum')
      .modules('collectionMongo');
  const confMongo = this.utils().services('mongo')
      .conf('default');
  const hashMD5 = this.utils().services('hash').
      modules('hashMD5');
  const decodeBase64 = this.utils().services('base64Function')
      .modules('decodeBase64');

  // init detail and summary log
  const nodeCmd = 'enrollment_info_retrieve';
  const appName = 'enroll';
  this.appName = appName;
  const identity = req.body.id_card || '';
  this.commonLog(req, nodeCmd, identity);

  let responseError = await validateHeader(appName, nodeCmd, headersReqSchema);
  if (responseError) {
    res.status(responseError.status).send(responseError.body);
    return;
  }

  responseError = await validateToken(appName, nodeCmd);
  if (responseError) {
    res.status(responseError.status).send(responseError.body);
    return;
  }

  responseError = await validateBody(appName, nodeCmd, bodyReqSchema);
  if (responseError) {
    res.status(responseError.status).send(responseError.body);
    return;
  }

  // success validation input
  this.stat(appName+' received '+nodeCmd+' request');
  this.summary().addSuccessBlock('client', nodeCmd, null, 'success');

  // hash card ID
  const IdCard = req.body.id_card;
  const query = {
    id_card: IdCard,
    status: {$ne: 'terminate'},
  };

  const options = {
    projection: {
      _id: 0,
      msisdn: 1,
      enrollmentInfo: 1,
      livePhoto: 1,

    },
  };
    // query mongo
  const initInvoke = this.detail().InitInvoke;
  const optionAttribut = {
    collection: collectionName.ENROLL_INFORMATION,
    commandName: 'find_enrollment_info',
    invoke: initInvoke,
    query: query,
    options: options,
    max_retry: confMongo.max_retry,
    timeout: (confMongo.timeout*1000),
    retry_condition: confMongo.retry_condition,
  };

  const mongoRes = await mongoFindOne(this, optionAttribut);

  if (!(mongoRes)) {
    const resp = buildResponse(status.DATA_NOT_FOUND);
    res.status(resp.status).send(resp.body);
    this.stat(appName+' returned '+nodeCmd+' '+'error');
    return;
  }
  if (mongoRes === 'error') {
    const resp = buildResponse(status.DB_ERROR);
    res.status(resp.status).send(resp.body);
    this.stat(appName+' returned '+nodeCmd+' '+'error');
    return;
  }

  let enrollInfoObject = null;
  // change base64 to
  if (mongoRes.enrollmentInfo) {
    try {
      const test = decodeBase64(mongoRes.enrollmentInfo);
      enrollInfoObject = JSON.parse(test);
    } catch (err) {
      this.debug('Error while parsing enrollment info');
      const resp = buildResponse(status.SYSTEM_ERROR);
      this.stat(appName+' returned '+nodeCmd+' '+'system error');
      res.status(resp.status).send(resp.body);
      return;
    }
  }
  const responseResult = {
    msisdn: mongoRes.msisdn,
    enrollmentInfo: enrollInfoObject,
    livePhoto: mongoRes.livePhoto || '1234567',
  };

  if (req.body.info_type === 'photo') {
    delete responseResult.msisdn;
    delete responseResult.enrollmentInfo;
  } else if (req.body.info_type === 'text') {
    delete responseResult.livePhoto;
  }

  const resp = buildResponse(status.SUCCESS);
  Object.assign(resp.body, {
    resultData: [
      responseResult,
    ],
  });
  this.stat(appName+' returned '+nodeCmd+' '+'success');
  res.status(resp.status).send(resp.body);
};


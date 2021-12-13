module.exports.NAME = async function(req, res, next) {
  const headersReqSchema = this.utils().
      schemas('req.enrollmentInfoCheckSchema.headersSchema');
  const bodyReqSchema = this.utils().
      schemas('req.enrollmentInfoCheckSchema.bodySchema');
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
  // const hashMD5 = this.utils().services('hash').
  //     modules('hashMD5');

  // init detail and summary log
  const nodeCmd = 'enrollment_info_check';
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

  const query = {
    status: {$ne: 'terminate'},
  };

  // hash card ID
  if (typeof req.body.id_card == 'string') {
    const IdCard =req.body.id_card;// hashMD5(req.body.id_card);
    Object.assign(query, {
      'id_card': IdCard,
    });
  } else {
    // id card is not available
    Object.assign(query, {
      'reference_group_code': req.body.reference_group_code,
    });
  }


  const options = {
    projection: {
      '_id': 0,
      'create_time': 1,
      'last_update_time': 1,
      'msisdn': 1,
      'id_card': 1,
      'reference_group_code': 1,
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
    this.stat(appName+' returned '+nodeCmd+' '+'error');
    res.status(resp.status).send(resp.body);
    return;
  }
  if (mongoRes === 'error') {
    const resp = buildResponse(status.DB_ERROR);
    this.stat(appName+' returned '+nodeCmd+' '+'error');
    res.status(resp.status).send(resp.body);
    return;
  }

  const resp = buildResponse(status.SUCCESS);
  Object.assign(resp.body, {
    resultData: [mongoRes],
  });
  this.stat(appName+' returned '+nodeCmd+' '+'success');
  res.status(resp.status).send(resp.body);
};

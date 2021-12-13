module.exports.NAME = async function(req, res, next) {
  const headersReqSchema = this.utils().
      schemas('req.enrollmentStatusUpdateSchema.headersSchema');
  const bodyReqSchema = this.utils().
      schemas('req.enrollmentStatusUpdateSchema.bodySchema');
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
  const mongoUpdate = this.utils().services('mongoFunction')
      .modules('update');
  const collectionName = this.utils().services('enum')
      .modules('collectionMongo');
  const confMongo = this.utils().services('mongo')
      .conf('default');
  const hashMD5 = this.utils().services('hash').
      modules('hashMD5');
  const createHttpsAgent = this.utils().submodules('createHttpsAgent')
      .modules('createHttpsAgent');
  const generateRandom = this.utils().services('basicFunction').
      modules('generateXTid');

  // init detail and summary log
  const nodeCmd = 'enrollment_status_update';
  const appName = 'enroll';
  this.appName = appName;
  const identity = req.body.id_card || '';
  this.commonLogAsync(req, nodeCmd, identity);

  let responseError = await validateHeader(appName, nodeCmd, headersReqSchema);
  if (responseError) {
    res.status(responseError.status).send(responseError.body);
    await this.waitFinished();
    this.detail().end();
    this.summary().endASync();
    return;
  }

  responseError = await validateToken(appName, nodeCmd);
  if (responseError) {
    res.status(responseError.status).send(responseError.body);
    await this.waitFinished();
    this.detail().end();
    this.summary().endASync();
    return;
  }

  responseError = await validateBody(appName, nodeCmd, bodyReqSchema);
  if (responseError) {
    res.status(responseError.status).send(responseError.body);
    await this.waitFinished();
    this.detail().end();
    this.summary().endASync();
    return;
  }

  // success validation input
  this.stat(appName+' received '+nodeCmd+' request');
  this.summary().addSuccessBlock('client', nodeCmd, null, 'success');

  // hash card ID
  const IdCard = req.body.id_card;
  const query = {
    id_card: IdCard,
  };

  let statusCheck = req.body.status;
  if (typeof req.body.status == 'string') {
    statusCheck = req.body.status.toLowerCase();
  }

  const set = {
    $set: {
      status: statusCheck,
      last_update_time: new Date(),
    },
  };

  // query mongo
  const initInvoke = this.detail().InitInvoke;
  const optionAttribut = {
    collection: collectionName.ENROLL_INFORMATION,
    commandName: 'update_enrollment_info',
    invoke: initInvoke,
    selector: query,
    update: set,
    max_retry: confMongo.max_retry,
    timeout: (confMongo.timeout*1000),
    retry_condition: confMongo.retry_condition,
  };

  const mongoRes = await mongoUpdate(this, optionAttribut);

  if ( typeof(mongoRes) == 'object' && mongoRes.n < 1) {
    this.stat(appName+' returned '+nodeCmd+' '+'error');
    const resp = buildResponse(status.DATA_NOT_FOUND);
    res.status(resp.status).send(resp.body);
    await this.waitFinished();
    this.detail().end();
    this.summary().endASync();
    return;
  }
  if (mongoRes === 'error') {
    const resp = buildResponse(status.DB_ERROR);
    this.stat(appName+' returned '+nodeCmd+' '+'error');
    res.status(resp.status).send(resp.body);
    await this.waitFinished();
    this.detail().end();
    this.summary().endASync();
    return;
  }

  const resp = buildResponse(status.SUCCESS);
  this.stat(appName+' returned '+nodeCmd+' '+'success');
  res.status(resp.status).send(resp.body);
  await this.waitFinished();


  // new requirment send REVOKE REQ 08-10-2021
  if (statusCheck === 'terminate') {
    // update mongo with revoke info
    const referenceId = generateRandom('ndid');
    const setRevokeMongo = {
      $set: {
        revoke_reference_id: referenceId,
        revoke_status: 'send request',
        revoke_update_time: new Date(),
      },
    };

    optionAttribut.update = setRevokeMongo;
    optionAttribut.commandName = 'prepare_revoke';

    // eslint-disable-next-line prefer-const
    let mongoResRevoke = await mongoUpdate(this, optionAttribut);

    if ( typeof(mongoResRevoke) == 'object' && mongoResRevoke.n < 1) {
      this.detail().end();
      this.summary().endASync();
      return;
    }
    if (mongoResRevoke === 'error') {
      this.detail().end();
      this.summary().endASync();
      return;
    }
    // SEND REVOKE REQUEST
    const revokeNodeName = 'revoke';
    const revokeServiceName = 'ndid';
    const confRevoke = this.utils().services(revokeServiceName)
        .conf(revokeNodeName);

    let url = confRevoke.conn_type +'://' + confRevoke.ip +
        (confRevoke.port ? (':' + confRevoke.port) : '') +
        confRevoke.path;

    url = url.replace(':id', req.body.id_card);
    // const serverConfig = JSON.parse(process.env.server);
    // const callbackUrl = (serverConfig.use_https?'https':'http') +
    //         '://' + serverConfig.app_host +
    //         (serverConfig.app_port ? (':' + serverConfig.app_port) : '') +
    //         confRevoke.callback_url;

    const callbackUrl = confRevoke.callback_url;

    const headers = {
      'Content-Type': 'application/json',
    };

    const bodyData = {
      'node_id': confRevoke.node_id,
      'reference_id': referenceId,
      'callback_url': callbackUrl,
      'request_message': confRevoke.request_message,
    };

    const method = 'POST';
    const optionAttributRevoke = {
      method: method,
      headers: headers,
      _service: revokeServiceName,
      _command: revokeNodeName,
      url: url,
      data: bodyData,
    };

    Object.assign(optionAttributRevoke,
        {httpsAgent: createHttpsAgent(revokeServiceName, revokeNodeName)});

    // eslint-disable-next-line prefer-const
    let responseRevoke = await this.utils().http().
        request(optionAttributRevoke);

    let status = 'send other error';
    if (this.utils().http().isError(responseRevoke)) {
      if (responseRevoke == 'TIMEOUT') {
        status = 'send connection timeout';
      } else if (responseRevoke == 'CONNECTION_ERROR') {
        status = 'send connection error';
      }
    } else if (responseRevoke.status && responseRevoke.status !=202) {
      this.debug('error status code: ' + responseRevoke.status);
      const descError = (responseRevoke.status ==401)?'unauthorized':
                        (responseRevoke.status ==404)?'data not found':
                        'other error';
      status = 'send other error';
      this.stat(appName+' recv '+revokeServiceName+' '+
      revokeNodeName+' error system');
      this.summary().addErrorBlock(revokeServiceName, revokeNodeName,
          responseRevoke.status, descError);
    } else {
      status = 'send success';
      this.stat(appName+' recv '+revokeServiceName+' '+
                  revokeNodeName+' response');
      this.summary().addErrorBlock(revokeServiceName, revokeNodeName,
          responseRevoke.status, 'success');
    }
    optionAttribut.update = {
      $set: {
        revoke_status: status,
        revoke_update_time: new Date(),
      },
    };
    optionAttribut.selector = {
      'revoke_reference_id': referenceId,
    };
    optionAttribut.commandName = 'update_status_revoke';
    // eslint-disable-next-line prefer-const
    mongoResRevoke = await mongoUpdate(this, optionAttribut);
  }

  this.detail().end();
  this.summary().endASync();
};


module.exports.NAME = async function(req, res, next) {
  const headersReqSchema = this.utils().
      schemas('req.enrollmentInfoUpdateSchema.headersSchema');
  const bodyReqSchema = this.utils().
      schemas('req.enrollmentInfoUpdateSchema.bodySchema');
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
  // const hashMD5 = this.utils().services('hash').
  //    modules('hashMD5');
  const encodeBase64 = this.utils().services('base64Function')
      .modules('encodeBase64');
  const createHttpsAgent = this.utils().submodules('createHttpsAgent')
      .modules('createHttpsAgent');
  const generateRandom = this.utils().services('basicFunction').
      modules('generateXTid');
  const generateKey = this.utils().submodules('generateKeyPair')
      .modules('generateKey');

  // init detail and summary log
  const nodeCmd = 'enrollment_info_update';
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
  const IdCard = req.body.id_card;// hashMD5(req.body.id_card);
  const query = {
    id_card: IdCard,
  };
  const enrollmentInfo = encodeBase64(JSON.stringify(req.body.enrollmentInfo));

  const set = {
    $set: {
      'enrollmentInfo': enrollmentInfo,
      'last_update_time': new Date(),
    },
    $setOnInsert: {
      'status': 'active',
      'create_time': new Date(),
    },
  };


  if (req.body.msisdn) {
    Object.assign(set['$set'], {
      'msisdn': req.body.msisdn,
    });
  }

  if (req.body.livePhoto) {
    Object.assign(set['$set'], {
      'livePhoto': req.body.livePhoto,
    });
  }
  const options ={
    upsert: true,
  };

  // query mongo
  const initInvoke = this.detail().InitInvoke;
  const optionAttribut = {
    collection: collectionName.ENROLL_INFORMATION,
    commandName: 'update_enrollment_info',
    invoke: initInvoke,
    selector: query,
    update: set,
    options: options,
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

  // if new card
  if (mongoRes.upserted) {
    const keys = await generateKey();
    const referenceId = generateRandom('ndid');
    const accessorId = generateRandom('ndid');
    const setRevokeMongo = {
      $set: {
        'onboard_reference_id': referenceId,
        'onboard_accessor_id': accessorId,
        'onboard_accessor_private_key': keys.privateKey,
        'onboard_accessor_public_key': keys.publicKey,
        'onboard_status': 'send request',
        'onboard_update_time': new Date(),

      },
    };
    optionAttribut.update = setRevokeMongo;
    optionAttribut.commandName = 'prepare_onboard';

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
    const onboardNodeName = 'onboard';
    const revokeServiceName = 'ndid';
    const confOnBoard = this.utils().services(revokeServiceName)
        .conf(onboardNodeName);

    const url = confOnBoard.conn_type +'://' + confOnBoard.ip +
    (confOnBoard.port ? (':' + confOnBoard.port) : '') +
    confOnBoard.path;

    url.replace(':id', req.body.id_card);
    // const serverConfig = JSON.parse(process.env.server);
    // const callbackUrl = (serverConfig.use_https?'https':'http') +
    //      '://' + serverConfig.app_host +
    //      (serverConfig.app_port ? (':' + serverConfig.app_port) : '') +
    //      confOnBoard.callback_url;

    const callbackUrl = confOnBoard.callback_url;

    const headers = {
      'Content-Type': 'application/json',
    };

    const bodyData = {
      'node_id': confOnBoard.node_id,
      'reference_id': referenceId,
      'identity_list': [
        {
          'namespace': 'citizen_id',
          'identifier': req.body.id_card,
        },
      ],
      'mode': 2,
      'accessor_type': 'RSA',
      'accessor_public_key': keys.publicKey,
      'accessor_id': accessorId,
      'callback_url': callbackUrl,
      'ial': 2.3,
      'request_message': confOnBoard.request_message,

    };

    const method = 'POST';
    const optionAttributRevoke = {
      method: method,
      headers: headers,
      _service: revokeServiceName,
      _command: onboardNodeName,
      url: url,
      data: bodyData,
    };

    Object.assign(optionAttributRevoke,
        {httpsAgent: createHttpsAgent(revokeServiceName, onboardNodeName)});

    // eslint-disable-next-line prefer-const
    let responseOnBoard = await this.utils().http().
        request(optionAttributRevoke);

    let status = 'send other error';
    if (this.utils().http().isError(responseOnBoard)) {
      if (responseOnBoard == 'TIMEOUT') {
        status = 'send connection timeout';
      } else if (responseOnBoard == 'CONNECTION_ERROR') {
        status = 'send connection error';
      }
    } else if (responseOnBoard.status && responseOnBoard.status !=202) {
      this.debug('error status code: ' + responseOnBoard.status);
      const descError = (responseOnBoard.status ==401)?'unauthorized':
                    (responseOnBoard.status ==404)?'data not found':
                    'other error';
      status = 'send other error';
      this.stat(appName+' recv '+revokeServiceName+' '+
            onboardNodeName+' error system');
      this.summary().addErrorBlock(revokeServiceName, onboardNodeName,
          responseOnBoard.status, descError);
    } else {
      status = 'send success';
      this.stat(appName+' recv '+revokeServiceName+' '+
              onboardNodeName+' response');
      this.summary().addErrorBlock(revokeServiceName, onboardNodeName,
          responseOnBoard.status, 'success');
    }
    optionAttribut.update = {
      $set: {
        onboard_status: status,
        onboard_update_time: new Date(),
      },
    };
    optionAttribut.selector = {
      'onboard_reference_id': referenceId,
    };
    optionAttribut.commandName = 'update_status_onboard';
    // eslint-disable-next-line prefer-const
    mongoResRevoke = await mongoUpdate(this, optionAttribut);
  }
  this.detail().end();
  this.summary().endASync();
};



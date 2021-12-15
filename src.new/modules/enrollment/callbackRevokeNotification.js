module.exports.NAME = async function(req, res, next) {
  // const headersReqSchema = this.utils().
  //    schemas('req.callbackRevokeNotificationSchema.headersSchema');
  const bodyReqSchema = this.utils().
      schemas('req.callbackRevokeNotificationSchema.bodySchema');
  // const validateToken = this.utils().submodules('validateToken').
  //    modules('validateToken');
  // const validateHeader = this.utils().submodules('validateHeader').
  //    modules('validateHeader');
  const validateBody = this.utils().submodules('validateBody').
      modules('validateBody');
  const mongoUpdate = this.utils().services('mongoFunction')
      .modules('update');
  const collectionName = this.utils().services('enum')
      .modules('collectionMongo');
  const confMongo = this.utils().services('mongo')
      .conf('default');

  // init detail and summary log
  const nodeCmd = 'noti_revoke';
  const appName = 'enroll';
  this.appName = appName;
  const identity = req.body.reference_id || '';
  this.commonLogAsync(req, nodeCmd, identity);

  const updateRevoke = async function() {
    const query = {
      revoke_reference_id: req.body.reference_id,
    };
    const set = {
      $set: {
        'noti_revoke_status': statusUpdate,
        'noti_revoke_update_time': new Date(),
      },
    };

    // query mongo
    const initInvoke = this.detail().InitInvoke;
    const optionAttribut = {
      collection: collectionName.ENROLL_INFORMATION,
      commandName: 'update_noti_revoke',
      invoke: initInvoke,
      selector: query,
      update: set,
      max_retry: confMongo.max_retry,
      timeout: (confMongo.timeout*1000),
      retry_condition: confMongo.retry_condition,
    };

    await mongoUpdate(this, optionAttribut);
    this.detail().end();
    this.summary().endASync();
    return;
  };

  let statusUpdate;
  /*
  let responseError = await validateHeader(appName, nodeCmd, headersReqSchema,
      'content-type');
  if (responseError) {
    res.status(204).send();
    statusUpdate = 'validate fail';
    await this.waitFinished();
    await updateRevoke.call(this);
    return;
  }*/

  /* ISSUE #22 -> NO NEED VALIDATION TOKEN
  responseError = await validateToken(appName, nodeCmd);
  if (responseError) {
    res.status(204).send();
    statusUpdate = 'validate fail';
    await this.waitFinished();
  }
  */
  responseError = await validateBody(appName, nodeCmd, bodyReqSchema);
  if (responseError) {
    res.status(204).send();
    statusUpdate = 'validate fail';
    await this.waitFinished();
    if (req.body && req.body.reference_id) {
      await updateRevoke.call(this);
    } else {
      this.detail().end();
      this.summary().endASync();
    }
    return;
  }


  // success validation input
  this.stat(appName+' received '+nodeCmd+' request');
  this.summary().addSuccessBlock('client', nodeCmd, null, 'success');
  this.stat(appName+' returned '+nodeCmd+' '+'success');
  res.status(204).send();
  statusUpdate = 'success';
  await this.waitFinished();
  await updateRevoke.call(this);
  return;
};


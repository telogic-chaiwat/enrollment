/* eslint-disable no-invalid-this */
const ObjectID = require('mongodb').ObjectID;

const sha512 = function(password) {
  const crypto = require('crypto');
  const salt = password.substring(0, 2);
  const hash = crypto.createHmac('sha512', salt);
  hash.update(password);
  const value = hash.digest('hex');
  return {
    salt: salt,
    passwordHash: value,
  };
};

module.exports.authUser = async function(uname, passwd, next) {
  const status = this.utils().services('enum').modules('status');
  const mongoFindOne = this.utils().services('mongoFunction')
      .modules('findOne');

  // const collectionName = require('../enum/collectionMongo');
  // eslint-disable-next-line max-len
  const collectionName = this.utils().services('enum').modules('collectionMongo');
  const conf = this.utils().services('authFunctions').conf('authUser');

  const optionAttribut = {
    collection: collectionName.CREDENTIAL,
    commandName: 'find_credential',
    query: {'username': uname},
    max_retry: conf.max_retry,
    timeout: (conf.timeout*1000),
    retry_condition: conf.retry_condition,
  };

  const getResponse = await mongoFindOne(this, optionAttribut);

  let statusObject = status.SYSTEM_ERROR;
  if (getResponse === 'error') {
    statusObject = status.DB_ERROR;
  } else if (getResponse === null ||
      (Array.isArray(getResponse) && getResponse.length == 0)) {
    statusObject = status.DATA_NOT_FOUND;
  } else {
    statusObject = status.SUCCESS;
  }
  if (statusObject == status.SUCCESS) {
    const passwordData = sha512(passwd);
    if (passwordData.passwordHash === getResponse.password) {
      return next(null, getResponse);
    } else {
      statusObject = status.ACCESS_DENIED;
    }
  }

  return next(statusObject, null);
};

module.exports.authTokens =
async function(accessToken, refreshToken, userId, next) {
  const status = this.utils().services('enum').modules('status');
  const mongoFindOne = this.utils().services('mongoFunction')
      .modules('findOne');

  // const collectionName = require('../enum/collectionMongo');
  // eslint-disable-next-line max-len
  const collectionName = this.utils().services('enum').modules('collectionMongo');

  const conf = this.utils().services('authFunctions').conf('authUser');

  let statusObject = status.SYSTEM_ERROR;
  // eslint-disable-next-line new-cap
  if (ObjectID.isValid(userId)) {
    const optionAttribut = {
      collection: collectionName.CREDENTIAL,
      commandName: 'find_credential',
      // eslint-disable-next-line new-cap
      query: {'_id': ObjectID(userId)},
      max_retry: conf.max_retry,
      timeout: (conf.timeout*1000),
      retry_condition: conf.retry_condition,
    };

    const getResponse = await mongoFindOne(this, optionAttribut);

    if (getResponse === 'error') {
      statusObject = status.DB_ERROR;
    } else if (!getResponse) {
      statusObject = status.DATA_NOT_FOUND; ;
    } else {
      statusObject = status.SUCCESS;
    }
    if (statusObject === status.SUCCESS) {
      if (accessToken === getResponse.accessToken &&
      refreshToken === getResponse.refreshToken) {
        return next(null, getResponse);
      } else {
        statusObject = status.DATA_NOT_FOUND; ;
      }
    }
  } else {
    statusObject = status.DATA_NOT_FOUND; ;
  }

  return next(statusObject, null);
};

/**
 * @param {*} token  token to verify
 * @return {*} error -> failed, others decoded result
 */
module.exports.verifyAccesToken = async function(token) {
  const jwt = require('jsonwebtoken');
  const secretAccess = this.utils().services('authConfig')
      .modules('secret_access');
  if (!token) {
    return {'error': 'empty token'};
  }

  try {
    token = token.replace(/\s*/g, '');
    token = token.replace('Bearer', '');
    ret = jwt.verify(token, secretAccess);
  } catch (err) {
    ret = {'error': err.message};
  }

  return ret;
};

const tokenVerification = function() {
  const jwt = require('jsonwebtoken');
  let token;
  let secret;
  let filter;

  this.setToken = (input) => {
    token = input;
    return this;
  };
  this.setSecret = (input) => {
    secret = input;
    return this;
  };
  this.setFilter = (input) => {
    filter = input;
    return this;
  };
  this.verify = () => {
    if (!secret) {
      throw new Error('missing=secret_key');
    }

    if (typeof token === 'undefined') {
      return {'error': 'missing'};
    }
    const ret = jwt.verify(token, secret, (err, decoded) => {
      if (err !== null && typeof (err ['TokenExpiredError']) !== 'undefined' ) {
        return {'error': 'expired'};
      } else if (err) {
        return {'error': 'invalid'};
      }
      if (Date.now() / 1000 > (decoded.exp || 0)) {
        return {'error': 'expired', 'decoded': decoded};
      } else if (typeof (filter) !== 'undefined') {
        for (const k in filter) {
          if (typeof decoded[k] === 'undefined') {
            return {'error': 'invalid', 'decoded': decoded};
          } else if (decoded[k] !== filter[k]) {
            return {'error': 'invalid', 'decoded': decoded};
          }
        }
      }
      return {'decoded': decoded};
    });
    return ret;
  };
  return this;
};

module.exports.verifyRefreshToken = function(token) {
  // eslint-disable-next-line camelcase
  const {secret_refresh} = require('./authConfig');
  return tokenVerification()
      .setFilter({'kind': 'refresh_token'})
      .setToken(token)
      .setSecret(secret_refresh)
      .verify();
};

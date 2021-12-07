/* eslint-disable max-len */
// const {status} = require('./enum');
// const status = require('../enum.js').status;

module.exports.findOne = async (self, optionAttribute)=>{
  /* const appLogGen = self.utils().services('basicFunction')
      .modules('mongoAppLogGen');*/
  const status = self.utils().services('enum').modules('status');
  const collectionName = optionAttribute.collection;
  const retryAttemp = optionAttribute.max_retry;
  if (collectionName && collectionName !='') {
    optionAttribute.service = 'mongo';
    optionAttribute.method = 'findOne';
    // const options = {};
    // options.projection = (optionAttribute.projection?
    //  optionAttribute.projection:{});

    if (!optionAttribute.query) {
      optionAttribute.query = {};
    }
    let rawData = optionAttribute.query ?
     JSON.stringify(optionAttribute.query):'';
     optionAttribute.options ? rawData += ',' +
     JSON.stringify(optionAttribute.options):'';
     const queryData = collectionName + '.' + optionAttribute.method +
    '(' + rawData.replace(/\"/g, '\'') + `)`;
     const data = {
       Query: queryData,
     };
     optionAttribute.queryData = queryData;

     for (let i = 0; i <= retryAttemp; i++) {
       const reqTime = Date.now();
       try {
         addDetailorDetailRetry(i, optionAttribute, self, queryData, data);
         self.detail().end();

         const dbCollection = self.utils().mongo().collection(collectionName);
         const result = await dbCollection.findOne(optionAttribute.query,
             optionAttribute.options);

         optionAttribute.return = result;
         const dataResult = {};
         dataResult.Return = result;
         const resTime = Date.now();
         const resTimeInMilliSec = resTime - reqTime;
         optionAttribute.resptime = resTimeInMilliSec;
         // responseMesg = result;

         self.stat(self.appName+' recv ' +'mongo '+
          optionAttribute.commandName +' response');

         self.detail().addInputResponse(optionAttribute.service,
             optionAttribute.commandName,
             optionAttribute.invoke,
             JSON.stringify(result),
             dataResult);

         if (!result ) {
           self.debug('result is not found');
           self.summary().addErrorBlock(optionAttribute.service,
               optionAttribute.commandName,
               status.DATA_NOT_FOUND.RESULT_CODE,
               'data not found');
           optionAttribute.errormessage = 'data not found';
           self.debug(appLogGen(optionAttribute));
         } else {
           self.summary().addSuccessBlock(optionAttribute.service,
               optionAttribute.commandName,
               status.SUCCESS.RESULT_CODE,
               'success');
           self.debug(appLogGen(optionAttribute));
         }
         return result;
       } catch (e) {
         self.error(JSON.stringify(e));
         const dataResult = {};
         dataResult.Return = e.message;
         const resTime = Date.now();
         const resTimeInMilliSec = resTime - reqTime;
         optionAttribute.resptime = resTimeInMilliSec;
         const errorCheck = addDetailError(optionAttribute, self, e);
         if (checkRetryCondition(errorCheck.retry,
             optionAttribute.retry_condition) == false) {
           return 'error';
         }
       }
     }
     return 'error';
  } else {
    return 'error';
  }
};

module.exports.insert = async (self, optionAttribute)=>{
  /* const appLogGen = self.utils().services('basicFunction')
      .modules('mongoAppLogGen');*/
  const status = self.utils().services('enum').modules('status');
  const collectionName = optionAttribute.collection;
  const retryAttemp = optionAttribute.max_retry;
  if (collectionName && collectionName !='') {
    optionAttribute.service = 'mongo';
    optionAttribute.method = 'insert';
    // const options = {};
    // options.projection = (optionAttribute.projection?
    //  optionAttribute.projection:{});

    if (!optionAttribute.doc) {
      optionAttribute.doc = {};
    }
    const rawData = optionAttribute.doc ?
     JSON.stringify(optionAttribute.doc):'';
    // options ? rawData += ',' + JSON.stringify(options):'';
    const queryData = collectionName + '.' + optionAttribute.method +
    '(' + rawData.replace(/\"/g, '\'') + `)`;
    const data = {
      Query: queryData,
    };
    optionAttribute.queryData = queryData;

    for (let i = 0; i <= retryAttemp; i++) {
      const reqTime = Date.now();
      try {
        addDetailorDetailRetry(i, optionAttribute, self, queryData, data);
        self.detail().end();

        const dbCollection = self.utils().mongo().collection(collectionName);
        const result = await dbCollection.insert(optionAttribute.doc,
            {maxTimeMS: optionAttribute.timeout});

        optionAttribute.return = result;
        const dataResult = {};
        dataResult.Return = result;
        const resTime = Date.now();
        const resTimeInMilliSec = resTime - reqTime;
        optionAttribute.resptime = resTimeInMilliSec;
        // responseMesg = result;

        self.stat(self.appName+' recv ' +'mongo '+
          optionAttribute.commandName +' response');

        self.detail().addInputResponse(optionAttribute.service,
            optionAttribute.commandName,
            optionAttribute.invoke,
            JSON.stringify(result),
            dataResult);

        self.summary().addSuccessBlock(optionAttribute.service,
            optionAttribute.commandName,
            status.SUCCESS.RESULT_CODE,
            'success');
        self.debug(appLogGen(optionAttribute));

        return result;
      } catch (e) {
        const dataResult = {};
        dataResult.Return = e.message;
        const resTime = Date.now();
        const resTimeInMilliSec = resTime - reqTime;
        optionAttribute.resptime = resTimeInMilliSec;
        const errorCheck = addDetailError(optionAttribute, self, e);
        if (checkRetryCondition(errorCheck.retry,
            optionAttribute.retry_condition) == false) {
          return 'error';
        }
      }
    }
    return 'error';
  }
};

module.exports.update = async (self, optionAttribute)=>{
  /* const appLogGen = self.utils().services('basicFunction')
      .modules('mongoAppLogGen');*/
  const status = self.utils().services('enum').modules('status');
  const collectionName = optionAttribute.collection;
  const retryAttemp = optionAttribute.max_retry;
  if (collectionName && collectionName !='') {
    optionAttribute.service = 'mongo';
    optionAttribute.method = 'update';
    let options = (optionAttribute.options)?optionAttribute.options:null;
    // options.projection = (optionAttribute.projection?
    //  optionAttribute.projection:{});

    if (!optionAttribute.doc) {
      optionAttribute.doc = {};
    }
    let rawData = optionAttribute.selector ?
     JSON.stringify(optionAttribute.selector):'';
     optionAttribute.update?rawData += ',' +
     JSON.stringify(optionAttribute.update):'';
     options ? rawData += ',' + JSON.stringify(optionAttribute.options):'';
     const queryData = collectionName + '.' + optionAttribute.method +
    '(' + rawData.replace(/\"/g, '\'') + `)`;
     const data = {
       Query: queryData,
     };
     optionAttribute.queryData = queryData;
     if (optionAttribute.options) {
       Object.assign(options, {maxTimeMS: optionAttribute.timeout});
     } else {
       options = {maxTimeMS: optionAttribute.timeout};
     }
     for (let i = 0; i <= retryAttemp; i++) {
       const reqTime = Date.now();
       try {
         addDetailorDetailRetry(i, optionAttribute, self, queryData, data);
         self.detail().end();

         const dbCollection = self.utils().mongo().collection(collectionName);
         const result = await dbCollection.update(optionAttribute.selector,
             optionAttribute.update,
             options,
         );

         optionAttribute.return = result.result;
         const dataResult = {};
         dataResult.Return = result.result;
         const resTime = Date.now();
         const resTimeInMilliSec = resTime - reqTime;
         optionAttribute.resptime = resTimeInMilliSec;
         // responseMesg = result;

         self.stat(self.appName+' recv ' +'mongo '+
          optionAttribute.commandName +' response');

         self.detail().addInputResponse(optionAttribute.service,
             optionAttribute.commandName,
             optionAttribute.invoke,
             JSON.stringify(result.result),
             dataResult);
         if (result.result['n'] < 1) {
           self.debug('result is not found');
           self.summary().addErrorBlock(optionAttribute.service,
               optionAttribute.commandName,
               status.DATA_NOT_FOUND.RESULT_CODE,
               'data not found');
           optionAttribute.errormessage = 'data not found';
           self.debug(appLogGen(optionAttribute));
         } else {
           self.summary().addSuccessBlock(optionAttribute.service,
               optionAttribute.commandName,
               status.SUCCESS.RESULT_CODE,
               'success');
           self.debug(appLogGen(optionAttribute));
         }
         return result.result;
       } catch (e) {
         const dataResult = {};
         dataResult.Return = e.message;
         const resTime = Date.now();
         const resTimeInMilliSec = resTime - reqTime;
         optionAttribute.resptime = resTimeInMilliSec;
         const errorCheck = addDetailError(optionAttribute, self, e);
         if (checkRetryCondition(errorCheck.retry,
             optionAttribute.retry_condition) == false) {
           return 'error';
         }
       }
     }
     return 'error';
  }
};

module.exports.find = async (self, optionAttribute)=>{
  /* const appLogGen = self.utils().services('basicFunction')
      .modules('mongoAppLogGen');*/
  const status = self.utils().services('enum').modules('status');
  const collectionName = optionAttribute.collection;
  const retryAttemp = optionAttribute.max_retry;
  if (collectionName && collectionName !='') {
    optionAttribute.service = 'mongo';
    optionAttribute.method = 'find';
    // const options = {};
    // options.projection = (optionAttribute.projection?
    //  optionAttribute.projection:{});

    if (!optionAttribute.query) {
      optionAttribute.query = {};
    }
    let rawData = optionAttribute.query ?
     JSON.stringify(optionAttribute.query):'';
     optionAttribute.options ? rawData += ',' +
     JSON.stringify(optionAttribute.options):'';
     const queryData = collectionName + '.' + optionAttribute.method +
    '(' + rawData.replace(/\"/g, '\'') + `)`;
     const data = {
       Query: queryData,
     };
     optionAttribute.queryData = queryData;

     for (let i = 0; i <= retryAttemp; i++) {
       const reqTime = Date.now();
       try {
         addDetailorDetailRetry(i, optionAttribute, self, queryData, data);
         self.detail().end();

         const dbCollection = self.utils().mongo().collection(collectionName);
         const result = await dbCollection.find(optionAttribute.query,
             optionAttribute.options).toArray();

         optionAttribute.return = result;
         const dataResult = {};
         dataResult.Return = result;
         const resTime = Date.now();
         const resTimeInMilliSec = resTime - reqTime;
         optionAttribute.resptime = resTimeInMilliSec;
         // responseMesg = result;

         self.stat(self.appName+' recv ' +'mongo '+
          optionAttribute.commandName +' response');

         self.detail().addInputResponse(optionAttribute.service,
             optionAttribute.commandName,
             optionAttribute.invoke,
             JSON.stringify(result),
             dataResult);

         if (result === null || ( Array.isArray(result) &&
         result.length == 0)) {
           self.debug('result is not found');
           self.summary().addErrorBlock(optionAttribute.service,
               optionAttribute.commandName,
               status.DATA_NOT_FOUND.RESULT_CODE,
               'data not found');
           optionAttribute.errormessage = 'data not found';
           self.debug(appLogGen(optionAttribute));
         } else {
           self.summary().addSuccessBlock(optionAttribute.service,
               optionAttribute.commandName,
               status.SUCCESS.RESULT_CODE,
               'success');
           self.debug(appLogGen(optionAttribute));
         }
         return result;
       } catch (e) {
         const dataResult = {};
         dataResult.Return = e.message;
         const resTime = Date.now();
         const resTimeInMilliSec = resTime - reqTime;
         optionAttribute.resptime = resTimeInMilliSec;
         const errorCheck = addDetailError(optionAttribute, self, e);
         if (checkRetryCondition(errorCheck.retry,
             optionAttribute.retry_condition) == false) {
           return 'error';
         }
       }
     }
     return 'error';
  }
};

module.exports.aggregate = async (self, optionAttribute)=>{
  /* const appLogGen = self.utils().services('basicFunction')
      .modules('mongoAppLogGen');*/
  const status = self.utils().services('enum').modules('status');
  const collectionName = optionAttribute.collection;
  const retryAttemp = optionAttribute.max_retry;
  if (collectionName && collectionName !='') {
    optionAttribute.service = 'mongo';
    optionAttribute.method = 'aggregate';
    // const options = {};
    // options.projection = (optionAttribute.projection?
    //  optionAttribute.projection:{});

    if (!optionAttribute.query) {
      optionAttribute.query = {};
    }
    let rawData = optionAttribute.query ?
     JSON.stringify(optionAttribute.query):'';
     optionAttribute.options ? rawData += ',' +
     JSON.stringify(optionAttribute.options):'';
     const queryData = collectionName + '.' + optionAttribute.method +
    '(' + rawData.replace(/\"/g, '\'') + `)`;
     const data = {
       Query: queryData,
     };
     optionAttribute.queryData = queryData;

     for (let i = 0; i <= retryAttemp; i++) {
       const reqTime = Date.now();
       try {
         addDetailorDetailRetry(i, optionAttribute, self, queryData, data);
         self.detail().end();

         const dbCollection = self.utils().mongo().collection(collectionName);
         const result = await dbCollection.aggregate(optionAttribute.query,
             optionAttribute.options).toArray();

         optionAttribute.return = result;
         const dataResult = {};
         dataResult.Return = result;
         const resTime = Date.now();
         const resTimeInMilliSec = resTime - reqTime;
         optionAttribute.resptime = resTimeInMilliSec;
         // responseMesg = result;

         self.stat(self.appName+' recv ' +'mongo '+
          optionAttribute.commandName +' response');

         self.detail().addInputResponse(optionAttribute.service,
             optionAttribute.commandName,
             optionAttribute.invoke,
             JSON.stringify(result),
             dataResult);

         if (result === null || ( Array.isArray(result) &&
         result.length == 0)) {
           self.debug('result is not found');
           self.summary().addErrorBlock(optionAttribute.service,
               optionAttribute.commandName,
               status.DATA_NOT_FOUND.RESULT_CODE,
               'data not found');
           optionAttribute.errormessage = 'data not found';
           self.debug(appLogGen(optionAttribute));
         } else {
           self.summary().addSuccessBlock(optionAttribute.service,
               optionAttribute.commandName,
               status.SUCCESS.RESULT_CODE,
               'success');
           self.debug(appLogGen(optionAttribute));
         }
         return result;
       } catch (e) {
         const dataResult = {};
         dataResult.Return = e.message;
         const resTime = Date.now();
         const resTimeInMilliSec = resTime - reqTime;
         optionAttribute.resptime = resTimeInMilliSec;
         const errorCheck = addDetailError(optionAttribute, self, e);
         if (checkRetryCondition(errorCheck.retry,
             optionAttribute.retry_condition) == false) {
           return 'error';
         }
       }
     }
     return 'error';
  }
};
/**
 *
 * @param {object} err
 * @return {string}
 */
function checkErrorMongo(err) {
  if ((err.name == 'MongoNetworkError') ||
  (err.name == 'MongoError') ||
  (err.name == 'MongoServerSelectionError')) {
    return {
      errorCode: 'ret=1',
      errorMessage: 'connection error',
      retry: 'CONNECTION_ERROR',
    };
  } else if (err.name == 'MongoTimeoutError') {
    return {
      errorCode: 'ret=4',
      errorMessage: 'timeout',
      retry: 'TIMEOUT',
    };
  } else if ( err.code && err.code ==11000) {
    return {
      errorCode: '40301',
      errorMessage: 'data exist',
      retry: 'DATA_EXIST',
    };
  } else {
    return {
      errorCode: null,
      errorMessage: 'unknown error',
      retry: 'UNKNOWN_ERROR',
    };
  }
}


/**
 * @param {object} count
 * @param {object} optionAttribute
 * @param {object} self
 * @param {object} queryData
 * @param {object} data
 *
 *
 */
function addDetailorDetailRetry(count, optionAttribute, self, queryData, data) {
  if (count == 0) {
    // first request
    self.stat(self.appName+' sent ' +'mongo '+
        optionAttribute.commandName +' request');
    self.detail().addOutputRequest(
        optionAttribute.service, // node
        optionAttribute.commandName, // cmd
        optionAttribute.invoke, // invoke
        queryData, // raw data
        data, // data
        'mongo', // protocol
        '');// protocol method
  } else {
    self.stat(self.appName+' sent ' +'mongo '+
        optionAttribute.commandName +' request retry');
    self.detail().addOutputRequestRetry(
        optionAttribute.service, // node
        optionAttribute.commandName, // cmd
        optionAttribute.invoke, // invoke
        queryData, // raw data
        data, // data
        count, // total
        optionAttribute.max_retry);// maxCount
  }
}

/**
 * @param {object}  optionAttribute
 * @param {object}  self
 * @param {object}  e
 * @return {object} errorCheck
 */
function addDetailError(optionAttribute, self, e) {
  /* const appLogGen = self.utils().services('basicFunction')
      .modules('mongoAppLogGen'); */
  self.detail().addInputResponseError(optionAttribute.service,
      optionAttribute.commandName,
      optionAttribute.invoke);
  // checking what kind of error
  const errorCheck = checkErrorMongo(e);
  self.summary().addErrorBlock(optionAttribute.service,
      optionAttribute.commandName,
      errorCheck.errorCode,
      errorCheck.errorMessage);

  self.stat(self.appName+' recv ' +'mongo '+
    optionAttribute.commandName +' '+ errorCheck.errorMessage);

  self.debug('err : ' + e);
  optionAttribute.errormessage = errorCheck.errorMessage;
  self.debug(appLogGen(optionAttribute));
  return errorCheck;
}
/**
 *@param {object} err
* @param {object} retryCondition
* @return {boleean}
 */
function checkRetryCondition(err, retryCondition) {
  if (retryCondition) {
    const retryConditions = retryCondition.split('|');
    return retryConditions.includes(err);
  }
  return false;
}

/**
 *
 * @param {Object} optionAttribute
 * @return {string}
 */
/* function appLogGen(optionAttribute) {
  let mongoLog = 'CALL_SERVICE|__TO='.concat(optionAttribute.service || '');
  mongoLog += ' __COMMAND='.concat(optionAttribute.commandName || '');
  mongoLog += ' __QUERY='.concat(optionAttribute.queryData || '');
  mongoLog += '|';
  mongoLog += '__RETURN='.concat(JSON.stringify(optionAttribute.return) || '');
  mongoLog += ' __RESPTIME='.
      concat(JSON.stringify(optionAttribute.resptime) || '');
  mongoLog += ' __ERRORMESSAGE='.
      concat(JSON.stringify(optionAttribute.errormessage) || '');
  mongoLog += ' __EXCEPTION='.
      concat(JSON.stringify(optionAttribute.exception) || '');


  return mongoLog;
}*/

/**
 * generete Applog for mongo service
 * @param {Object} optionAttribute
 * @return {string}
 */
function appLogGen(optionAttribute) {
  let mongoLog = 'CALL_SERVICE|__TO='.concat(optionAttribute.service || '');
  mongoLog += ' __COMMAND='.concat(optionAttribute.commandName || '');
  mongoLog += ' __QUERY='.concat(optionAttribute.queryData || '');
  mongoLog += '|';
  mongoLog += '__RETURN='.concat(JSON.stringify(optionAttribute.return) || '');
  mongoLog += ' __RESPTIME='.concat(JSON.stringify(optionAttribute.resptime) || '');
  mongoLog += ' __ERRORMESSAGE='.concat(JSON.stringify(optionAttribute.errormessage) || '');
  mongoLog += ' __EXCEPTION='.concat(JSON.stringify(optionAttribute.exception) || '');


  return mongoLog;
};

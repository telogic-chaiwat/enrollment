/* eslint-disable max-len */
module.exports.status = Object.freeze({
  SUCCESS: {
    RESULT_CODE: '20000', HTTP_STATUS: '200', DEVELOPER_MESSAGE: 'success',
  },
  SUCCESS_POST: {
    RESULT_CODE: '20100', HTTP_STATUS: '201', DEVELOPER_MESSAGE: 'created_success',
  },
  SUCCESS_WITH_CONDITION: {
    RESULT_CODE: '20001', HTTP_STATUS: '200', DEVELOPER_MESSAGE: 'success_with_condition',
  },
  BAD_REQUEST: {
    RESULT_CODE: '40000', HTTP_STATUS: '400', DEVELOPER_MESSAGE: 'bad_request',
  },
  UN_AUTHORIZED: {
    RESULT_CODE: '40001', HTTP_STATUS: '401', DEVELOPER_MESSAGE: 'unauthorized',
  },
  ACCESS_DENIED: {
    RESULT_CODE: '40101', HTTP_STATUS: '401', DEVELOPER_MESSAGE: 'unauthorized',
  },
  MISSING_INVALID_PARAMETER: {
    RESULT_CODE: '40300', HTTP_STATUS: '403', DEVELOPER_MESSAGE: 'missing_or_invalid_parameter',
  },
  DATA_EXIST: {
    RESULT_CODE: '40301', HTTP_STATUS: '403', DEVELOPER_MESSAGE: 'data_exist',
  },
  DATA_NOT_FOUND: {
    RESULT_CODE: '20020', HTTP_STATUS: '200', DEVELOPER_MESSAGE: 'data_not_found',
  },
  SYSTEM_ERROR: {
    RESULT_CODE: '50000', HTTP_STATUS: '500', DEVELOPER_MESSAGE: 'system_error',
  },
  UNKNOWN_ERROR: {
    RESULT_CODE: '50060', HTTP_STATUS: '500', DEVELOPER_MESSAGE: 'unknown_error',
  },
  DB_ERROR: {
    RESULT_CODE: '50001', HTTP_STATUS: '500', DEVELOPER_MESSAGE: 'db_error',
  },
  CONNECTION_TIMEOUT: {
    RESULT_CODE: '50002', HTTP_STATUS: '500', DEVELOPER_MESSAGE: 'connection_timeout',
  },
  CONNECTION_ERROR: {
    RESULT_CODE: '50003', HTTP_STATUS: '500', DEVELOPER_MESSAGE: 'connection_error',
  },
  SYSTEM_ERROR_URL: {
    RESULT_CODE: '50100', HTTP_STATUS: '501', DEVELOPER_MESSAGE: 'invalid_url_structure',
  },
  SERVER_BUSY: {
    RESULT_CODE: '50300', HTTP_STATUS: '503', DEVELOPER_MESSAGE: 'server_busy',
  },
  SERVER_UNAVAILABLE: {
    RESULT_CODE: '50301', HTTP_STATUS: '503', DEVELOPER_MESSAGE: 'server_unavailable',
  },
  GATEWAY_TIMEOUT: {
    RESULT_CODE: '50400', HTTP_STATUS: '504', DEVELOPER_MESSAGE: 'gateway_timeout_error',
  },
});

module.exports.collectionMongo = Object.freeze({
  CREDENTIAL: 'enroll_credential',
  ENROLL_INFORMATION: 'enroll_information',
});


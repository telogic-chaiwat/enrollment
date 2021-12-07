module.exports.buildResponse = function(statusObject) {
  return {
    'status': statusObject.HTTP_STATUS,
    'body': {
      'resultCode': statusObject.RESULT_CODE,
      'developerMessage': statusObject.DEVELOPER_MESSAGE,
    },
  };
};

module.exports.parseError = function(errorObject) {
  if (errorObject) {
    // const params = [];
    const errroString = errorObject.details[0].type || '';
    const fisrtIndex = (errorObject.details[0].message || '').indexOf('"');
    const lastIndex = (errorObject.details[0].message || '').lastIndexOf('"');
    const paramsError = (errorObject.details[0].message || '').
        slice(fisrtIndex+1, lastIndex);
    // errorObject.details[0].path.forEach((element) => {
    //  params.push(element);
    // pm2 });
    if (errroString.includes('required')) {
      // missing
      return 'missing=' + paramsError
      ;
    } else {
      // invalid
      return 'invalid='+paramsError;
    }
  }
};

module.exports.parseErrorMulti = function(errorObjects) {
  if (errorObjects) {
    const missingParams = [];
    const invalidParams = [];
    errorObjects.filter(Boolean).forEach((errorObject) => {
      const errroString = errorObject.details[0].type || '';
      if (errroString.includes('required')) {
        // missing
        errorObject.details[0].path.forEach((element) => {
          missingParams.push(element);
        });
      } else {
        // invalid
        errorObject.details[0].path.forEach((element) => {
          invalidParams.push(element);
        });
        return 'invalid=' + invalidParams.join('.');
      }
    });

    if (missingParams.length) {
      return 'missing=' + missingParams.join('.');
    } else {
      return 'invalid=' + invalidParams.join('.');
    }
  }
};

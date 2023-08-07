const responseHelper = {
  //for all standard errors
  error: function (res, message, httpCode = 200) {
    res.status(httpCode).json({
      statusCode: 422,
      message: message,
    });
  },

  //for database save error
  databaseError: function (res, error, httpCode = 200) {
    console.log("DB_ERROR : ", error);
    if (error && error.code && error.code == 11000) {
      res.status(httpCode).json({
        statusCode: 500,
        message: "Fields Value should be Unique.",
      });
    } else {
      res.status(httpCode).json({
        statusCode: 500,
        message: "Server Error",
      });
    }
  },

  //for standard server error
  serverError: function (res, error, httpCode = 200) {
    // logger.error(`SERVER_ERROR : `, error);
    res.status(httpCode).json({
      statusCode: 500,
      message: "Server Error",
    });
  },

  // for bcrypt hash error
  bcryptError: function (res, error, httpCode = 200) {
    console.log("BCRYPT_ERROR : ", error);
    res.status(httpCode).json({
      statusCode: 500,
      message: "Bcrypt Error",
    });
  },

  //for succesful request with data
  successWithData: function (res, msg, data, httpCode = 200) {
    res.status(httpCode).json({
      statusCode: 200,
      message: msg,
      data: data,
    });
  },

  //for succesful request with data
  successWithPaginationData: function (
    res,
    msg,
    data,
    pagination,
    httpCode = 200
  ) {
    res.status(httpCode).json({
      statusCode: 200,
      message: msg,
      data: data,
      pagination,
    });
  },

  //for successful request with message
  successWithMessage: function (res, message, httpCode = 200) {
    res.status(httpCode).json({
      statusCode: 200,
      message: message,
    });
  },

  errorWithMessage: function (message, code) {
    return {
      status: code || 0,
      message: message || "Error occured",
      result: {},
    };
  },

  //for chart response
  chartResponse: function (res, data, httpCode = 200) {
    res.status(httpCode).json(data);
  },
};

global.responseHelper = responseHelper;
module.exports = responseHelper;

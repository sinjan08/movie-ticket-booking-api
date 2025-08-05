const apiResponse = (res, success = true, statusCode = 200, message = '', data = [], metadata = []) => {
  const response = {
    success: success,
    status: statusCode,
    message: message,
  };

  if (!success) {
    response.error = statusCode;
  } else {
    response.data = data;
  }

  if (metadata && metadata.length > 0) {
    response.metadata = metadata;
  }

  return res.status(statusCode).json(response);
}

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500
}


module.exports = {
  apiResponse,
  HTTP_STATUS
}
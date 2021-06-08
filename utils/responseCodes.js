const retCode = {
  ok                : { code: 200, message: "OK" },
  created           : { code: 201, message: "Created" },
  accepted          : { code: 202, message: "Accepted" },
  badRequest        : { code: 400, message: "Bad Request" },
  unauthorized      : { code: 401, message: "Unauthorized" },
  notFound          : { code: 404, message: "Not Found" },
  serverError       : { code: 500, message: "Internal Server Error" },
  processingError   : { code: 503, message: "Service Unavailable" },
  duplicate         : { code: 409, message: "Resource already in use" },
  conditionFailed   : { code: 412, message: "Precondition Failed" },
  noContent         : { code: 204, message: "The server processed the request and is not returning any content" }
};

const getResStatus = (code) => {
  let status = retCode.ok;
  switch(code) {
    case retCode.ok.code:
      status = retCode.ok;
      break;
    case retCode.created.code:
      status = retCode.created;
      break;
    case retCode.accepted.code:
      status = retCode.accepted;
      break;
    case retCode.badRequest.code:
      status = retCode.badRequest;
      break;
    case retCode.unauthorized.code:
      status = retCode.unauthorized;
      break;
    case retCode.notFound.code:
      status = retCode.notFound;
      break;
    case retCode.serverError.code:
      status = retCode.serverError;
      break;
    case retCode.processingError.code:
      status = retCode.processingError;
      break;
    case retCode.duplicate.code:
      status = retCode.duplicate;
      break;
    case retCode.conditionFailed.code:
        status = retCode.conditionFailed;
    break;
    case retCode.noContent.code:
      status = retCode.noContent;
    break;
  }
  return status;
}

module.exports = {
  retCode: retCode,
  getResStatus: getResStatus,
};

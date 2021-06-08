const logger = require('../utils/logger');
const { retCode, getResStatus } = require("../utils/responseCodes");
const { sendStatus } = require('../utils/statusmonitor');
const API_INDEX = 0;
const METHOD_INDEX = 1;
const ACESS_INDEX = 2;
const CB_INDEX = 3;
const SESSION_INDEX = 4;
let reqcntr = 0;

function InputBodyBuffer(req, res, next) {
  req.appver = req.headers['ver'];
  req.build = req.headers['build'];
  if(req.method === "GET" || (req.headers['content-type'] && req.headers['content-type'].indexOf("multipart") >= 0)) {
    next();
    return;
  }
  let data = "";
  req.on("data", function(chunk) {
    data += chunk;
  });
  req.on("end", function() {
    req.rawBody = data;
    next();
    return;
  });
}

function ResourceNotFound(req, res) {
  ResponseHandler(req, res, retCode.notFound, "No endpoint to receive data");
}

function ResponseHandler(request, response, respObj, resData, code) {
  const resp = {
    "message" : respObj.message,
    "data" : (resData ? resData : respObj.message),
    "code" : code
  };
  const respStr = JSON.stringify(resp);
  logger.info(
    '==> resid ', request.id,
    ' url ', request.originalUrl,
    ' reqBody ', (request.rawBody ? request.rawBody.substring(0,1024) : ''),
    ' resBody ', respStr.substring(0,256)
  );
  response.status(respObj.code).send(respStr);
}

function RequestHandler(router, arr) {
  arr.forEach((obj)=>{
    if(router[obj[METHOD_INDEX]]){
      router[obj[METHOD_INDEX]](obj[API_INDEX], (req, res)=>_FunctionMapHandler(req, res, obj));
    }
  });
}

function _FunctionMapHandler(req,res,obj) {
  // authorization check
  req.reqip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  if(obj[ACESS_INDEX] != 0){
    // check for access index in router handler files
    ResponseHandler(req, res, retCode.unauthorized, null);
    return;
  }
  else{
    const args = {
      ip: req.reqip,
      params : req.params,
      qs : req.query,
      appver : req.appver,
      bldver : req.build,
    };
    try {
      req.args = args;
      req.id = reqcntr++;
      args.user = _getSessValues(req.session, req.sessionID);

      logger.info('==> reqid :', req.id, " uid :",args.user.idx," sessionID :", req.sessionID);
      if(req.rawBody){
        try{
          args.body = JSON.parse(req.rawBody);
        }
        catch(ex){
          args.body = {};
        }
      }

      if(obj[SESSION_INDEX]){
        args.rawSession = req.session;
      }
      obj[CB_INDEX](args, function(rc, data, code){
        const status = getResStatus(rc.code);
        ResponseHandler(req, res, status, data, code);
      });
    }
    catch(ex) {
      ResponseHandler(req, res, retCode.serverError, "Sorry there is some issue on server, please try again later");
      // Send mail saying there is an excpetion in this format.
      // nodemailclient.sendMail('dipesh357@gmail.com', JSON.stringify(ex, Object.getOwnPropertyNames(ex), null, 2), 'exception');
      logger.error("Exception caught", JSON.stringify(ex, Object.getOwnPropertyNames(ex)));
    }
  }
}

function CheckSession(req, res, next) {
  if(req.method !== "OPTIONS"){
    if (! (req.session.src || req.session.src === "APIServer")) {
      ResponseHandler(req, res, retCode.unauthorized, "Login required");
      return;
    }
    // req.session.lu = Date.now(); // was setting the cookie again.
  }
  next();
  return;
}

function _getSessValues(session, sid) {
  const mysession = Object.assign({}, session);
  mysession.sid = sid;
  delete mysession.cookie;
  return mysession;
}

module.exports = {
  InputBodyBuffer: InputBodyBuffer,
  ResourceNotFound: ResourceNotFound,
  ResponseHandler : ResponseHandler,
  RequestHandler : RequestHandler,
  CheckSession : CheckSession,
};

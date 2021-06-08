const logger = require('./utils/logger');
const configmode = process.argv[2] || 'd';

switch (configmode) {
  case 's':
    // global.APICONFIG = require('stagingconf').api;
    // global.MONGOCONFIG = require('stagingconf').mongo;
    // global.MONGOUSERS = require('stagingconf').mongoUsers;
    break;
  case 'r':
    // global.APICONFIG = require('releaseconf').api;
    // global.MONGOCONFIG = require('releaseconf').mongo;
    // global.MONGOUSERS = require('releaseconf').mongoUsers;
    break;
  default:
    global.APICONFIG = require('./env/debug').api;
    global.MONGOCONFIG = require('./env/debug').mongo;
    global.MONGOUSERS = require('./env/debug').mongoUsers;
    break;
}

const express = require("express");
const app = express();
const middleware = require("./httpl/middleware");
const cookieParser = require("cookie-parser");

const dbClient = require('./dal/dbClient');
const { getSessionHandler } = require('./dal/sessionClient');
const DbName = require('./dal/dbcoll').DB;
const SessionColl = require("./dal/dbcoll").collections.sessions;
const { retCode } = require("./utils/responseCodes");
const { getReverseIp } = require("ipreverselookup");

getSessionHandler(DbName.sessions, SessionColl.sessions, (error, middleWareSessionHandler) => {
  if(!error){
    app.use(middleware.InputBodyBuffer);

    app.use(middleWareSessionHandler);
    app.use(cookieParser());

    if(APICONFIG.CORS){
      app.use(function(req, res, next) {
        if(req.headers.origin) res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
        res.header("Access-Control-Allow-Credentials", true);
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH");
        next();
      });
    }
    dbClient.ConnectDatabase(DbName.myDb, OnSuccess, OnFailure);
    dbClient.ConnectDatabase(DbName.chatDb);
    dbClient.ConnectDatabase(DbName.sessions);
  }else{
    logger.error("errorCaught", error);
    process.exit();
  }
});

function OnSuccess() {
  logger.info("Database connection established.");
  const users = require("./httpl/users/router");
  const auth = require("./httpl/auth");

  app.use("/users", users);
  app.use("/auth", auth);
  app.get("/ipInfo", function(req, res) {
    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    // const ip = "37.120.149.203" // Norway
    getReverseIp(ip, (resp)=>{
      // if(!resp) resp = dummyIPData;
      res.status(retCode.ok.code).send({ ip: ip, detail: resp });
    });
  });
  app.use("/isreachable",function (req, res) {
    res.sendStatus(retCode.noContent.code);
  });

  app.get("*", middleware.ResourceNotFound);
  app.post("*", middleware.ResourceNotFound);

  logger.info("Started node server in mode : ", configmode);

  app.listen(APICONFIG.PORT, function(err){
    if(err)
      logger.error(err);
    else{
      logger.info("express listening on port " + APICONFIG.PORT);
    }
  });

  logger.info("listening to port " + APICONFIG.PORT);
}

function OnFailure(err) {
  logger.info("DB connection failed ", err);
  process.exit();
}

process.on('uncaughtException', (ex, origin) => {
  logger.error("Exception caught Server", JSON.stringify(ex, Object.getOwnPropertyNames(ex)));
  setTimeout(() => {
    process.exit();
  }, 3000);
});

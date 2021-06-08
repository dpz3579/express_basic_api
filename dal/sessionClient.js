const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);

const cookie = {
  domain: APICONFIG.EXPRESS_SESSION.COOKIE.DOMAIN,
  path: APICONFIG.EXPRESS_SESSION.COOKIE.PATH,
  httpOnly: APICONFIG.EXPRESS_SESSION.COOKIE.HTTP_ONLY,
  maxAge: APICONFIG.EXPRESS_SESSION.COOKIE.MAX_AGE * 100,
};

const __getUrlString = (dbName) => {
  let url = "";
  const mongoconfigObj = MONGOCONFIG.MONGO[dbName];
  const dbUserObj = MONGOUSERS[dbName];

  if(mongoconfigObj.PROTO) url += mongoconfigObj.PROTO + "://";
  if(mongoconfigObj.HOST) url += mongoconfigObj.HOST;
  if(mongoconfigObj.PORT) url += ":" + mongoconfigObj.PORT;
  if(mongoconfigObj.authStr) url += "/?authSource=" + dbUserObj.nodeclient.dbName;
  return url;
};

function __getAuthSource(dbName){
  const dbUserObj = MONGOUSERS[dbName];
  let authSource = null;

  if(dbUserObj && dbUserObj.nodeclient && dbUserObj.nodeclient.dbName)
    authSource = dbUserObj.nodeclient.dbName;

  return authSource;
}

function __getAuthObj(dbName){
  const dbUserObj = MONGOUSERS[dbName];
  let auth = null;

  if( dbUserObj && dbUserObj.nodeclient ){
    auth = {};
    if(dbUserObj.nodeclient.user)
      auth["user"] = dbUserObj.nodeclient.user;
    if(dbUserObj.nodeclient.pwd)
      auth["password"] = dbUserObj.nodeclient.pwd;
  }
  return auth;
}

const _genStore = (dbName, sessionColl, cb) => {
  const sessionUrl = __getUrlString(dbName);

  const connectionOptions = {
    poolSize: 1,
    useNewUrlParser: true,
    useUnifiedTopology: true
  };

  // const authObj = __getAuthObj(dbName);
  // const authSource = __getAuthSource(dbName);

  // if(authObj){
  //   connectionOptions.auth = authObj;
  // }

  // if(authSource){
  //   connectionOptions.authSource = authSource;
  // }

  const store = new MongoDBStore(
    {
      uri: sessionUrl,
      databaseName: dbName,
      collection: sessionColl || "sessions",
      connectionOptions: connectionOptions,
    },
    function(error) {
      cb(error, store);
    }
  );
};

const getSessionHandler = (dbName, sessionColl, cb) => {
  _genStore(dbName, sessionColl, (err, store)=>{
    if(!err){
      if (APICONFIG.MODE == "d")
        delete cookie.domain;

      cb(
        null,
        session({
          store: store,
          name: APICONFIG.COOKIE_NM,
          cookie : cookie,
          resave: APICONFIG.EXPRESS_SESSION.RESAVE,
          saveUninitialized : APICONFIG.EXPRESS_SESSION.SAVE_UNINITIALIZED,
          secret : APICONFIG.EXPRESS_SESSION.SECRET,
        })
      );
    }else{
      cb(err, null);
    }
  });
};

module.exports = {
  getSessionHandler: getSessionHandler,
};

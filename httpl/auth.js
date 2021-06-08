const router = require("express").Router();
const middleware = require("./middleware");
const { retCode } = require("../utils/responseCodes");
const { retouchSession } = require("../utils/sessionHandler");

const dbClient = require('../dal/dbClient');
const heartPool = require('../dal/dbcoll').DB.heartpool;
const heartPoolColl = require('../dal/dbcoll').collections.heartpool;

const handlers = [
  [
    "/isLoggedIn",
    "get",
    0,
    function(args, cb){
      if(args.user.idx){
        retouchSession(args.rawSession, 48);
        dbClient.FindOneDocument(heartPool, heartPoolColl.userProfiles, { uid: args.user.idx }, { projection: { _id: 0 } }, (e,userProfile)=>{
          if(e){
            return cb(retCode.processingError, "EM67: Sorry Unable to get login status at the moment.");
          }else{
            cb(retCode.ok, userProfile);
          }
        });
      }else{
        cb(retCode.unauthorized, "Bad request, Please Login");
      }
    },
    true
  ]
];

router.use(middleware.CheckSession);
middleware.RequestHandler(router, handlers);

module.exports = router;

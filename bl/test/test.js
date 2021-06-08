const { retCode } = require("../../utils/responseCodes");
const logger = require('../../utils/logger');
const dbClient = require('../../dal/dbClient');
const heartPool = require('../../dal/dbcoll').DB.heartpool;
const heartPoolColl = require('../../dal/dbcoll').collections.heartpool;

function TestPost(args, cb) {
  let reqBody = args.body;
  dbClient.InsertDocument(heartPool, "test", {test: Date.now()}, (e,d)=>{
    if(e){
      return cb(retCode.processingError, "err");
    }
    logger.info(d);
    cb(retCode.ok,reqBody);
  });
}

function TestGet(args, cb) {
  logger.info("In test Get", args);
  cb(retCode.ok, args);
}

function TestMatch(args, cb) {
  const userData = {idx: 7};
  const reqBody = {
    "accuracy": 502.6322021484375,
    "altitude": 65.44654846191406,
    "heading": 0,
    "latitude": 18.781832795464023,
    "longitude": 73.33991991531477,
    "speed": 0.14483454823493958
  };

  if(!reqBody.latitude || ! reqBody.longitude) return cb(retCode.badRequest, "User location not accessible");

  const qBody = {
    uid: userData.idx,
    matchTyp: {$ne: 0},
  }

  dbClient.FindDistinctVal(heartPool, heartPoolColl.userMatches, qBody, 'matchId', {}, (e, matchIds)=>{
    if(e) return cb(retCode.processingError, "Sorry unable to get Matches");
    if(matchIds && matchIds.length){
      const matchQBody = {
        uid: {$in : matchIds},
        matchId: userData.idx,
        matchTyp: {$ne: 0}
      };
      dbClient.FindDistinctVal(heartPool, heartPoolColl.userMatches, matchQBody, 'uid', {}, (e,myMatches)=>{
        if(e) return cb(retCode.processingError, "Sorry unable to get Matches");
        if(myMatches && myMatches.length){
          const userQ = {
            uid: {$in : myMatches},
            isa: true
          };
          const options = {
            projection: {
              _id: 0,
              'coords.latitude': 1,
              'coords.longitude': 1,
              uid: 1
            }
          };
          dbClient.FindDocFieldsByFilter(heartPool, heartPoolColl.userProfiles, userQ, options, (e, matchesLoc)=>{
            if(e) cb(retCode.processingError, "Sorry unable to get matches");
            else cb(retCode.ok, matchesLoc);
          });
        }else{
          cb(retCode.badRequest, "No matches found");
        }
      })
    }else{
      cb(retCode.badRequest, "Sorry unable to get Matches");
    }
  });
}


function genNewHash(args, cb){
  const reqBody = args.body;

  reqBody.mob = parseInt(reqBody.mob);
  const pwd = crypto.createHmac("sha256",pwdKey).update(reqBody.pwd).digest("hex");
  const userSecret = crypto.createHmac("sha256",userKey).update(`${reqBody.mob}.${reqBody.pwd}`).digest("hex");

  logger.info( reqBody.mob, reqBody.pwd, userSecret, pwd );
  const respObj = {
    isd: reqBody.isd,
    mob: reqBody.mob,
    pwd: reqBody.pwd,
    secret: userSecret,
    pwd: pwd
  };

  dbClient.UpdateOneDocument(heartPool, heartPoolColl.users, { isd: reqBody.isd ,mob: reqBody.mob }, { pwd: pwd, userSecret: userSecret }, {}, (e, d)=>{
    if(e)
      logger.error("There was an error",e);
    respObj.result = d.result;
    cb(retCode.ok, respObj);
  });
}

module.exports = {
  TestPost: TestPost,
  TestGet: TestGet,
  genNewHash: genNewHash,
  TestMatch: TestMatch,
};

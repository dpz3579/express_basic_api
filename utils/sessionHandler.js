const logger = require('../utils/logger');

const saveSession = (sess, obj, keys) => {
  try{
    const userResp = {};
    if(!sess)
      sess = {};

    keys.forEach((key)=>{
      if(obj[key]){
        userResp[key] = obj[key];
        sess[key] = obj[key];
      }
    });
    sess['ts'] = Date.now();

    sess.save((err) => {
      if(err)
        logger.error("Session Save err", err);
      else
        logger.info("Session Saved", sess.refId);
    });
    return userResp;
  }catch(ex){
    logger.error("Unable to save session", ex);
  }
};

const addKeyinSession = (sess, key, value) => {
  try{
    sess[key] = value;

    sess.save((err)=>{
      if(err)
        logger.error("Session save err", err);
      else
        logger.info("Session saved", sess.refId);
    });
  }catch(ex){
    logger.error("Unable to save session", ex);
  }
}

const retouchSession = (sess) => {
  const maxAge = APICONFIG.EXPRESS_SESSION.COOKIE.MAX_AGE;
  sess.cookie.maxAge = maxAge;
  sess.touch();
};

const clearSession = (sess, cb) => {
  sess.destroy(function(err) {
    if(err)
      cb(err);
    else
      cb(null);
  });
}

module.exports = {
  saveSession: saveSession,
  addKeyinSession: addKeyinSession,
  retouchSession: retouchSession,
  clearSession: clearSession,
};

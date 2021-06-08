const api = {
  name: 'apiServer',
  PORT: 9091,
  MODE: 'd',
  CORS: true,
  secretKeys: {
    sessionSecret: "sessionSecret",
    otpKey: "otpsecret",
    userKey: "userpwdsecret", // Key for cryptograpy. Keep it secret
    pwdKey: "pwdkey",
  },
  EXPRESS_SESSION : {
    RESAVE: false,
    SAVE_UNINITIALIZED : false,
    SECRET : "mySessionSecret",
    COOKIE : {
      DOMAIN: ".domain.com",
      PATH: "/",
      HTTP_ONLY: true,
      SECURE: false,
      MAX_AGE: 2 * 3600000,
    }
  },
  COOKIE_NM: 'debug_cookie',
  FCM_TOKEN: "apnToken",
  KEY_ID: "KEY_ID",
  TEAM_ID: "TEAM_ID",
};

const mongo = {
  MONGO: {
    myDb: {
      PROTO: "mongodb",
      HOST: "127.0.0.1",
      PORT: "27017",
    },
    chatDb: {
      PROTO: "mongodb",
      HOST: "127.0.0.1",
      PORT: "27017",
    },
    sessions: {
      PROTO: "mongodb",
      HOST: "127.0.0.1",
      PORT: "27017",
    },
  },
};

const mongoUsers = {
  myDb: {
    nodeclient: { dbName: 'myDb', user: 'jgbuser', pwd: 'jgbuser123' },
    // encDb: 'jgbEncryption',
    // keyVaultColl: '__jgbDataEncryptionKeys',
    // encryptionKey: 'HPzB40snWNmou3pyjPv+M8+wJ8lZVt0lESJxf3FxaWQPwZJjNnU1jL3870lpkZETuFcrJG5unfr3zCeaXdO+h24RyRHFiElof+qKkNz7rBXD3o6lqWWaurVwkLjhZQ8O'
  },
  chatDb : {
    nodeclient: { dbName: 'chatDb', user: 'jgbmsgs', pwd: 'jgbmsgs123' },
    // encDb: 'jgbEncryption',
    // keyVaultColl: '__jgbChatsEncryptionKeys',
    // encryptionKey: 'URhM5ORW/cRhF87C7DH5bo4aTPgq9HWiE+LOD/NDwXZQaWHpRve16YzC7Atj7bMQ529nLHsAtyVvwEcmR1bBLBDfp2LBCcMYDapF7xWjjAQyAEA+B9TfnUphjY1qJgk6'
  },
  sessions: {
    nodeclient: { dbName: 'sessions', user: 'jgbsession', pwd: 'jgbsession123' },
    // encDb: 'jgbEncryption',
    // keyVaultColl: '__jgbSessionEncryptionKeys',
    // encryptionKey: '0cEhlCrkYBB/6wcNdiF290BElZOif/gfzO8NJAyB1QSJjenKOOTPsjBw3ffg/zRhZvggbcRni0TF8kn6xM74eWjalo8WkhtqUqY0DAlsI/c46lPuty62z9BJU6Jt/5gv'
  }
}

module.exports = {
  api,
  mongo,
  mongoUsers
};

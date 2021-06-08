const DB = {
  myDb: "myDb",
  chatDb: "chatDb",
  sessions: "sessions",
};

const collections = {
  myDb: {
    users: "users",
    unverifiedUsers: "unverifiedUsers",
    tokens: "tokens",
    userProfiles: "userProfiles",
    userMatches: "userMatches",
    userReports: "userReports",
    userDevices: "userDevices",
    userCheckins: "userCheckins",
  },
  chatDb: {
    chats: "chats",
  },
  sessions: {
    session: "app_sess",
  }
};

module.exports = {
  DB,
  collections
}

const logger = require('./logger');
const http = require("https");
const apn = require("apn");
const path = require("path");

sendNotif = (notifObj, uDev) => {
  if(uDev.os == "android") {
    sendAndroidNotif(notifObj);
  }else if(uDev.os == "ios"){
    sendiOSNotif(notifObj);
  }
}

sendAndroidNotif = (notifObj) => {
  const notif_val = {
    "to": '', // FCM Token
    "notification": {
      "title": "Check this Mobile (title)",
      "body": "Rich Notification testing (body)",
      "mutable_content": true,
    },
    "priority": "HIGH"
  };

  const options = {
    "method": "POST",
    "hostname": "fcm.googleapis.com",
    "port": null,
    "path": "/fcm/send",
    "headers": {
      "content-type": "application/json",
      "authorization": "key="+ APICONFIG.FCM_TOKEN,
    }
  };

  notif_val.to = notifObj.to;
  notif_val.notification.title = notifObj.title;
  notif_val.notification.body = notifObj.body;

  const req = http.request(options, function (res) {
    let resp = '';

    res.on('data', (chunk) => {
      resp += chunk.toString();
    });
    res.on('end', () => {
      logger.debug('No more data in response', resp);
    });
  });

  req.on("error", function(e) {
    logger.error('error in fcm notif',e);
  });

  req.write(JSON.stringify(notif_val));
  req.end();
}

sendiOSNotif = (notifObj) => {
  const IOS_CONSTANTS = {
    appID: 'org.company.package',
    keyId: APICONFIG.KEY_ID,
    teamId: APICONFIG.TEAM_ID
  };

  const options = {
    token: {
      key: path.join(__dirname, '../utils/','AuthKey_KEY_ID.p8'),
      keyId: IOS_CONSTANTS.keyId,
      teamId: IOS_CONSTANTS.teamId,
    },
    production: false,
  };

  let apnToken = '';

  if(notifObj.to) apnToken = notifObj.to;

  if(apnToken){
    let serviceForApn = new apn.Provider(options);

    let note = new apn.Notification();
    note.alert = "Join Gaybar";
    note.title = notifObj.title; // title for notif
    note.body = notifObj.body; // message
    // note.sound = (user.ver && parseFloat(user.ver) > 12.16 && notif.t !== notifType.VIBRATION) ? "ajjasnotif.aiff" : "chime.caf";
    note.expiry = Math.floor(Date.now() / 1000) + (24 * 3600);

    // note.payload = notif;
    note.contentAvailable = true;

    note.topic = IOS_CONSTANTS.appID; // for apn only

    serviceForApn.send(note, apnToken).then(result => {
      if(result.sent.length){
        logger.info('ios push notification sent successfully to token ' + apnToken);
      }
      if(result.failed && result.failed.length){
        logger.error("Failed sending push notification for apn: ", result.failed[0].response);
      }
    });

    serviceForApn.shutdown();
  }
}

module.exports = {
  sendNotif,
};

const logger = require('./logger');

const client = require('dgram').createSocket('udp4');
const host = require('os').hostname();

const startTS = Date.now();

let hostName = host;
try{
  hostName = host.split('.').filter((str)=>{ if(str.indexOf('ip-') == -1) return str }).join('.');
}catch(ex){
  logger.error("Excpetion in converting hostname", ex);
}

const sendStatus = function(json){
  try{
    json.id = process.worker ? process.worker.id : 1;
    json.id = json.id + '@' + hostName;
    if(json.status){
      json.status.sts = startTS;
      json.status.ts = Date.now();
    }
    const message = JSON.stringify(json);
    client.send(message, 0, message.length, 9088, '127.0.0.1', function(err, bytes) {
      if(err)
        logger.error('error sending status', err, message);
    });
  }
  catch(e){
    logger.error('error sending status', e, json);
  }
};

module.exports = {
  sendStatus
};

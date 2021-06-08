const mclient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;
const logger = require("../utils/logger");
const client = {};

function IsObject(obj) {
  if(obj instanceof Array) return false;
  else if(Object.keys(obj) <= 0) return false;
  else return true;
}

function __getUrlString(dbName){
  let url = "";
  // mongodb+srv://name:pwd@my-cluster-domain.mongodb.net";
  // "mongodb://user:pass@127.0.0.1:27017?authSource=admin";
  const mongoconfigObj = MONGOCONFIG.MONGO[dbName];

  if(mongoconfigObj.PROTO) url += mongoconfigObj.PROTO + "://";
  if(mongoconfigObj.HOST) url += mongoconfigObj.HOST;
  if(mongoconfigObj.PORT) url += ":" + mongoconfigObj.PORT;
  return url;
}

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

function ConnectDatabase( dbName, onSuccess = (()=>{}), onFailure = (()=>{}) ){
  try {
    logger.debug("Connecting to " + dbName);
    const options = {
      poolSize: 1,
      useNewUrlParser: true,
      useUnifiedTopology: true
    };

    const connStr = __getUrlString(dbName);
    // const authObj = __getAuthObj(dbName);
    // const authSource = __getAuthSource(dbName);

    // if(authObj){
    //   options.auth = authObj;
    // }

    // if(authSource){
    //   options.authSource = authSource;
    // }

    mclient.connect(connStr, options, (err, database) => {
      if(err) {
        logger.error("MongoClient Connect: Connection failed.");
        onFailure();
        return;
      } else {
        client[dbName] = database;
        logger.debug("MongoClient Connect: Connection successfull.");
        onSuccess();
        return;
      }
    });
  }
  catch(ex) {
    logger.error("Error caught,", ex);
    onFailure(ex);
  }
}

function __getNextKey(dbName, coll, cb){
  try {
    client[dbName].db(dbName).collection("counters").findOneAndUpdate({_id: coll}, {$inc : {counter: 1}}, { upsert: true }, function(err, doc) {
      if(err){
        cb("try Later");
      }else{
        cb(null, doc.value);
      }
    });
  }
  catch(e) {
    logger.error("MongoClient.FindOneDocument: Error caught,", e);
    cb(e, null);
  }
}

function FindDocuments(dbName, coll, cb) {
  try {
    client[dbName].db(dbName).collection(coll).find().toArray(function(err, data) {
      if(err) logger.error("MongoClient.FindDocuments: error finding the document,", err);
      cb(err, data);
    });
  }
  catch(e) {
    logger.error("MongoClient.FindDocuments: Error caught,", e);
    cb(e, null);
  }
}

function FindDocFieldsByFilter(dbName, coll, query, options, cb) {
  if(!query){
    throw Error("MongoClient.FindDocFieldsByFilter: query is not an object");
  }
  try {
    if(options && options.projection) options.projection["_id"] = 0;
    else options = { projection : { _id: 0 } };
    client[dbName].db(dbName).collection(coll).find( query, options ).toArray(function(err, item) {
      if(err) logger.error("MongoClient.FindDocFieldsByFilter: error in checking document existence", err);
      cb(err, item);
    });
  }
  catch(e) {
    logger.error("MongoClient.FindDocFieldsByFilter: Error caught,", e);
    cb(e, null);
  }
}

function FindOneDocument(dbName, coll, query, options, cb) {
  if(!query){
    throw Error("MongoClient.FindOneDocument: query is not an object");
  }
  try {
    if(options && options.projection) options.projection["_id"] = 0;
    else options = { projection : { _id: 0 } };
    client[dbName].db(dbName).collection(coll).findOne(query, options, function(err, item) {
      if(err) logger.error("MongoClient.FindOneDocument: error in checking document existence", err);
      cb(err, item);
    });
  }
  catch(e) {
    logger.error("MongoClient.FindOneDocument: Error caught,", e);
    cb(e, null);
  }
}

function FindDistinctVal(dbName, coll, query, key, options, cb){
  if(!query || !key){
    throw Error("MongoClient.FindDistinctVal: query is not an object, or key is not present");
  }
  try {
    client[dbName].db(dbName).collection(coll).distinct(key, query, options, function(err, item) {
      if(err) logger.error("MongoClient.FindDistinctVal: error in checking document existence", err);
      cb(err, item);
    });
  }
  catch(e) {
    logger.error("MongoClient.FindDistinctVal: Error caught,", e);
    cb(e, null);
  }
}

function FindDocByAggregation(dbName, coll, pipeline, options, cb){
  if(!pipeline.length){
    throw Error("MongoClient.FindDocByAggregation: pipeline is not defined");
  }
  try{
    options.allowDiskUse = true;
    client[dbName].db(dbName).collection(coll).aggregate(pipeline, options).toArray(function(err, item) {
      if(err) logger.error("MongoClient.FindDocByAggregation: error in checking document existence", err);
      cb(err, item);
    });
  }catch(e){
    logger.error("MongoClient.FindDocByAggregation: Error caugth", e);
    cb(e, null);
  }
}

function InsertDocument(dbName, coll, doc, cb) {
  try {
    if(!IsObject(doc)){
      throw Error("MongoClient.InsertDocument: document is not an object");
    }
    __getNextKey(dbName, coll, (e,d)=>{
      doc.idx = d.counter;

      client[dbName].db(dbName).collection(coll).insertOne(doc, function(err, data) {
        if(err) logger.error("MongoClient.InsertDocument: error inserting the document.", err);
        cb(err, data);
      });
    });
  }
  catch(e) {
    logger.error("MongoClient.InsertDocument: Error caught,", e);
    cb(e, null);
  }
}

function UpdateOneDocument(dbName, coll, query, values, option, cb) {
  if(!(IsObject(values) && IsObject(query) && option)){
    throw Error("MongoClient.UpdateOneDocument: values, query and option should be an object");
  }
  try {
    client[dbName].db(dbName).collection(coll).updateOne(query, {$set : values}, option, function(err, result) {
      if(err) logger.error("MongoClient.UpdateOneDocument: error updating the document with values", err);
      cb(err, result);
    });
  }
  catch(e) {
    logger.error("MongoClient.UpdateOneDocument: Error caught", e);
    cb(e);
  }
}

function FindOneAndUpsert(dbName, coll, query, values, cb){
  if(!(IsObject(values) && IsObject(query))){
    throw Error("MongoClient.FindOneAndUpsert: values, query should be an object");
  }
  try{
    client[dbName].db(dbName).collection(coll).findOneAndUpdate(query, {$set : values }, { upsert: true }, function(err, doc) {
      if(err) logger.error("MongoClient.FindOneAndUpsert: error updating the document with values", err);
      cb(err, doc.value);
    });
  }catch(e){
    logger.error("MongoClient.FindOneAndUpsert: Error caught",e);
    cb(e);
  }
}

function FindOneAndUpdate(dbName, coll, query, values, option, cb){
  if(!(IsObject(values) && IsObject(query))){
    throw Error("MongoClient.FindOneAndUpsert: values, query should be an object");
  }
  try{
    client[dbName].db(dbName).collection(coll).findOneAndUpdate(query, {$set : values }, option, function(err, doc) {
      if(err) logger.error("MongoClient.FindOneAndUpsert: error updating the document with values", err);
      cb(err, doc.value);
    });
  }catch(e){
    logger.error("MongoClient.FindOneAndUpsert: Error caught",e);
    cb(e);
  }
}

function UpdateDocument(dbName, coll, query, values, option, cb) {
  if(!(IsObject(values) && IsObject(query) && option)){
    throw Error("MongoClient.UpdateDocument: values, query and option should be an object");
  }
  try {
    if(values["$set"] || values["$unset"] || values["$inc"] || values["$push"] || values["$addToSet"] || values["$pop"] || values["$pull"]){
      client[dbName].db(dbName).collection(coll).updateOne(query, values, option, function(err, result) {
        if(err) logger.error("MongoClient.UpdateDocument: error updating the document with values", err);
        cb(err, result);
      });
    }else{
      throw Error("MongoClient.UpdateDocument: values should be an object");
    }
  }
  catch(e) {
    logger.error("MongoClient.UpdateOneDocument: Error caught,", e);
    cb(e, null);
  }
}

function UpdateManyDocument(dbName, coll, query, values, option, cb) {
  if(!(IsObject(values) && IsObject(query) && option)){
    throw Error("MongoClient.UpdateDocument: values, query and option should be an object");
  }
  try {
    if(values["$set"] || values["$unset"] || values["$inc"] || values["$push"] || values["$addToSet"] || values["$pop"] || values["$pull"]){
      client[dbName].db(dbName).collection(coll).updateMany(query, values, option, function(err, result) {
        if(err) logger.error("MongoClient.UpdateDocument: error updating the document with values", err);
        cb(err, result);
      });
    }else{
      throw Error("MongoClient.UpdateDocument: values should be an object");
    }
  }
  catch(e) {
    logger.error("MongoClient.UpdateOneDocument: Error caught,", e);
    cb(e, null);
  }
}

function GetDocumentCountByQuery(dbName, coll, query, cb) {
  try {
    client[dbName].db(dbName).collection(coll).count(query, function(err, data) {
      if(err) logger.error("MongoClient.GetDocumentCountByQuery: error counting the document with query,", err);
      cb(err, data);
    });
  }
  catch(e) {
    logger.error("MongoClient.GetDocumentCountByQuery: Error caught,", e);
    cb(e, null);
  }
}

function DeleteDocument(dbName, coll, query, options, cb){
  try{
    client[dbName].db(dbName).collection(coll).find( query, { projection: {_id: 0} } ).toArray((err, items) => {
      if(err){
        logger.error("MongoClient.FindDocFieldsByFilter: error in checking document existence", err);
        cb(err, null);
      }else{
        if(items && items.length){
          let newcoll = "archieved_" + coll + "_";
          client[dbName].db(dbName).collection(newcoll).insertMany(items, {}, (err) => {
            if(err){
              logger.error("MongoClient.FindDocFieldsByFilter: error in checking document existence", err);
              cb(err, null);
            }else{
              client[dbName].db(dbName).collection(coll).deleteMany(query, options, (err,data) => {
                cb(err,data);
              });
            }
          });
        }else{
          cb(null);
        }
      }
    });

  }catch(e){
    logger.error("MongoClient.deleteMany: Error caught,", e);
    cb(e,null);
  }
}

function PermanentDeleteMany(dbName, coll, query, options, cb){
  try{
    client[dbName].db(dbName).collection(coll).deleteMany(query, options, function(err, data) {
      if(err) logger.error("MongoClient.deleteMany: error counting the document with query,", err);
      cb(err, data);
    });
  }
  catch(e){
    logger.error("MongoClient.deleteMany: Error caught,", e);
    cb(e,null);
  }
}

module.exports = {
  ConnectDatabase: ConnectDatabase,
  ObjectId: ObjectId,
  GetDocumentCountByQuery: GetDocumentCountByQuery,
  FindDocuments: FindDocuments,
  FindOneDocument: FindOneDocument,
  FindDocFieldsByFilter: FindDocFieldsByFilter,
  FindDistinctVal: FindDistinctVal,
  FindDocByAggregation: FindDocByAggregation,
  InsertDocument: InsertDocument,
  UpdateOneDocument: UpdateOneDocument,
  UpdateDocument: UpdateDocument,
  FindOneAndUpdate: FindOneAndUpdate,
  UpdateManyDocument: UpdateManyDocument,
  FindOneAndUpsert: FindOneAndUpsert,
  DeleteDocument: DeleteDocument,
  PermanentDeleteMany:PermanentDeleteMany,
};

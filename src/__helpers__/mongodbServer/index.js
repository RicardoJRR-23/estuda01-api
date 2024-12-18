const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongodb;

const dbConnect = async () => {
  mongodb = await MongoMemoryServer.create();
  const uri = mongodb.getUri();
  await mongoose.connect(uri);
}

const dbDisconnect = async () => {
  await mongoose.disconnect();
  await mongodb.stop();
}

module.exports = {
  dbConnect,
  dbDisconnect
};

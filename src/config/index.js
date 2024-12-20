const mongoose = require('mongoose');

const dbConnect = async () => {
  try {
    console.info('Connecting to the database...');
    await mongoose.connect(process.env.DATABASE_URL);
    console.info('Database connected successfuly.');
  } catch(error) {
    console.error('Error on database connection:', error);
  }
}

const dbDisconnect = async () => {
  try {
    console.info('Disconnecting from the database...');
    await mongoose.disconnect();
    console.info('Database successfuly disconnected.');
  } catch(error) {
    console.error('Error while disconnecting from the database:', error);
  }
}

module.exports = {
  dbDisconnect,
  dbConnect
};

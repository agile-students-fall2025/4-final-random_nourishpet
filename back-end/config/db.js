const mongoose = require('mongoose');
require('dotenv').config();

let connectionPromise;
let memoryServer;

const resolveMongoURI = async () => {
  if (process.env.NODE_ENV === 'test') {
    if (!memoryServer) {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create();
    }
    return memoryServer.getUri();
  }

  return process.env.MONGODB_URI;
};

const connectDB = async () => {
  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = (async () => {
    const mongoURI = await resolveMongoURI();

    if (!mongoURI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    await mongoose.connect(mongoURI);

    const label = process.env.NODE_ENV === 'test' ? ' (in-memory)' : '';
    console.log(`MongoDB connected successfully${label}`);

    return mongoose.connection;
  })().catch((error) => {
    connectionPromise = undefined;
    console.error('MongoDB connection error:', error.message);

    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }

    throw error;
  });

  return connectionPromise;
};

module.exports = connectDB;


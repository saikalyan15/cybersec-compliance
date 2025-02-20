import mongoose from 'mongoose';
import seedDatabase from './seedDb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

// Increase max listeners for mongoose connection
mongoose.connection.setMaxListeners(15);

const MONGODB_URI: string = process.env.MONGODB_URI;

let isConnected = false;
let isSeeded = false;
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

mongoose.connection.on('connected', () => (isConnected = true));
mongoose.connection.on('disconnected', () => {
  isConnected = false;
  isSeeded = false;
});
mongoose.connection.on('error', () => {
  isConnected = false;
  isSeeded = false;
});

process.on('SIGINT', async () => {
  if (cached.conn) {
    await mongoose.disconnect();
  }
  process.exit(0);
});

export default dbConnect;

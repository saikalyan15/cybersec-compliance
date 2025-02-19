import mongoose from 'mongoose';
import seedDatabase from './seedDb';

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let isConnected = false;
let isSeeded = false;
const cached =
  global.mongoose || (global.mongoose = { conn: null, promise: null });

async function dbConnect() {
  try {
    if (isConnected && cached.conn) {
      return cached.conn;
    }

    if (cached.promise) {
      cached.conn = await cached.promise;
      return cached.conn;
    }

    const opts = {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then(async (mongoose) => {
        isConnected = true;
        if (!isSeeded) {
          await seedDatabase();
          isSeeded = true;
        }
        return mongoose.connection;
      });

    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    isConnected = false;
    isSeeded = false;
    cached.promise = null;
    cached.conn = null;
    throw error;
  }
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

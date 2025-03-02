import mongoose, { Connection } from 'mongoose';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

const MONGODB_URI: string = process.env.MONGODB_URI;

// Define the cached connection type
interface ConnectionCache {
  conn: Connection | null;
  promise: Promise<Connection> | null;
}

// Define a type for the global object with our cache property
interface CustomGlobal extends Global {
  mongooseCache?: ConnectionCache;
}

// Use a more specific type than 'any'
const globalWithCache = global as unknown as CustomGlobal;

// Initialize the cache
const cached: ConnectionCache = globalWithCache.mongooseCache || {
  conn: null,
  promise: null,
};

// Set the cache on the global object if it doesn't exist
if (!globalWithCache.mongooseCache) {
  globalWithCache.mongooseCache = cached;
}

async function dbConnect(): Promise<Connection> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    // Make sure MONGODB_URI is used
    const uri = MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    cached.promise = mongoose.connect(uri, opts).then((mongoose) => {
      return mongoose.connection;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    console.error(
      'MongoDB connection error:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    throw error;
  }

  return cached.conn;
}

export default dbConnect;

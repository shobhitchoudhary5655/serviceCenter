import mongoose from 'mongoose';

// MongoDB connection string - use environment variable or default
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://shobhitsourceryit_db_user:Shobhit%405655@cluster0.ajvggdr.mongodb.net/service_center?retryWrites=true&w=majority&appName=Cluster0';

// Only throw error at runtime, not during build
if (typeof process !== 'undefined' && process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI) {
  console.warn('Warning: MONGODB_URI environment variable is not set');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function connectDB() {
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

export default connectDB;


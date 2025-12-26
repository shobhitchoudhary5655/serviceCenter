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
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('MongoDB connected successfully');
      return mongoose;
    }).catch((error) => {
      cached.promise = null;
      console.error('MongoDB connection error:', error);
      
      // Provide helpful error messages
      if (error?.message?.includes('IP') || error?.message?.includes('whitelist')) {
        console.error('⚠️ IP not whitelisted in MongoDB Atlas');
        console.error('Solution: Add 0.0.0.0/0/0 to MongoDB Atlas Network Access');
        console.error('See MONGODB_ATLAS_SETUP.md for instructions');
      } else if (error?.message?.includes('authentication failed')) {
        console.error('⚠️ MongoDB authentication failed');
        console.error('Check your username and password in MONGODB_URI');
      } else if (error?.message?.includes('ECONNREFUSED') || error?.message?.includes('ENOTFOUND')) {
        console.error('⚠️ Cannot reach MongoDB server');
        console.error('Check your MONGODB_URI and network connection');
      }
      
      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e: any) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;


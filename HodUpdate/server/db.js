/*
 * db.js
 * ------------------------------------------------------------------
 * Connects the server to the local MongoDB instance using Mongoose.
 * Called once when the server starts (from app.js). If the connection
 * fails (e.g. mongod is not running) we log a clear error and stop the
 * server, instead of failing silently on the first query later.
 * ------------------------------------------------------------------
 */
import mongoose from 'mongoose';

// Local MongoDB server + database name. The DB/collections already exist
// (created in Compass), but Mongo would also create them on first write.
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/mathematikids';

export async function connectDB() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log('✅ Connected to MongoDB:', MONGO_URL);
  } catch (error) {
    console.error('❌ Could not connect to MongoDB. Is "mongod" running?');
    console.error(error.message);
    process.exit(1); // running the server without a DB is pointless
  }
}

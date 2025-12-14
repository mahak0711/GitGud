// lib/db.ts

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

// 1. Define the Message Schema
const MessageSchema = new mongoose.Schema({
    sessionId: { type: String, required: true, index: true }, // Index for fast lookup by session ID
    role: { type: String, required: true }, // 'user' or 'model'
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});

// 2. Create the Model (only create if it doesn't already exist)
const MessageModel = mongoose.models.Message || mongoose.model('Message', MessageSchema);

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

// Export the model for use in API routes
export { MessageModel };
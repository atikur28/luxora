// lib/mongodb.ts
import mongoose from "mongoose";

if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI not defined");

const uri = process.env.MONGODB_URI;

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectToDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri).then((mongoose) => mongoose);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

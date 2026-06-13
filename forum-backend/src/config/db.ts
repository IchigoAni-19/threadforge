/**
 * FILE: src/config/db.ts
 * 
 * PURPOSE:
 * This file handles connecting to the MongoDB database.
 * Before the app can read or write data, it must establish a connection.
 * 
 * HOW IT FITS IN:
 * - Called once when the server starts (in src/server.ts)
 * - Sets up the connection to MongoDB so models can query the database
 * - Uses settings from env.ts
 * 
 * INTERACTIONS:
 * - Used by: src/server.ts (on app startup)
 * - Connects to: MongoDB database specified in env.mongoUri
 */

import mongoose from 'mongoose';

import { env } from './env';

/**
 * Connects the app to the MongoDB database
 * 
 * WHY IT EXISTS:
 * Before the app can save/fetch data, it needs an active connection to MongoDB.
 * This function sets up that connection once at startup.
 * 
 * INPUT: None (uses env.mongoUri from environment)
 * 
 * OUTPUT: A Promise that resolves when connected (async function)
 * 
 * LOGIC:
 * 1. Set mongoose to strict query mode (only allow fields defined in schema)
 * 2. Connect to MongoDB using the connection string
 * 3. Set up connection pool with max 10 connections (for multiple requests)
 * 4. Wait for connection to complete (await keyword)
 * 
 * HOW IT'S USED:
 * In src/server.ts, called before starting the Express server:
 *   await connectDatabase();
 *   // Now safe to query the database
 * 
 * WHY async/await:
 * Connecting to a database takes time. async/await lets the app wait
 * without freezing. Other code can run while waiting for the connection.
 */
export const connectDatabase = async (): Promise<void> => {
  // strictQuery: true means Mongoose will ignore fields that aren't in the schema
  // This prevents bugs from typos in field names
  mongoose.set('strictQuery', true);
  
  // Connect to MongoDB using the URI from environment variables
  // maxPoolSize: 10 means keep up to 10 simultaneous connections ready
  // This helps when many requests come in at once
  await mongoose.connect(env.mongoUri, {
    maxPoolSize: 10
  });
};

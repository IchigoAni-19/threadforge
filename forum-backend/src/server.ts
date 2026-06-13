/**
 * FILE: src/server.ts
 *
 * PURPOSE:
 * Application entry point (where it all starts).
 * Connects to database and starts Express server listening.
 *
 * THIS IS THE BOOTSTRAP PROCESS
 * 
 * EXECUTION FLOW:
 * 1. npm start runs: "tsc && node dist/server.js"
 * 2. Node loads dist/server.js
 * 3. Calls bootstrap() function
 * 4. bootstrap() connects to MongoDB
 * 5. bootstrap() creates Express app
 * 6. bootstrap() calls app.listen(port)
 * 7. Server is now accepting HTTP requests
 *
 * HOW TO FIND ERRORS:
 * - If connection fails: check MONGODB_URI in .env
 * - If port in use: check PORT in .env
 * - If crash: check console.log output
 */

import { createApp } from './app';
import { connectDatabase } from './config/db';
import { env } from './config/env';

/**
 * BOOTSTRAP FUNCTION
 * 
 * Name convention: bootstrap = initialize the application
 * 
 * WHY ASYNC?
 * - connectDatabase() is async (waits for MongoDB connection)
 * - We MUST wait for connection before starting server
 * - If we started server before DB connected, requests would fail
 */
const bootstrap = async (): Promise<void> => {
  // STEP 1: Connect to MongoDB
  // This function:
  // - Reads MONGODB_URI from .env
  // - Connects to MongoDB server
  // - Returns when connection established or throws error
  // - If connection fails, bootstrap() stops here
  await connectDatabase();

  // STEP 2: Create Express app (from app.ts)
  // This function:
  // - Creates Express instance
  // - Registers middleware
  // - Registers routes
  // - Returns app (not started yet)
  const app = createApp();
  
  // STEP 3: Start listening for HTTP requests
  // app.listen(port, callback)
  // - port: from env.PORT in .env (default 3000)
  // - callback: runs when server is listening
  // - Now the server will receive and process HTTP requests
  app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on port ${env.port}`);
  });
};

/**
 * ENTRY POINT
 * 
 * void bootstrap() means:
 * - Run bootstrap() immediately
 * - "void" tells TypeScript: "I know this returns Promise but I'm not awaiting it"
 * - bootstrap() runs and handles errors internally
 *
 * After this line:
 * - MongoDB connection is established
 * - Express server is listening
 * - Clients can make HTTP requests
 */
void bootstrap();

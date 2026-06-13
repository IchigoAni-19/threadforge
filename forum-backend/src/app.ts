/**
 * FILE: src/app.ts
 *
 * PURPOSE:
 * Creates and configures the Express application.
 * Sets up middleware and routes.
 *
 * THIS FILE EXPLAINS:
 * 1. How Express is initialized
 * 2. Middleware order and why it matters
 * 3. How routes are registered
 * 4. How error handling works
 *
 * MIDDLEWARE EXECUTION ORDER:
 * Express processes requests in order:
 * 1. app.use(express.json()) - parse JSON bodies
 * 2. Health check route
 * 3. All API routes (auth, posts, comments, users)
 * 4. 404 handler - if no route matched
 * 5. Error handler - if any error thrown
 *
 * WHY ORDER MATTERS:
 * - JSON parser MUST come first (so routes can access req.body)
 * - Routes come before error handlers
 * - Error handler MUST be last (catches everything above)
 */

import express from 'express';

import authRoutes from './routes/auth.routes';
import commentRoutes from './routes/comment.routes';
import postRoutes from './routes/post.routes';
import userRoutes from './routes/user.routes';
import { errorHandler, notFound } from './middleware/error';

/**
 * EXPRESS APP FACTORY
 * 
 * Pattern: This function creates and configures Express app.
 * Why factory? So server.ts can call this to create the app.
 * Used by server.ts: const app = createApp()
 * 
 * RETURNS: Configured Express app ready for listening
 */
export const createApp = () => {
  // Create Express application instance
  // app is an object with methods like: app.use(), app.get(), app.listen()
  const app = express();

  // MIDDLEWARE 1: Parse JSON
  // This middleware processes incoming request bodies
  // If client sends JSON, converts req.body to JavaScript object
  // Example: { "name": "John" } → req.body = { name: "John" }
  // Without this, req.body would be undefined
  app.use(express.json());

  // HEALTH CHECK ENDPOINT
  // Used by load balancers and monitoring to check if server is alive
  // GET /health → returns { success: true, message: "OK" }
  // No database required, just tests that Express is running
  app.get('/health', (_req, res) => {
    res.status(200).json({ success: true, message: 'OK' });
  });

  // REGISTER ROUTES
  // These app.use() lines connect route files to URL paths
  // app.use(path, routes) means: "requests to this path use these routes"
  
  // Auth routes: signup, login
  // Full path: POST /api/auth/signup, POST /api/auth/login
  app.use('/api/auth', authRoutes);
  
  // Post routes: create, list, get one
  // Full paths: POST /api/posts, GET /api/posts, GET /api/posts/:id
  app.use('/api/posts', postRoutes);
  
  // Comment routes: create, list, delete
  // Full paths: POST /api/comments, GET /api/comments/post/:postId, etc.
  app.use('/api/comments', commentRoutes);
  
  // User routes: get profile
  // Full path: GET /api/users/me
  app.use('/api/users', userRoutes);

  // ERROR HANDLING MIDDLEWARE
  // These MUST come after all routes
  // Express processes requests from top to bottom
  // If a route isn't found above, notFound catches it
  
  // notFound: Catches requests that didn't match any route
  // Example: GET /api/invalid → 404 error
  app.use(notFound);
  
  // errorHandler: Catches all errors
  // - Errors thrown by routes
  // - Errors from middleware
  // - Errors from database operations
  // Formats them as JSON and sends to client
  app.use(errorHandler);

  // Return configured app
  // server.ts will call app.listen(port) to start listening
  return app;
};

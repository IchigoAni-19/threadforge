/**
 * FILE: src/routes/auth.routes.ts
 * 
 * PURPOSE:
 * Defines authentication endpoints.
 * Routes are like "URL → Controller" mappings.
 *
 * EXPRESS ROUTER CONCEPT:
 * - Router() creates a mini app for grouping related routes
 * - router.post(path, handler) defines POST endpoint
 * - router.get(path, handler) defines GET endpoint
 * - path: "/signup" becomes "/api/auth/signup" (full path set in app.ts)
 * - handler: the controller function to call
 *
 * AUTHENTICATION:
 * - These routes DON'T use protect middleware
 * - Signup/login don't require authentication
 * - (You can't log in if you're already logged in)
 */

import { Router } from 'express';

import { login, signup } from '../controllers/auth.controller';

const router = Router();

/**
 * POST /api/auth/signup
 * Create a new user account
 * No authentication required (don't have account yet)
 */
router.post('/signup', signup);

/**
 * POST /api/auth/login
 * Authenticate with email and password
 * No authentication required (don't have token yet)
 */
router.post('/login', login);

export default router;

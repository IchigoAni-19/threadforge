/**
 * FILE: src/routes/post.routes.ts
 * 
 * PURPOSE:
 * Defines post (forum topic) endpoints.
 * Routes are "URL + HTTP method → middleware → controller" chains.
 *
 * ROUTE PATTERN:
 * router.METHOD(path, ...middleware, handler)
 * - METHOD: post, get, put, delete, etc.
 * - path: relative path (becomes /api/posts/...)
 * - middleware: functions that run BEFORE handler (e.g., protect for auth)
 * - handler: controller function to call
 *
 * MIDDLEWARE ORDER:
 * If multiple middleware: router.post(path, middleware1, middleware2, handler)
 * They run left-to-right: middleware1 → middleware2 → handler
 *
 * PROTECT MIDDLEWARE:
 * - protect verifies JWT token
 * - Attaches user to req.user
 * - If token invalid, sends 401 error (error middleware handles it)
 * - Routes without protect are public (no auth needed)
 */

import { Router } from 'express';

import { create, index, show } from '../controllers/post.controller';
import { protect } from '../middleware/auth';

const router = Router();

/**
 * POST /api/posts
 * Create a new post
 * PROTECTED: Requires valid JWT token (protect middleware)
 * - Client sends: Authorization: Bearer <token>
 * - protect extracts token, verifies it, attaches user to req
 * - create() controller runs with req.user populated
 * - Response: 201 Created with post data
 */
router.post('/', protect, create);

/**
 * GET /api/posts
 * List all posts (forum feed)
 * PUBLIC: No authentication required
 * - Anyone can view posts
 * - Response: 200 OK with posts array
 */
router.get('/', index);

/**
 * GET /api/posts/:id
 * Get a specific post by ID
 * PUBLIC: No authentication required
 * - :id is a URL parameter (e.g., /api/posts/507f1f77bcf86cd799439011)
 * - show() gets req.params.id and validates it
 * - Response: 200 OK with single post, or 404 if not found
 */
router.get('/:id', show);

export default router;

/**
 * FILE: src/controllers/post.controller.ts
 *
 * PURPOSE:
 * Handles HTTP requests for post operations.
 * POST, GET posts and individual post details.
 *
 * HOW IT FITS IN:
 * - Express routes call these when clients hit /api/posts endpoints
 * - Controllers validate input and call services
 * - Services do the database work
 * - Controllers format responses
 */

import { Request, Response } from 'express';

import { asyncHandler } from '../utils/asyncHandler';
import { validateRequiredString } from '../utils/validators';
import { createPost, getPostById, listPosts } from '../services/post.service';

/**
 * POST /api/posts - Create a new post
 *
 * REQUEST BODY:
 * {
 *   "title": "How to learn Node.js",
 *   "body": "I want to become a backend developer..."
 * }
 *
 * RESPONSE (201 Created):
 * {
 *   "success": true,
 *   "data": {
 *     "_id": "...",
 *     "title": "...",
 *     "body": "...",
 *     "author": "...",
 *     "createdAt": "2024-01-15T..."
 *   }
 * }
 *
 * AUTHENTICATION: Required (post creator is logged-in user)
 *
 * FLOW:
 * 1. Validate title and body
 * 2. Get author ID from req.user (set by auth middleware)
 * 3. Call createPost service
 * 4. Return created post
 */
export const create = asyncHandler(async (req: Request, res: Response) => {
  // Validate post content
  const title = validateRequiredString(req.body.title, 'title');
  const body = validateRequiredString(req.body.body, 'body');

  // Create post with current user as author
  // req.user! means "I'm sure req.user exists" (it does because route is protected)
  const post = await createPost({ title, body, author: req.user!.id });

  // Send 201 Created response
  res.status(201).json({ success: true, data: post });
});

/**
 * GET /api/posts - List all posts (feed)
 *
 * RESPONSE (200 OK):
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "_id": "...",
 *       "title": "...",
 *       "body": "...",
 *       "author": { "_id": "...", "name": "...", "email": "...", "credits": 50 },
 *       "createdAt": "2024-01-15T..."
 *     },
 *     ...
 *   ]
 * }
 *
 * AUTHENTICATION: Not required (public endpoint)
 *
 * FLOW:
 * 1. Call listPosts service (no input needed)
 * 2. Service returns all posts sorted by newest first
 * 3. Each post includes author details
 * 4. Return list to client
 */
export const index = asyncHandler(async (_req: Request, res: Response) => {
  // _req prefix means we accept but don't use the request
  // Fetch all posts
  const posts = await listPosts();

  // Send 200 OK with posts array
  res.status(200).json({ success: true, data: posts });
});

/**
 * GET /api/posts/:id - Get a specific post
 *
 * RESPONSE (200 OK):
 * {
 *   "success": true,
 *   "data": {
 *     "_id": "...",
 *     "title": "...",
 *     "body": "...",
 *     "author": { ... },
 *     "createdAt": "..."
 *   }
 * }
 *
 * RESPONSE (404 Not Found):
 * {
 *   "success": false,
 *   "message": "Post not found"
 * }
 *
 * AUTHENTICATION: Not required
 *
 * FLOW:
 * 1. Extract post ID from URL parameter
 * 2. Validate it's a valid string (not empty)
 * 3. Call getPostById service
 * 4. Service throws 404 if post doesn't exist
 * 5. Return the post
 */
export const show = asyncHandler(async (req: Request, res: Response) => {
  // Get post ID from URL: /api/posts/:id
  // req.params.id is a string, need to validate it
  const postId = validateRequiredString(req.params.id, 'id');
  
  // Fetch the post (throws 404 if not found)
  const post = await getPostById(postId);

  // Send 200 OK with post data
  res.status(200).json({ success: true, data: post });
});

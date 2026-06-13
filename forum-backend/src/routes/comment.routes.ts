/**
 * FILE: src/routes/comment.routes.ts
 * 
 * PURPOSE:
 * Defines comment endpoints.
 * Supports both root comments (on posts) and threaded replies.
 *
 * COMMENT STRUCTURE:
 * - Root comment: postId, no parentCommentId
 * - Reply comment: postId + parentCommentId
 * - Depth: calculated automatically (1 for root, parent+1 for replies)
 * - Reward: calculated from depth (first comment gives X, reply gives X+Y, etc.)
 */

import { Router } from 'express';

import {
  destroy,
  listForPost,
  reply,
  store
} from '../controllers/comment.controller';

import { protect } from '../middleware/auth';

const router = Router();

/**
 * GET /api/comments/post/:postId
 * List all comments for a post
 * PUBLIC: No authentication required
 * - :postId is the post ID (e.g., 507f1f77bcf86cd799439011)
 * - Returns all comments (both root and replies)
 * - UI will organize into threads based on depth/parentCommentId
 * - Response: 200 OK with comments array
 */
router.get('/post/:postId', listForPost);

/**
 * POST /api/comments
 * Create a root comment on a post
 * PROTECTED: Requires JWT token
 * - Request body: { content, postId }
 * - No parentCommentId means it's a root comment
 * - Response: 201 Created with comment (depth=1)
 */
router.post('/', protect, store);

/**
 * POST /api/comments/reply
 * Create a reply to a comment
 * PROTECTED: Requires JWT token
 * - Request body: { content, postId, parentCommentId }
 * - parentCommentId required (distinguishes from root comment)
 * - Service calculates depth = parent.depth + 1
 * - Response: 201 Created with reply comment
 */
router.post('/reply', protect, reply);

/**
 * DELETE /api/comments/:id
 * Delete a comment (soft delete)
 * PROTECTED: Requires JWT token, must be comment author
 * - :id is the comment ID
 * - protect middleware checks authentication
 * - destroy() checks authorization (must be comment author)
 * - Service rolls back credits to post author
 * - Response: 200 OK with deleted comment (isDeleted=true)
 * - Error 403: Not comment author
 * - Error 404: Comment not found
 */
router.delete('/:id', protect, destroy);

export default router;
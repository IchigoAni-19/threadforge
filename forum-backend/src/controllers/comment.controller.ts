/**
 * FILE: src/controllers/comment.controller.ts
 * 
 * PURPOSE:
 * Handles HTTP requests for comment operations.
 * Creates comments, lists comments, deletes comments.
 * This is where the credit reward system is exposed to the API.
 * 
 * HOW IT FITS IN:
 * - Express routes call these when clients hit /api/comments endpoints
 * - Controllers validate input
 * - Calls comment service which implements credit system
 * - Returns comment data and updated credits
 * 
 * CREDIT FLOW IN CONTROLLERS:
 * When a comment is created:
 * - Service calculates depth (1 if reply to post, parent+1 if reply to comment)
 * - Service calculates reward using arithmetic progression
 * - Service awards reward to post author
 * - Client gets comment with depth and reward fields
 */

import { Request, Response } from 'express';

import { asyncHandler } from '../utils/asyncHandler';
import { validateObjectId, validateRequiredString } from '../utils/validators';
import {
  createComment,
  deleteComment,
  listCommentsForPost
} from '../services/comment.service';

/**
 * POST /api/comments - Create a root comment on a post
 * 
 * REQUEST BODY:
 * {
 *   "content": "This is great advice!",
 *   "postId": "507f1f77bcf86cd799439011"
 * }
 * 
 * RESPONSE (201 Created):
 * Returns the created comment with depth=1 and calculated reward
 * 
 * AUTHENTICATION: Required
 * 
 * DEPTH CALCULATION:
 * - parentCommentId is null or not provided → direct reply to post
 * - Service sets depth = 1
 * - Reward = firstTerm (e.g., 10 if firstTerm=10)
 */
export const store = asyncHandler(async (req: Request, res: Response) => {
  const content = validateRequiredString(req.body.content, 'content');
  const postId = validateObjectId(req.body.postId, 'postId');
  const parentCommentId = req.body.parentCommentId
    ? validateObjectId(req.body.parentCommentId, 'parentCommentId')
    : null;

  const comment = await createComment({
    content,
    authorId: req.user!.id,
    postId,
    parentCommentId
  });

  res.status(201).json({
    success: true,
    data: comment
  });
});

/**
 * POST /api/comments/reply - Create a reply to a comment
 * 
 * REQUEST BODY:
 * {
 *   "content": "Great point!",
 *   "postId": "507f1f77bcf86cd799439011",
 *   "parentCommentId": "507f1f77bcf86cd799439012"
 * }
 * 
 * RESPONSE (201 Created):
 * Returns the created reply with depth = parent.depth + 1
 * 
 * AUTHENTICATION: Required
 * 
 * DEPTH CALCULATION:
 * - parentCommentId is provided and required
 * - Service finds parent comment, gets its depth
 * - Sets this comment's depth = parent.depth + 1
 * - Reward = firstTerm + (depth-1)*commonDifference (higher than parent)
 * 
 * EXAMPLE:
 * Parent depth=1, reward=10
 * This reply depth=2, reward=15 (assuming firstTerm=10, diff=5)
 */
export const reply = asyncHandler(async (req: Request, res: Response) => {
  const content = validateRequiredString(req.body.content, 'content');
  const postId = validateObjectId(req.body.postId, 'postId');
  const parentCommentId = validateObjectId(
    req.body.parentCommentId,
    'parentCommentId'
  );

  const comment = await createComment({
    content,
    authorId: req.user!.id,
    postId,
    parentCommentId
  });

  res.status(201).json({
    success: true,
    data: comment
  });
});

/**
 * GET /api/comments/:postId - List all comments for a post
 * 
 * RESPONSE (200 OK):
 * Returns array of all comments for this post
 * 
 * AUTHENTICATION: Not required
 */
export const listForPost = asyncHandler(
  async (req: Request, res: Response) => {
    const postId = validateObjectId(req.params.postId, 'postId');

    const comments = await listCommentsForPost(postId);

    res.status(200).json({
      success: true,
      data: comments
    });
  }
);

/**
 * DELETE /api/comments/:id - Delete a comment (soft delete)
 * 
 * RESPONSE (200 OK): Returns deleted comment with isDeleted=true
 * 
 * RESPONSE (403 Forbidden): If not comment author
 * 
 * RESPONSE (404 Not Found): If comment doesn't exist
 * 
 * AUTHENTICATION: Required (must be comment author)
 * 
 * SOFT DELETE:
 * - Comment marked as deleted (isDeleted = true)
 * - Comment stays in database
 * - UI filters out deleted comments
 * 
 * CREDIT ROLLBACK:
 * - Service subtracts stored reward from post author's credits
 * - Exactly reverses the credit award from creation
 * - Example: reward was 15, author had 70 → now has 55
 */
export const destroy = asyncHandler(async (req: Request, res: Response) => {
  const commentId = validateObjectId(req.params.id, 'id');

  const comment = await deleteComment(
    commentId,
    req.user!.id
  );

  res.status(200).json({
    success: true,
    data: comment
  });
});

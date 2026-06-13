/**
 * FILE: src/services/comment.service.ts
 * 
 * PURPOSE:
 * Handles all comment operations and the credit reward system.
 * This is the most complex service - it manages:
 * - Creating comments with depth calculation
 * - Computing rewards using arithmetic progression
 * - Crediting the post author
 * - Soft delete with credit rollback
 * 
 * HOW IT FITS IN:
 * - Used by: comment.controller.ts
 * - Interacts with: Comment, Post, User models
 * - Uses: Credit system (calculateReward, getCreditConfigOrCreateDefault)
 * 
 * CREDIT SYSTEM FLOW:
 * User creates comment on post
 *   ↓
 * Determine comment depth (1 if reply to post, parent.depth+1 if reply to comment)
 *   ↓
 * Get reward config from database
 *   ↓
 * Calculate reward using arithmetic progression
 *   ↓
 * Create comment with reward value
 *   ↓
 * Add reward amount to post author's credits
 */

import { Types } from 'mongoose';

import { Comment } from '../models/Comment';
import { Post } from '../models/Post';
import { User } from '../models/User';
import { AppError } from '../utils/AppError';
import { calculateReward, getCreditConfigOrCreateDefault } from './credit.service';

/**
 * Creates a new comment on a post
 * 
 * INPUTS:
 * - params object with:
 *   - content: The comment text
 *   - authorId: User ID of the commenter
 *   - postId: Which post this comment is on
 *   - parentCommentId (optional): If replying to another comment
 * 
 * OUTPUTS:
 * - The created comment document with depth and reward calculated
 * 
 * SIDE EFFECTS:
 * - Increases the post author's credits by the reward amount
 * 
 * DETAILED FLOW:
 * 1. Verify the post exists
 * 2. Determine comment depth (1 or parent.depth + 1)
 * 3. Validate parent comment (if replying to a comment)
 * 4. Get credit configuration from database
 * 5. Calculate reward using arithmetic progression
 * 6. Create comment with all data
 * 7. Increment post author's credits
 * 
 * DEPTH CALCULATION:
 * - Direct reply to post: depth = 1
 * - Reply to depth 1 comment: depth = 2
 * - Reply to depth 2 comment: depth = 3
 * - And so on...
 * 
 * Each reply adds 1 to the parent's depth.
 * 
 * EXAMPLE:
 * Post: \"How to learn Node.js\"
 *   ├─ Comment 1 (depth 1): \"I recommend reading...\"
 *   │   └─ Comment 2 (depth 2): \"I agree, also try...\"
 *   │       └─ Comment 3 (depth 3): \"Great suggestion!\"
 *   └─ Comment 4 (depth 1): \"I prefer TypeScript...\"
 * 
 * REWARD EXAMPLE (firstTerm=10, commonDifference=5):
 * - Comment 1: 10 + (1-1)*5 = 10 credits to post author
 * - Comment 2: 10 + (2-1)*5 = 15 credits to post author
 * - Comment 3: 10 + (3-1)*5 = 20 credits to post author
 * - Comment 4: 10 + (1-1)*5 = 10 credits to post author
 * Post author total: 55 credits
 */
export const createComment = async (params: {
  content: string;
  authorId: string;
  postId: string;
  parentCommentId?: string | null;
}) => {
  // Step 1: Verify the post exists
  const post = await Post.findById(params.postId);
  if (!post) {
    throw new AppError(404, 'Post not found');
  }

  // Step 2: Determine depth based on whether this is a reply to a comment
  let depth = 1; // Default: direct reply to post

  if (params.parentCommentId) {
    // This is a reply to another comment
    // Step 3: Verify parent comment exists
    const parentComment = await Comment.findById(params.parentCommentId);
    if (!parentComment) {
      throw new AppError(404, 'Parent comment not found');
    }

    // Validate: parent comment must be on the same post
    // .toString() converts ObjectId to string for comparison
    if (parentComment.postId.toString() !== params.postId) {
      throw new AppError(400, 'Parent comment must belong to the same post');
    }

    // Calculate depth: parent's depth + 1
    // If replying to depth 1 comment, this is depth 2
    depth = parentComment.depth + 1;
  }

  // Step 4: Get credit configuration and calculate reward
  const config = await getCreditConfigOrCreateDefault();
  
  // Step 5: Apply arithmetic progression formula
  // reward = firstTerm + (depth - 1) * commonDifference
  const reward = calculateReward(depth, config.firstTerm, config.commonDifference);

  // Step 6: Create the comment document
  const comment = await Comment.create({
    content: params.content,
    // Convert string IDs to MongoDB ObjectIds
    author: new Types.ObjectId(params.authorId),
    postId: new Types.ObjectId(params.postId),
    // Only set parentCommentId if replying to a comment
    parentCommentId: params.parentCommentId ? new Types.ObjectId(params.parentCommentId) : null,
    depth,
    reward, // Store reward so we can subtract it on deletion
    isDeleted: false
  });

  // Step 7: Award credits to post author
  // $inc operator adds to the existing value
  // So if author had 50 credits and reward is 15, now they have 65
  await User.findByIdAndUpdate(post.author, { $inc: { credits: reward } });

  // Return the created comment
  return comment;
};

/**
 * Lists all comments for a post
 * 
 * INPUTS:
 * - postId: Which post to get comments for
 * 
 * OUTPUTS:
 * - Array of all non-deleted comments for this post
 * - Sorted by creation date (oldest first)
 * - Includes author information (name, email)
 * 
 * .find({ postId }): Get all comments with this postId
 * .populate('author', 'name email'): Replace author ID with user details
 * .sort({ createdAt: 1 }): Sort by creation date ascending (oldest first)
 * 
 * NOTE: This doesn't filter isDeleted comments yet
 * (you might want to add .find({ postId, isDeleted: false }) in UI)
 */
export const listCommentsForPost = async (postId: string) => {
  return Comment.find({ postId })
    .populate('author', 'name email')
    .sort({ createdAt: 1 });
};

/**
 * Deletes a comment (soft delete with credit rollback)
 * 
 * INPUTS:
 * - commentId: The comment to delete
 * - requesterId: The user requesting the deletion (must be the commenter)
 * 
 * OUTPUTS:
 * - The updated comment with isDeleted = true
 * 
 * SIDE EFFECTS:
 * - Subtracts the stored reward from post author's credits
 * - Marks comment as deleted (soft delete, not actually removed)
 * 
 * SOFT DELETE EXPLANATION:
 * We don't actually delete comments. Instead:
 * 1. Set isDeleted = true
 * 2. Keep the comment in database for record-keeping
 * 3. When displaying, filter out where isDeleted = true
 * 
 * REASONS FOR SOFT DELETE:\n * - Data integrity: We maintain accurate credit calculations
 * - Audit trail: Can see what comments were and when they were deleted
 * - Reversibility: Could un-delete if needed
 * - Accuracy: Post author's credit total stays accurate
 * 
 * AUTHORIZATION:
 * Only the comment author can delete their own comment.
 * Throw 403 Forbidden if not authorized.
 * 
 * CREDIT ROLLBACK:
 * When deleting, subtract the reward that was given.
 * This undoes the credit award from when comment was created.
 * 
 * EXAMPLE:
 * 1. Author created comment, post author got +15 credits (depth 2)
 * 2. Later, commenter deletes their comment
 * 3. Post author loses those 15 credits: $inc: { credits: -15 }
 * 4. Comment marked as deleted but still in database
 */
export const deleteComment = async (commentId: string, requesterId: string) => {
  // Find the comment
  const comment = await Comment.findById(commentId);

  // Check if comment exists
  if (!comment) {
    throw new AppError(404, 'Comment not found');
  }

  // If already deleted, just return it (idempotent - safe to call multiple times)
  if (comment.isDeleted) {
    return comment;
  }

  // Authorization check: only comment author can delete
  // .toString() converts ObjectId to string for comparison
  if (comment.author.toString() !== requesterId) {
    throw new AppError(403, 'You are not allowed to delete this comment');
  }

  // Find the post to update author's credits
  const post = await Post.findById(comment.postId);
  if (!post) {
    throw new AppError(404, 'Post not found');
  }

  // Subtract the reward from post author's credits
  // Negative value reduces the credit count
  // Example: if comment reward was 15, $inc: { credits: -15 }
  // Post author loses those credits
  await User.findByIdAndUpdate(post.author, { $inc: { credits: -comment.reward } });
  
  // Mark comment as deleted (soft delete)
  comment.isDeleted = true;
  // Save the updated comment document to database
  await comment.save();

  // Return the deleted comment
  return comment;
};

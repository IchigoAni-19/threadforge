/**
 * FILE: src/models/Comment.ts
 * 
 * PURPOSE:
 * Defines the structure of comments in the forum.
 * Comments are replies to posts or to other comments (nested discussions).
 * 
 * HOW IT FITS IN:
 * - Users comment on posts to participate in discussion
 * - Comments can reply to other comments (creating threads)
 * - Each comment earns rewards for the post author
 * - Soft delete: Comments marked as deleted instead of removed
 * - Related to: Post (postId), User (author)
 * 
 * CREDIT SYSTEM INTEGRATION:
 * When a comment is created:
 * - Calculate reward based on depth and credit config
 * - Add reward to post author's credits
 * When a comment is deleted:
 * - Subtract reward from post author's credits
 * - Mark isDeleted = true (soft delete, don't actually remove)
 */

import { Document, Model, Schema, Types, model } from 'mongoose';

/**
 * TypeScript Interface for Comment document
 * 
 * PROPERTIES:
 * - content: The text of the comment
 * - author: Reference to the User who wrote it
 * - postId: Which post this comment is under
 * - parentCommentId: If replying to a comment, points to the parent comment
 *   null if replying directly to the post
 * - depth: How nested the comment is (1 = reply to post, 2 = reply to reply, etc.)
 *   Used to calculate rewards with arithmetic progression
 * - reward: The number of credits the post author earns for this comment
 *   Stored in the comment so we know how much to subtract on deletion
 * - isDeleted: True if comment was deleted (soft delete)
 *   Comment stays in database but is hidden from users
 * - createdAt: When the comment was posted
 * - updatedAt: When the comment was last modified
 */
export interface IComment extends Document {
  content: string;
  author: Types.ObjectId;
  postId: Types.ObjectId;
  parentCommentId: Types.ObjectId | null;
  depth: number;
  reward: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    content: { type: String, required: true, trim: true },
    // User who wrote the comment
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    // Which post this comment belongs to
    postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    // If this is a reply to another comment, reference the parent
    // null if this is a direct reply to the post
    parentCommentId: { type: Schema.Types.ObjectId, ref: 'Comment', default: null },
    // How nested this comment is (1 = direct reply to post)
    // Used to calculate reward via: firstTerm + (depth - 1) * commonDifference
    depth: { type: Number, required: true, min: 1 },
    // Credits awarded to the post author for this comment
    // Stored here so we know how much to subtract if comment is deleted
    reward: { type: Number, required: true, min: 0 },
    // Soft delete flag: true means comment is hidden from users
    // Comment stays in database for record-keeping and credit calculations
    isDeleted: { type: Boolean, default: false }
  },
  // timestamps: true adds createdAt and updatedAt
  { timestamps: true }
);

/**
 * DEPTH & REWARD SYSTEM EXPLANATION
 * 
 * Forum uses arithmetic progression for rewards based on nesting depth.
 * This incentivizes longer, deeper discussion threads.
 * 
 * ARITHMETIC PROGRESSION FORMULA:
 * reward = firstTerm + (depth - 1) * commonDifference
 * 
 * EXAMPLE (firstTerm=10, commonDifference=5):
 * - Depth 1 (reply to post): 10 + (1-1)*5 = 10 credits
 * - Depth 2 (reply to depth 1): 10 + (2-1)*5 = 15 credits
 * - Depth 3 (reply to depth 2): 10 + (3-1)*5 = 20 credits
 * - Depth 4: 25 credits, etc.
 * 
 * DEPTH DEFINITION:
 * - depth = 1: Direct comment on a post
 *   postId = [post id], parentCommentId = null
 * 
 * - depth = 2: Reply to a depth 1 comment
 *   postId = [same post], parentCommentId = [depth 1 comment id]
 * 
 * - depth 3+: Reply to replies, following the same pattern
 *   Each child gets parent's depth + 1
 * 
 * SOFT DELETE EXPLANATION:
 * Instead of actually deleting comments, we mark them as deleted.
 * 
 * REASONS:
 * 1. Data integrity: We keep record of what rewards were given
 * 2. Consistency: Post's total credits remain accurate even if comments are removed
 * 3. Audit trail: Can see comment history
 * 4. Easy restore: Can un-delete comments if needed
 * 
 * When displaying comments, filter out where isDeleted = true
 */

export const Comment: Model<IComment> = model<IComment>('Comment', commentSchema);

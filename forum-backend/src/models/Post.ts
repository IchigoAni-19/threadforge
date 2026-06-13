/**
 * FILE: src/models/Post.ts\n *\n * PURPOSE:\n * Defines the structure of forum posts (discussion topics).\n * Posts are the main content created by users.\n *\n * HOW IT FITS IN:\n * - Users create posts to start discussions\n * - Other users comment on posts\n * - Post author earns credits when comments are added\n * - Referenced by: Comment model (comments belong to posts)
 */

import { Document, Model, Schema, Types, model } from 'mongoose';

/**
 * TypeScript Interface for Post document
n *\n * PROPERTIES:\n * - title: The topic/subject of the post\n * - body: The main content/description\n * - author: MongoDB ObjectId reference to the User who created it
 *   Types.ObjectId is a special MongoDB identifier type\n * - createdAt: Timestamp when post was created (automatic)\n * - updatedAt: Timestamp when post was last updated (automatic)
n */
export interface IPost extends Document {
  title: string;
  body: string;
  author: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Mongoose Schema for Post collection\n *\n * FIELD EXPLANATIONS:\n * - title: String that's required and trimmed\n * - body: String that's required and trimmed (the main post content)\n * - author: References the User who created this post
 *   Schema.Types.ObjectId: Special MongoDB id type\n *   ref: 'User' creates a relationship (can populate author details)
 *   required: true means every post must have an author
n */
const postSchema = new Schema<IPost>(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    // author: MongoDB reference to a User document
    // This creates a relationship so we can fetch user details with .populate()
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true }
  },
  // timestamps: true adds createdAt and updatedAt automatically
  // createdAt: Never changes after creation\n  // updatedAt: Changes if post is ever edited
  { timestamps: true }
);

/**
 * Export the Post model for querying the posts collection
n */
export const Post: Model<IPost> = model<IPost>('Post', postSchema);

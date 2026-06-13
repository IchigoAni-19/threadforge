/**
 * FILE: src/services/post.service.ts
 * 
 * PURPOSE:
 * Handles all post (forum topic) database operations.
 * - Creating new posts
 * - Listing all posts
 * - Fetching individual posts
 * 
 * HOW IT FITS IN:
 * - Used by: post.controller.ts
 * - Queries: Post collection in MongoDB
 * - Related to: User (author), Comment (comments on posts)
 */

import { Types } from 'mongoose';

import { Post } from '../models/Post';
import { AppError } from '../utils/AppError';

/**
 * Creates a new post
 * 
 * INPUTS:
 * - data object with:
 *   - title: The post's topic/subject
 *   - body: The main content
 *   - author: User ID (as string)
 * 
 * OUTPUTS:
 * - A new Post document in MongoDB
 * 
 * WHY new Types.ObjectId():
 * The database expects author to be a MongoDB ObjectId type.
 * User IDs come as strings from the request, so we convert them.
 * Types.ObjectId(string) converts string to ObjectId.
 * 
 * MONGODB OPERATION:
 * Post.create() inserts a new document and returns it.
 */
export const createPost = async (data: { title: string; body: string; author: string }) => {
  return Post.create({
    title: data.title,
    body: data.body,
    // Convert author string to MongoDB ObjectId
    author: new Types.ObjectId(data.author)
  });
};

/**
 * Lists all posts (for the feed)
 * 
 * OUTPUTS:
 * - Array of all posts, sorted by newest first
 * - Each post includes author's name, email, and credits
 * 
 * .populate('author', 'name email credits'):
 * The author field is a reference to a User document.
 * .populate() replaces the author ID with the actual user data.
 * 'name email credits' specifies which user fields to include.
 * 
 * .sort({ createdAt: -1 }):
 * Sort by creation date in descending order (-1).
 * So newest posts appear first.
 * 
 * EXAMPLE OUTPUT:
 * [
 *   {
 *     _id: '...',
 *     title: 'How to learn Node.js',
 *     body: 'I want to...',
 *     author: { _id: '...', name: 'John', email: 'john@...', credits: 50 },
 *     createdAt: '2024-01-15T...',
 *     ...
 *   },
 *   ...
 * ]
 */
export const listPosts = async () => {
  // Find all posts, populate author details, sort by newest first
  return Post.find()
    // Replace author ID with actual user data (name, email, credits only)
    .populate('author', 'name email credits')
    // Sort by createdAt in descending order (-1) = newest first
    .sort({ createdAt: -1 });
};

/**
 * Gets a single post by ID
 * 
 * INPUTS:
 * - postId: MongoDB ObjectId of the post (as string)
 * 
 * OUTPUTS:
 * - The post document with author details populated
 * - OR throws AppError(404, 'Post not found')
 * 
 * USAGE (in controller):
 * const post = await getPostById(req.params.id);
 * // Returns the full post with author info
 */
export const getPostById = async (postId: string) => {
  // Find post by ID and include author details
  const post = await Post.findById(postId).populate('author', 'name email credits');

  // If post doesn't exist, throw error
  if (!post) {
    throw new AppError(404, 'Post not found');
  }

  return post;
};

/**
 * FILE: src/services/user.service.ts
 * 
 * PURPOSE:
 * Handles user-related database operations.
 * - Finding users by email (for login)
 * - Fetching user profiles
 * 
 * HOW IT FITS IN:
 * - Used by: auth.service.ts, controllers
 * - Queries: User collection in MongoDB
 * - Returns: User data (sometimes including password for comparison)
 */

import { User } from '../models/User';
import { AppError } from '../utils/AppError';

/**
 * Finds a user by email address
 * 
 * WHY .select('+password'):
 * By default, passwords aren't loaded (we set select: false in the schema).
 * For login, we need the password to compare.
 * +password tells Mongoose to include it this time.
 * 
 * INPUTS:
 * - email: The user's email address (case-insensitive in schema)
 * 
 * OUTPUTS:
 * - User document with password field included
 * - OR null if user doesn't exist
 * 
 * EXAMPLE USAGE (in auth.service.ts):
 * const user = await findUserByEmail('john@example.com');
 * // Returns user with password so we can verify during login
 * 
 * MONGODB QUERY EXPLANATION:
 * User.findOne({ email }) finds the first user with matching email
 * .select('+password') includes the password field (normally hidden)
 */
export const findUserByEmail = async (email: string) => {
  return User.findOne({ email }).select('+password');
};

/**
 * Gets a user's profile information
 * 
 * WHY ONLY RETURN CERTAIN FIELDS:
 * .select('name email credits') tells MongoDB to only return these fields.
 * We don't return password or other sensitive data.
 * 
 * INPUTS:
 * - userId: MongoDB ObjectId of the user
 * 
 * OUTPUTS:
 * - User document with only name, email, and credits fields
 * - OR throws AppError(404, 'User not found')
 * 
 * EXAMPLE USAGE (in user.controller.ts):
 * const profile = await getUserProfile(req.user.id);
 * // Returns { name, email, credits } for the dashboard
 * 
 * WHY IT THROWS AN ERROR:
 * If a route tries to fetch a user that doesn't exist,
 * the error is caught by the error middleware and returns HTTP 404.
 */
export const getUserProfile = async (userId: string) => {
  // Query for user by ID and select only these fields
  // name: user's display name
  // email: user's email address
  // credits: total credits earned from comments on their posts
  const user = await User.findById(userId).select('name email credits');

  // If user not found, throw error (caught by error middleware)
  if (!user) {
    throw new AppError(404, 'User not found');
  }

  return user;
};

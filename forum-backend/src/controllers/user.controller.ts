/**
 * FILE: src/controllers/user.controller.ts
 *
 * PURPOSE:
 * Handles HTTP requests for user-specific operations.
 * Currently just the dashboard endpoint.
 *
 * HOW IT FITS IN:
 * - Called when authenticated users fetch their profile
 * - Returns user info and total credits earned
 */

import { Request, Response } from 'express';

import { asyncHandler } from '../utils/asyncHandler';
import { getUserProfile } from '../services/user.service';

/**
 * GET /api/users/me - Get current user's profile and credits
 *
 * RESPONSE (200 OK):
 * {
 *   "success": true,
 *   "data": {
 *     "profile": {
 *       "_id": "...",
 *       "name": "John Doe",
 *       "email": "john@example.com",
 *       "credits": 45
 *     },
 *     "credits": 45
 *   }
 * }
 *
 * AUTHENTICATION: Required (must be logged in)
 *
 * CREDITS EXPLAINED:
 * - Starts at 0 for new users
 * - Increases when someone comments on user's posts
 * - Increases by the reward amount (arithmetic progression based on depth)
 * - Example: User has 3 posts, got comments with rewards 10, 15, 20 = 45 credits
 *
 * FLOW:
 * 1. Get current user ID from req.user (set by auth middleware)
 * 2. Call getUserProfile service
 * 3. Service returns user with name, email, credits
 * 4. Return profile and credits to client
 */
export const me = asyncHandler(async (req: Request, res: Response) => {
  // Get profile for the currently authenticated user
  // req.user! means "I'm sure req.user exists" (it does - route is protected)
  const user = await getUserProfile(req.user!.id);

  // Send 200 OK with profile and credits
  res.status(200).json({
    success: true,
    data: {
      // Return full user profile
      profile: user,
      // Also return credits separately for easy access in frontend
      credits: user.credits
    }
  });
});

/**
 * FILE: src/routes/user.routes.ts
 * 
 * PURPOSE:
 * Defines user profile endpoints.
 * Currently just has one endpoint for getting current user info.
 */

import { Router } from 'express';

import { me } from '../controllers/user.controller';
import { protect } from '../middleware/auth';

const router = Router();

/**
 * GET /api/users/me
 * Get current user profile and credits
 * PROTECTED: Requires JWT token
 * - protect middleware verifies token and attaches user
 * - me() returns profile with name, email, credits
 * - Response: 200 OK with user profile
 */
router.get('/me', protect, me);

export default router;

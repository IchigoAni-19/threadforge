/**
 * FILE: src/middleware/auth.ts
 * 
 * PURPOSE:
 * Middleware to verify JWT tokens and attach user info to requests.
 * Applied to routes that require authentication (protected routes).
 * 
 * MIDDLEWARE CONCEPT:
 * Middleware functions run BEFORE the controller.
 * They process the request, do work, then call next() to continue.
 * If error happens, call next(error) to skip to error middleware.
 * 
 * HOW IT WORKS:
 * 1. Client sends request with Authorization: Bearer token
 * 2. protect() middleware checks for token
 * 3. Verifies token signature and expiry
 * 4. Fetches user from database
 * 5. Attaches user to req.user
 * 6. Calls next() to let controller run
 * 
 * If any step fails, next(error) sends error to error middleware.
 */

import { NextFunction, Request, Response } from 'express';

import { User } from '../models/User';
import { AppError } from '../utils/AppError';
import { verifyToken } from '../utils/jwt';

/**
 * MIDDLEWARE: protect
 * 
 * Verifies JWT token and attaches authenticated user to request.
 * Applied to protected routes like POST /api/posts, DELETE /api/comments/:id
 * 
 * FLOW:\n * 1. Check for Authorization header with Bearer token\n * 2. Extract token from "Bearer <token>"\n * 3. Verify token signature (throws if invalid or expired)\n * 4. Decode payload to get userId\n * 5. Query database for user\n * 6. Attach user data to req.user\n * 7. Call next() to continue to controller\n *\n * REQUEST HEADER:\n * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....\n *\n * ERROR CASES:\n * - No Authorization header → 401 \"Authentication required\"\n * - Invalid format (missing Bearer) → 401 \"Authentication required\"\n * - Invalid/expired token → 401 \"Invalid or expired token\"\n * - User deleted since token issued → 401 \"User no longer exists\"\n *\n * SUCCESS:\n * - Populates req.user with { id, name, email, credits }\n * - Calls next() to continue to controller\n */
export const protect = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  // Check for Authorization header
  const authHeader = req.headers.authorization;

  // Authorization header must exist and start with \"Bearer \"
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next(new AppError(401, 'Authentication required'));
    return;
  }

  try {
    // Extract token from \"Bearer token\" format
    // authHeader looks like \"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\"
    // Split by space: [\"Bearer\", \"token\"]
    // Take index [1] to get the token
    const token = authHeader.split(' ')[1];
    
    // Verify token signature and expiry
    // Returns { userId } if valid
    // Throws error if invalid or expired
    const payload = verifyToken(token);
    
    // Query database for user
    // .select('name email credits') means: only get these fields (not password)
    const user = await User.findById(payload.userId).select('name email credits');

    // If user was deleted after token was issued, reject request
    if (!user) {
      next(new AppError(401, 'User no longer exists'));
      return;
    }

    // Attach user data to request object
    // Controllers can now access req.user
    // req.user! means \"I'm sure it exists\" (TypeScript syntax)
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      credits: user.credits
    };

    // Call next() to proceed to the route controller
    next();
  } catch {
    // Token verification failed (invalid signature, expired, etc.)
    next(new AppError(401, 'Invalid or expired token'));
  }
};

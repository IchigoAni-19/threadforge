/**
 * FILE: src/types/express/index.d.ts\n *\n * PURPOSE:\n * This file extends Express's Request type to add our custom properties.
 * It tells TypeScript \"when you see req.user, it will have these properties\".\n *\n * WHAT IS A .d.ts FILE:\n * .d.ts = TypeScript definition file\n * Instead of JavaScript code, it contains only type definitions.
 * These files help TypeScript understand the structure of data without running code.n *\n * HOW IT FITS IN:\n * - Every controller receives 'req' with user information attached\n * - TypeScript needs to know what properties req.user has
 * - This file tells TypeScript about our custom req.user property
 *\n * INTERACTIONS:\n * - Used by: All controllers that access req.user
 * - Modified by: src/middleware/auth.ts (sets req.user)
 */

/**
 * TypeScript global declare to extend Express types
n *\n * WHY WE NEED THIS:\n * Express's built-in Request type doesn't have a 'user' property.
 * We add it in the auth middleware, so TypeScript needs to know about it.
 * This prevents TypeScript errors when accessing req.user in controllers.
 */
declare global {
  namespace Express {
    /**
     * Custom interface for authenticated users
n     *
     * PROPERTIES:\n     * - id: The MongoDB ObjectId of the user (as string)\n     * - name: User's display name\n     * - email: User's email address\n     * - credits: Total credits accumulated from comments under user's posts
n     *
n     * WHY THESE PROPERTIES:\n     * These are the fields we need most often in routes.
     * We fetch them once in auth middleware, then attach to req.user
     * so we don't need to fetch again in every controller.
     */
    interface AuthenticatedUser {
      id: string;
      name: string;
      email: string;
      credits: number;
    }

    /**
     * Extend the Express Request object with optional user property
     * 
     * WHY?\n     * By default, Express Request doesn't have a user property.
     * After our auth middleware runs, req.user will contain AuthenticatedUser data.
     * 
     * ? means optional - some routes don't have req.user (not protected)
     * Protected routes always have req.user set.
     */
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

// This export is required for TypeScript to recognize this as a module
export {};

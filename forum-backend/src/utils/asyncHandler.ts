/**
 * FILE: src/utils/asyncHandler.ts
 * 
 * PURPOSE:
 * Wraps async route handlers to catch errors automatically.
 * Without this wrapper, thrown errors in async functions would be unhandled.
 * 
 * HOW IT FITS IN:
 * - Every route handler is wrapped with asyncHandler
 * - Catches errors and passes them to the error middleware
 * - Prevents the "unhandled promise rejection" crash
 * 
 * INTERACTIONS:
 * - Used by: all controllers
 * - Passes errors to: src/middleware/error.ts
 */

import { NextFunction, Request, RequestHandler, Response } from 'express';

/**
 * Higher-order function that wraps async route handlers
 * 
 * WHAT IS A HIGHER-ORDER FUNCTION:
 * A function that takes a function as input and returns a modified function.
 * Like a wrapper or decorator that adds error handling.
 * 
 * INPUTS:
 * - handler: An async route handler function
 * 
 * OUTPUTS:
 * - A RequestHandler (Express middleware) that catches errors
 */
export const asyncHandler = (
  handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler => {
  return (req, res, next) => {
    // Call the async handler and catch any errors
    // void tells TypeScript we're ignoring the returned promise
    // .catch(next) passes errors to Express error middleware
    void handler(req, res, next).catch(next);
  };
};

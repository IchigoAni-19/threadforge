/**
 * FILE: src/middleware/error.ts
 * 
 * PURPOSE:
 * Handles errors and 404 responses.
 * These are special middleware functions that catch errors thrown by other middleware/controllers.
 * 
 * EXPRESS ERROR MIDDLEWARE CONCEPT:\n * - 4 parameters = error handler (not 3)\n * - Signature: (err, req, res, next) => {}\n * - Express automatically routes thrown errors here\n * - Catches errors from all previous middleware\n *\n * MIDDLEWARE ORDER:\n * 1. Normal middleware runs\n * 2. Controllers run\n * 3. If error thrown, skip all remaining middleware\n * 4. Jump to error middleware\n * 5. Error middleware formats response\n */

import { NextFunction, Request, Response } from 'express';

import { AppError } from '../utils/AppError';

/**
 * MIDDLEWARE: notFound\n *\n * Catches requests to routes that don't exist.\n * Converts 404 to AppError and passes to error middleware.\n *\n * EXAMPLE:\n * GET /api/invalid-route\n * → No route matches\n * → notFound() called\n * → Creates AppError(404, \"Route not found\")\n * → next() passes it to error middleware\n * → Error middleware sends 404 response\n */
export const notFound = (_req: Request, _res: Response, next: NextFunction): void => {
  // _req, _res prefixes mean \"parameter exists but not used\"\n  // Underscore avoids \"unused variable\" warnings
  
  // Create 404 error and pass to error middleware
  next(new AppError(404, 'Route not found'));
};

/**
 * MIDDLEWARE: errorHandler\n *\n * Catches all errors and formats responses.\n * This is registered LAST in app.ts so it catches everything.\n *\n * INPUT (err parameter):\n * - AppError with statusCode and message (from services/middleware)\n * - Generic Error from unexpected crashes\n * - Unknown error type\n *\n * OUTPUT:\n * - HTTP response with status code and JSON message\n * - Never throws (always sends response)\n *\n * EXAMPLES:\n *\n * Example 1: AppError from service\n * Input: AppError(404, \"Post not found\")\n * Response: { \"status\": 404, \"success\": false, \"message\": \"Post not found\" }\n *\n * Example 2: Generic Error from crash\n * Input: Error(\"Something broke\")\n * Response: { \"status\": 500, \"success\": false, \"message\": \"Something broke\" }\n *\n * Example 3: Unknown error\n * Input: null or undefined\n * Response: { \"status\": 500, \"success\": false, \"message\": \"Internal server error\" }\n */
export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction): void => {
  // Check if error is an AppError (our custom error class)
  if (err instanceof AppError) {
    // Send the exact statusCode and message we set
    res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
    return;
  }

  // Handle generic JavaScript Error
  // Extract message if available, otherwise default
  const message = err instanceof Error ? err.message : 'Internal server error';
  
  // Send 500 Internal Server Error
  // We use 500 because we don't know the correct status code
  res.status(500).json({
    success: false,
    message
  });
};

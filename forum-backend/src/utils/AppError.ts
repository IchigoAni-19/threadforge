/**
 * FILE: src/utils/AppError.ts
 * 
 * PURPOSE:
 * Defines a custom error class for handling application-specific errors.
 * Instead of using generic JavaScript errors, we have an AppError that
 * includes HTTP status codes so the error handler knows which HTTP response to send.
 * 
 * HOW IT FITS IN:
 * - Used throughout the app to throw standardized errors
 * - Caught by the error middleware in src/middleware/error.ts
 * - Helps distinguish app errors from unexpected crashes
 * 
 * INTERACTIONS:
 * - Thrown by: services, controllers, middleware
 * - Caught by: src/middleware/error.ts
 * - Converted to: HTTP responses with status codes
 */

/**
 * Custom Error class for application errors with HTTP status codes
 * 
 * EXTENDS: Error (JavaScript's built-in error class)
 * 
 * PROPERTIES:
 * - statusCode: The HTTP status code to return (404, 401, 400, etc.)
 * - isOperational: Flag to identify this as a known error (not a crash)
 * - message: Human-readable error description
 * 
 * EXAMPLE:
 * throw new AppError(404, 'User not found');
 * // Status 404 tells HTTP client the resource doesn't exist
 * // Message explains why
 */
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  /**
   * Constructor for creating a new AppError
   * 
   * INPUTS:
   * - statusCode: HTTP status code (404, 401, 400, 500, etc.)
   * - message: Human-readable description of the error
   * 
   * WHY THIS DESIGN:
   * Combining status code and message makes it easy for the error middleware
   * to send the correct HTTP response.
   */
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    // isOperational = true means this is an expected error, not a crash
    this.isOperational = true;
    // Capture stack trace so we know where the error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

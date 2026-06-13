/**
 * FILE: src/controllers/auth.controller.ts
 * 
 * PURPOSE:
 * Handles HTTP requests for user authentication.
 * Controllers receive HTTP requests and send HTTP responses.
 * 
 * HOW IT FITS IN:
 * - Express calls these functions when clients hit auth routes
 * - Validates request data
 * - Calls auth service for business logic
 * - Returns JSON response with token
 *
 * CONTROLLER PATTERN:
 * 1. Extract and validate request data
 * 2. Call service function to do work
 * 3. Return response to client
 */

import { Request, Response } from 'express';

import { signupUser, loginUser } from '../services/auth.service';
import { asyncHandler } from '../utils/asyncHandler';
import { validateEmail, validateRequiredString } from '../utils/validators';

/**
 * POST /api/auth/signup
 *
 * Handles user signup (registration)
 *
 * REQUEST BODY:
 * {
 *   "name": "John Doe",
 *   "email": "john@example.com",
 *   "password": "password123"
 * }
 *
 * RESPONSE (201 Created):
 * {
 *   "success": true,
 *   "message": "User registered successfully",
 *   "data": {
 *     "user": { "id": "...", "name": "...", "email": "...", "credits": 0 },
 *     "token": "eyJhbGciOiJIUzI1NiIs...."
 *   }
 * }
 *
 * FLOW:
 * 1. Extract name, email, password from request body
 * 2. Validate each field (throws AppError if invalid)
 * 3. Call signupUser service to create account and generate token
 * 4. Send 201 Created with user and token
 *
 * WHY asyncHandler:
 * Wraps async function so errors are caught and sent to error middleware
 */
export const signup = asyncHandler(async (req: Request, res: Response) => {
  // Validate input data (throws AppError if invalid)
  const name = validateRequiredString(req.body.name, 'name');
  const email = validateEmail(req.body.email);
  const password = validateRequiredString(req.body.password, 'password');

  // Call auth service to create user and generate token
  const result = await signupUser({ name, email, password });

  // Send 201 Created response with user and token
  // Client receives token and stores it for future requests
  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      // Only send safe fields (not password hash)
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        credits: result.user.credits
      },
      // Client receives this token and stores it
      token: result.token
    }
  });
});

/**
 * POST /api/auth/login
 *
 * Handles user login (authentication)
 *
 * REQUEST BODY:
 * {
 *   "email": "john@example.com",
 *   "password": "password123"
 * }
 *
 * RESPONSE (200 OK):
 * {
 *   "success": true,
 *   "message": "Login successful",
 *   "data": {
 *     "user": { ... },
 *     "token": "eyJhbGciOiJIUzI1NiIs...."
 *   }
 * }
 *
 * RESPONSE (401 Unauthorized) if password wrong:
 * {
 *   "success": false,
 *   "message": "Invalid credentials"
 * }
 *
 * FLOW:
 * 1. Extract email and password
 * 2. Validate both fields
 * 3. Call loginUser service (checks password, returns token)
 * 4. Send 200 OK with user and token
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  // Validate login input
  const email = validateEmail(req.body.email);
  const password = validateRequiredString(req.body.password, 'password');

  // Call auth service to verify credentials and generate token
  // If password wrong, loginUser throws AppError(401)
  const result = await loginUser({ email, password });

  // Send 200 OK response
  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        credits: result.user.credits
      },
      // Client stores this token for authenticated requests
      token: result.token
    }
  });
});

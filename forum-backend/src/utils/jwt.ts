/**
 * FILE: src/utils/jwt.ts
 * 
 * PURPOSE:
 * Handles JWT (JSON Web Token) creation and verification for authentication.
 * JWTs are secure tokens that prove a user is logged in.
 * 
 * HOW IT FITS IN:
 * - signToken: Called when user logs in or signs up
 * - verifyToken: Called by auth middleware to verify requests
 * - Used by: src/services/auth.service.ts, src/middleware/auth.ts
 * 
 * WHAT IS JWT:
 * A JWT is a token with 3 parts separated by dots: header.payload.signature\n * - header: describes the token type
 * - payload: contains user data (like userId) that you specified
 * - signature: proves the token wasn't tampered with (created using the secret key)
 * 
 * WHY USE JWT:
 * - Stateless: The server doesn't need to store tokens in a database
 * - Secure: Tokens are cryptographically signed, can't be forged
 * - Portable: Can be passed in headers or cookies
 */

import jwt from 'jsonwebtoken';

import { env } from '../config/env';

/**
 * TypeScript Interface for JWT payload
 * 
 * WHAT IS AN INTERFACE:
 * An interface defines the shape/structure of data.
 * It's like a blueprint that says "objects of this type must have these properties"
 * 
 * PROPERTIES:
 * - userId: The ID of the logged-in user (stored in the token)
 */
export interface JwtPayload {
  userId: string;
}

/**
 * Creates a JWT token for a user
 * 
 * WHY THIS FUNCTION:
 * When a user logs in successfully, we create a token that proves they're logged in.
 * Send this token to the client, they send it back with each request.
 * 
 * INPUTS:
 * - payload: JwtPayload object containing userId
 *   Example: { userId: '507f1f77bcf86cd799439011' }
 * 
 * OUTPUTS:
 * - A JWT string that looks like: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQi...
 * 
 * HOW IT WORKS:
 * 1. Take the payload (user data)
 * 2. Sign it using jwt.sign() with the secret key
 * 3. The signature proves that only our server created this token
 * 4. Token expires after jwtExpiresIn time (default 7 days)
 * 
 * EXAMPLE:\n * const token = signToken({ userId: user.id });
 * // Client receives token and sends back in Authorization header
 */
export const signToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, env.jwtSecret, {
    // Token will be invalid after this time (default '7d' = 7 days)
    expiresIn: env.jwtExpiresIn
  });
};

/**
 * Verifies and decodes a JWT token
 * 
 * WHY THIS FUNCTION:
 * When a client sends a request with a token, we need to verify it's real
 * and extract the user ID from it.
 * 
 * INPUTS:
 * - token: A JWT string to verify
 *   Example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQi...
 * 
 * OUTPUTS:
 * - JwtPayload object with the user ID: { userId: '...' }
 * - OR throws an error if token is invalid/expired
 * 
 * HOW IT WORKS:
 * 1. Use jwt.verify() to check the token signature
 * 2. If the signature is valid, return the decoded payload
 * 3. If invalid or expired, throw an error (caught by error middleware)
 * 4. The 'as JwtPayload' tells TypeScript this will be a JwtPayload object
 * \n * EXAMPLE:\n * const payload = verifyToken(token); // { userId: '...' }\n * const userId = payload.userId; // Extract user ID from token
 */
export const verifyToken = (token: string): JwtPayload => {
  // Verify the token signature and return the decoded payload
  // If verification fails, this throws an error
  // 'as JwtPayload' is a type assertion - tells TypeScript the result is a JwtPayload
  return jwt.verify(token, env.jwtSecret) as JwtPayload;
};

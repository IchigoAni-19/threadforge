/**
 * FILE: src/services/auth.service.ts
 * 
 * PURPOSE:
 * Handles user authentication logic.
 * - User signup (create account)
 * - User login (verify credentials)
 * - JWT token generation
 * 
 * HOW IT FITS IN:
 * - Used by: auth.controller.ts
 * - Uses: User model, JWT utility, user service
 * - Returns: User data and authentication token
 * 
 * AUTHENTICATION FLOW:
 * 1. Sign up: Create new user, hash password, generate token
 * 2. Login: Find user, verify password, generate token
 * 3. Protected routes: Check token and extract user ID
 */

import { User } from '../models/User';
import { AppError } from '../utils/AppError';
import { signToken } from '../utils/jwt';
import { findUserByEmail } from './user.service';

/**
 * User signup: Create a new account
 * 
 * INPUTS:
 * - input object with:
 *   - name: User's display name
 *   - email: User's email (must be unique)
 *   - password: User's password (will be hashed by model)
 * 
 * OUTPUTS:
 * - Object with:
 *   - user: The newly created user
 *   - token: JWT token for immediate login
 * 
 * FLOW:
 * 1. Check if email already registered (prevent duplicates)
 * 2. Create new user (password auto-hashed by pre-save hook)
 * 3. Generate JWT token with user ID
 * 4. Return user and token to client
 * 
 * WHY THROW ERROR IF EMAIL EXISTS:
 * Email is unique in the schema, but we want a friendly message.
 * Status 409 = "Conflict" (resource already exists)
 * 
 * EXAMPLE USAGE (from auth.controller.ts):
 * const { user, token } = await signupUser({
 *   name: 'John',
 *   email: 'john@example.com',
 *   password: 'password123'
 * });
 * // Returns new user and JWT token
 */
export const signupUser = async (input: { name: string; email: string; password: string }) => {
  // First, check if a user already exists with this email
  const existingUser = await User.findOne({ email: input.email });

  // If found, throw error (409 = Conflict, email already taken)
  if (existingUser) {
    throw new AppError(409, 'Email is already registered');
  }

  // Create new user document
  // Password is automatically hashed by the pre-save hook in User model
  const user = await User.create(input);
  
  // Generate JWT token with user's ID
  // Token allows client to make authenticated requests
  const token = signToken({ userId: user.id });

  // Return user and token
  return { user, token };
};

/**
 * User login: Verify credentials and generate token
 * 
 * INPUTS:
 * - input object with:
 *   - email: User's email
 *   - password: User's plain-text password
 * 
 * OUTPUTS:
 * - Object with:
 *   - user: The logged-in user
 *   - token: JWT token for authenticated requests
 * 
 * OR throws AppError if credentials invalid
 * 
 * LOGIN FLOW:
 * 1. Find user by email (include password field)
 * 2. Check if user exists
 * 3. Compare provided password with stored hash
 * 4. If valid, generate JWT token
 * 5. If invalid, throw error
 * 
 * PASSWORD COMPARISON:
 * We can't compare plain text to hash directly.
 * Use bcrypt.compare() which hashes the input and compares.
 * The User model has comparePassword() method that does this.
 * 
 * WHY GENERIC ERROR MESSAGE:
 * We say \"Invalid credentials\" for both user not found and wrong password.
 * This prevents attackers from guessing which emails are registered.
 * 
 * EXAMPLE USAGE (from auth.controller.ts):
 * const { user, token } = await loginUser({
 *   email: 'john@example.com',
 *   password: 'password123'
 * });
 * // Returns user and JWT token if valid, throws error if invalid
 */
export const loginUser = async (input: { email: string; password: string }) => {
  // Find user by email (must include password field for comparison)
  const user = await findUserByEmail(input.email);

  // If user not found, throw error (don't say \"user not found\" for security)
  if (!user) {
    throw new AppError(401, 'Invalid credentials');
  }

  // Compare provided password with stored hash
  // comparePassword is a method on the User model
  // Returns true if passwords match, false if not
  const isPasswordValid = await user.comparePassword(input.password);
  
  // If password doesn't match, throw error
  if (!isPasswordValid) {
    throw new AppError(401, 'Invalid credentials');
  }

  // Generate JWT token with user's ID
  // Client sends this token in Authorization header for protected routes
  const token = signToken({ userId: user.id });
  
  // Return user and token
  return { user, token };
};

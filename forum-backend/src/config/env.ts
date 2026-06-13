/**
 * FILE: src/config/env.ts
 * 
 * PURPOSE:
 * This file loads and validates all environment variables from the .env file.
 * Environment variables are secret settings (like database URL, JWT secret) that
 * change depending on whether the app runs locally, in testing, or in production.
 * 
 * HOW IT FITS IN:
 * - Other files import 'env' from here to access configuration
 * - Centralizes all configuration in one place
 * - Fails early if required settings are missing
 * 
 * INTERACTIONS:
 * - Used by: src/server.ts, src/config/db.ts, src/utils/jwt.ts, etc.
 * - Reads from: .env file
 */

import dotenv from 'dotenv';
import type { SignOptions } from 'jsonwebtoken';

// Load environment variables from .env file into process.env
// This makes vars like process.env.PORT available throughout the app
dotenv.config();

/**
 * Helper function to safely get required environment variables
 * 
 * WHY: Environment variables might be missing, which would crash the app.
 * This function checks before we try to use them.
 * 
 * INPUTS:
 * - name: the variable name to look for (e.g., 'MONGO_URI')
 * 
 * OUTPUTS:
 * - the value of the environment variable, or crashes with an error message
 * 
 * LOGIC:
 * 1. Check if process.env[name] exists
 * 2. If not, throw error with message saying which variable is missing
 * 3. If yes, return the value
 * 
 * EXAMPLE:
 * getRequiredEnv('MONGO_URI') → returns "mongodb://localhost:27017/mydb"
 * getRequiredEnv('MISSING_VAR') → throws error "MISSING_VAR is required"
 */
const getRequiredEnv = (name: string): string => {
  // Get value from process.env object
  // If not found, process.env[name] is undefined
  const value = process.env[name];

  // Check if the value exists
  if (!value) {
    // Crash the app and tell developer which variable is missing
    throw new Error(`${name} is required`);
  }

  // Return the value so other code can use it
  return value;
};

/**
 * Helper function to safely get a number from environment variables
 * 
 * WHY: Environment variables are always strings. Credit rewards are numbers,
 * so we need to convert and validate.
 * 
 * INPUTS:
 * - name: the variable name (e.g., 'CREDIT_FIRST_TERM')
 * 
 * OUTPUTS:
 * - the value converted to a number, or throws an error if invalid
 * 
 * LOGIC:
 * 1. Get the value as a string (crashes if missing)
 * 2. Convert the string to a number using Number()
 * 3. Check if it's actually a number (not NaN - "Not a Number")
 * 4. Return the number or crash with an error
 */
const getNumberEnv = (name: string): number => {
  // Get the string value first (crashes if missing via getRequiredEnv)
  const raw = getRequiredEnv(name);
  
  // Convert string to number (e.g., '10' becomes 10)
  const value = Number(raw);

  // Check if the conversion failed (Number('abc') returns NaN)
  if (Number.isNaN(value)) {
    throw new Error(`${name} must be a valid number`);
  }

  // Return the number so other code can use it
  return value;
};

/**
 * All environment configuration exported as a single object
 * 
 * This object contains all settings the app needs to run.
 * By exporting one object, we make it easy to see all config in one place.
 * 
 * PROPERTIES:
 * - port: The port number the server listens on (defaults to 5000 if not set)
 * - mongoUri: The MongoDB connection string (required)
 * - jwtSecret: The secret key for signing JWT tokens (required)
 * - jwtExpiresIn: How long a token stays valid (defaults to '7d' = 7 days)
 * - creditFirstTerm: First value in the reward progression (required)
 * - creditCommonDifference: The increment for each comment depth (required)
 * 
 * The '??' operator means "use the left value if it exists, otherwise use right"
 * So if PORT is not set, it defaults to 5000.
 * 
 * as SignOptions['expiresIn'] is a TypeScript type assertion that tells TypeScript
 * this string value is compatible with what jsonwebtoken expects.
 */
export const env = {
  // Server port: tries PORT from .env, falls back to 5000
  port: Number(process.env.PORT ?? 5000),
  
  // MongoDB database connection string (must exist or app crashes on startup)
  mongoUri: getRequiredEnv('MONGO_URI'),
  
  // Secret key for signing and verifying JWT tokens (must exist)
  jwtSecret: getRequiredEnv('JWT_SECRET'),
  
  // How long a JWT token is valid before it expires (defaults to 7 days)
  jwtExpiresIn: (process.env.JWT_EXPIRES_IN ?? '7d') as SignOptions['expiresIn'],
  
  // Credit system: first reward amount (e.g., 10 credits for first comment)
  creditFirstTerm: getNumberEnv('CREDIT_FIRST_TERM'),
  
  // Credit system: reward increase per depth level (e.g., add 5 more per level)
  creditCommonDifference: getNumberEnv('CREDIT_COMMON_DIFFERENCE')
};

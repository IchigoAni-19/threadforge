/**
 * FILE: src/utils/validators.ts
 * 
 * PURPOSE:
 * Contains functions to validate user input from requests.
 * Before using data from a client, we verify it's the right type and format.
 * Invalid data could crash the app or be a security issue.
 * 
 * HOW IT FITS IN:
 * - Called by every controller before processing request data
 * - Throws AppError if data is invalid (caught by error middleware)
 * - Ensures only clean, safe data reaches the database
 * 
 * INTERACTIONS:
 * - Used by: all controllers
 * - Throws: AppError (with appropriate HTTP status codes)
 * 
 * WHY VALIDATION MATTERS:
 * 1. Type safety: Ensures data is the expected type (string, number, etc.)
 * 2. Format safety: Ensures email looks like an email, ID looks like an ObjectId\n * 3. Security: Prevents malicious or malformed data from reaching the database
n * 4. User experience: Gives users clear error messages
 */

import { AppError } from './AppError';

/**
 * Validates that a value is a non-empty string
 * 
 * WHY:\n * Many API inputs are strings. We need to ensure they're not empty or undefined.
 * 
 * INPUTS:
 * - value: Any value from request (could be string, number, undefined, etc.)
 * - fieldName: Name of the field (for error message)
 *   Example: 'email', 'title', 'password'
 * 
 * OUTPUTS:
 * - The trimmed string if valid
 * - OR throws AppError(400, ...) if invalid
 * 
 * LOGIC:
 * 1. Check if value is a string using typeof
 * 2. Check if string is not empty (trim() removes whitespace)
 * 3. Throw error with fieldName in message if any check fails
 * 4. Return trimmed string (removes extra spaces before/after)
 * 
 * TYPESCRIPT EXPLANATION:
 * - unknown: Means the value could be any type (from user input)
 * - typeof value !== 'string': Checks if it's actually a string
 * - value.trim().length === 0: Checks if string is just whitespace
 * 
 * EXAMPLE:
 * const title = validateRequiredString(req.body.title, 'title');
 * // If body.title is missing: throws AppError(400, 'title is required')
 * // If body.title is '  hello  ': returns 'hello'
 */
export const validateRequiredString = (value: unknown, fieldName: string): string => {
  // Check if the value is a string AND not empty after trimming spaces
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new AppError(400, `${fieldName} is required`);
  }

  // Return the string with leading/trailing spaces removed
  return value.trim();
};

/**
 * Validates that a value is a valid email address
 * 
 * WHY:\n * Email is a special format (something@domain.com). Regular strings aren't good enough.
 * We need to verify it looks like a real email.
 * 
 * INPUTS:
 * - value: Any value to validate
 * 
 * OUTPUTS:
 * - Valid email as lowercase string
 * - OR throws AppError(400, 'email is invalid')
 * 
 * LOGIC:
 * 1. First validate that it's a required string (call validateRequiredString)
 * 2. Use regex pattern to test if it looks like an email
 * 3. Convert to lowercase (so emails are case-insensitive: john@x.com = JOHN@X.COM)
 * 4. Return the lowercase email or throw error
 * 
 * REGEX EXPLANATION:\n * /^[^\s@]+@[^\s@]+\.[^\s@]+$/\n * - ^: start of string
 * - [^\s@]+: one or more characters that are NOT spaces or @
 * - @: must have an @ symbol
 * - [^\s@]+: more non-space, non-@ characters (domain name)
 * - \.: must have a dot (.)
 * - [^\s@]+: more characters after dot (extension like 'com')
 * - $: end of string
 * Example matches: john@example.com, a@b.co (simple regex)
 * 
 * EXAMPLE:\n * const email = validateEmail(req.body.email);
 * // If body.email is 'John@Example.COM': returns 'john@example.com'
 * // If body.email is 'invalid-email': throws AppError(400, 'email is invalid')
 */
export const validateEmail = (value: unknown): string => {
  // First, validate that it's a required string
  const email = validateRequiredString(value, 'email');
  
  // Regex pattern for basic email validation
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Test if the email matches the pattern
  if (!emailPattern.test(email)) {
    throw new AppError(400, 'email is invalid');
  }

  // Return the email in lowercase (emails are case-insensitive)
  return email.toLowerCase();
};

/**
 * Validates that a value is a valid MongoDB ObjectId
 * 
 * WHY:\n * IDs in MongoDB must be specific format (24 hex characters).
 * If we try to query with an invalid ID format, MongoDB throws an error.
 * 
 * INPUTS:
 * - value: Any value to validate
 * - fieldName: Name of the field (for error message)
 *   Examples: 'userId', 'postId', 'commentId'
 * 
 * OUTPUTS:
 * - Valid ObjectId string if correct format
 * - OR throws AppError(400, ...) if invalid\n *\n * LOGIC:\n * 1. Validate it's a required string
 * 2. Check if it matches MongoDB ObjectId pattern (24 hex digits)
 * 3. Return it or throw error
 * 
 * MONGODB OBJECTID EXPLANATION:
 * MongoDB creates IDs like: 507f1f77bcf86cd799439011
 * - Exactly 24 characters
 * - Only contains hexadecimal digits (0-9, a-f)
 * - Used by Mongoose to identify documents
 * 
 * REGEX EXPLANATION:\n * /^[a-fA-F0-9]{24}$/\n * - ^: start of string
 * - [a-fA-F0-9]: one character that is 0-9 or a-f or A-F (hex digit)
 * - {24}: exactly 24 of these characters
 * - $: end of string
 * 
 * EXAMPLE:\n * const userId = validateObjectId(req.params.userId, 'userId');
 * // If params.userId is '507f1f77bcf86cd799439011': returns it (valid)
 * // If params.userId is '123': throws error (too short, not hex)
 * // If params.userId is 'not-a-number': throws error (contains invalid characters)
 */
export const validateObjectId = (value: unknown, fieldName: string): string => {
  // First validate it's a required string
  const id = validateRequiredString(value, fieldName);
  
  // MongoDB ObjectId pattern: exactly 24 hexadecimal characters
  const objectIdPattern = /^[a-fA-F0-9]{24}$/;

  // Check if the ID matches the expected format
  if (!objectIdPattern.test(id)) {
    throw new AppError(400, `${fieldName} must be a valid MongoDB ObjectId`);
  }

  // Return the validated ID
  return id;
};

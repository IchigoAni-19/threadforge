/**
 * FILE: src/services/credit.service.ts
 * 
 * PURPOSE:
 * Handles all credit/reward system logic.
 * - Calculates rewards using arithmetic progression
 * - Manages the singleton CreditConfig
 * 
 * HOW IT FITS IN:
 * - Used by: comment service (when creating/deleting comments)
 * - Reads from: CreditConfig collection (MongoDB)
 * - Implements: The reward formula for nested comments
 * 
 * ARITHMETIC PROGRESSION REWARD SYSTEM:
 * Post authors earn credits when users comment on their posts.
 * Deeper comments (replies to replies) earn more credits.
 * This incentivizes longer discussion threads.
 * 
 * FORMULA: reward = firstTerm + (depth - 1) * commonDifference
 */

import { CreditConfig } from '../models/CreditConfig';

/**
 * Calculates the reward for a comment based on its depth
 * 
 * USES THE ARITHMETIC PROGRESSION FORMULA:
 * reward = firstTerm + (depth - 1) * commonDifference
 * 
 * INPUTS:
 * - depth: How nested the comment is (1 for direct reply to post)
 * - firstTerm: Base reward value (from CreditConfig)
 * - commonDifference: How much to add per depth level
 * 
 * OUTPUTS:
 * - Number: The reward to give the post author
 * 
 * EXAMPLE CALCULATION (firstTerm=10, commonDifference=5):
 * - depth 1: 10 + (1 - 1) * 5 = 10 + 0 = 10
 * - depth 2: 10 + (2 - 1) * 5 = 10 + 5 = 15
 * - depth 3: 10 + (3 - 1) * 5 = 10 + 10 = 20
 * 
 * WHY (depth - 1):
 * Depth starts at 1, but the progression should start at 0.
 * So we subtract 1 to shift: depth 1 gets 0 multipliers, depth 2 gets 1 multiplier, etc.
 * 
 * MATH EXPLANATION FOR BEGINNERS:
 * Arithmetic progression: Each term increases by a constant amount
 * First term (a₁) = 10
 * Common difference (d) = 5
 * nth term = a₁ + (n - 1) * d
 */
export const calculateReward = (depth: number, firstTerm: number, commonDifference: number): number => {
  // Apply the arithmetic progression formula
  // Example: depth 2, firstTerm 10, diff 5 => 10 + (2-1) * 5 = 15
  return firstTerm + (depth - 1) * commonDifference;
};

/**
 * Gets the credit configuration from the database, or creates it with defaults
 * 
 * WHY THIS FUNCTION:
 * The credit config should exist in the database.
 * If it doesn't (first run), we create it with values from environment variables.
 * This ensures we always have a valid config to work with.
 * 
 * SINGLETON PATTERN:
 * Only one config document should ever exist.
 * We query for it by singletonKey: 'singleton'.
 * 
 * INPUTS: None (reads from environment and database)
 * 
 * OUTPUTS:
 * - Promise that resolves to object with:
 *   - firstTerm: Base reward value
 *   - commonDifference: Reward increment per depth
 * 
 * HOW IT WORKS:
 * 1. Query MongoDB for the config document (by singletonKey)
 * 2. If found, return it
 * 3. If not found, create it with values from environment variables
 * 4. Default fallback values if env vars not set: firstTerm 10, commonDifference 5
 * 5. Return the config values
 * 
 * WHY ASYNC/AWAIT:
 * Database queries take time. async/await lets us wait without blocking.
 * The function returns a Promise that resolves to the config.
 * 
 * EXAMPLE USAGE (from comment.service.ts):
 * const config = await getCreditConfigOrCreateDefault();
 * const reward = calculateReward(depth, config.firstTerm, config.commonDifference);
 */
export const getCreditConfigOrCreateDefault = async (): Promise<{ firstTerm: number; commonDifference: number }> => {
  // Query MongoDB for a config with singletonKey = 'singleton'
  // This should return at most one document
  let config = await CreditConfig.findOne({ singletonKey: 'singleton' });

  // If config doesn't exist, create it
  if (!config) {
    // Create with environment variables (with fallback defaults)
    // ?? means "use left value if exists, otherwise use right"
    config = await CreditConfig.create({
      singletonKey: 'singleton',
      // Read from .env or default to 10
      firstTerm: Number(process.env.CREDIT_FIRST_TERM ?? 10),
      // Read from .env or default to 5
      commonDifference: Number(process.env.CREDIT_COMMON_DIFFERENCE ?? 5)
    });
  }

  // Return just the fields we need (firstTerm and commonDifference)
  return {
    firstTerm: config.firstTerm,
    commonDifference: config.commonDifference
  };
};

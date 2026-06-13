/**
 * FILE: src/models/CreditConfig.ts
 * 
 * PURPOSE:
 * Stores the configuration for the credit/reward system.
 * Uses arithmetic progression to calculate comment rewards.
 * 
 * SINGLETON PATTERN:
 * This collection should ONLY contain ONE document.
 * It's a singleton - there's exactly one configuration for the entire app.
 * 
 * HOW IT FITS IN:
 * - Read by: comment service when calculating rewards
 * - Allows changing reward formula without code changes
 * - Single source of truth for credit configuration
 */

import { Document, Model, Schema, model } from 'mongoose';

/**
 * TypeScript Interface for CreditConfig document
 * 
 * PROPERTIES:
 * - singletonKey: Unique identifier to enforce one document (always 'singleton')
 * - firstTerm: The base reward amount for depth 1 comments
 *   Example: 10 means first comments earn 10 credits
 * - commonDifference: How much to add for each depth level
 *   Example: 5 means depth 2 = 10+5=15, depth 3 = 10+10=20, etc.
 * - createdAt: When this config was created
 * - updatedAt: When this config was last changed
 */
export interface ICreditConfig extends Document {
  singletonKey: string;
  firstTerm: number;
  commonDifference: number;
  createdAt: Date;
  updatedAt: Date;
}

const creditConfigSchema = new Schema<ICreditConfig>(
  {
    // Unique key to enforce singleton pattern (only one config document)
    // unique: true prevents multiple documents
    singletonKey: { type: String, required: true, unique: true, default: 'singleton' },
    // First term in arithmetic progression (base reward for depth 1)
    firstTerm: { type: Number, required: true, min: 0 },
    // Common difference (reward increase per depth level)
    // Example: if firstTerm=10 and this=5:
    // depth 1 gets 10, depth 2 gets 15, depth 3 gets 20, etc.
    commonDifference: { type: Number, required: true }
  },
  // timestamps: true adds createdAt and updatedAt
  { timestamps: true }
);

/**
 * ARITHMETIC PROGRESSION USAGE:
 * When a new comment is created:
 * 1. Get the firstTerm and commonDifference from this collection
 * 2. Calculate: reward = firstTerm + (depth - 1) * commonDifference
 * 3. Award that amount to the post author
 * 
 * EXAMPLE CONFIGURATION:
 * {
 *   firstTerm: 10,
 *   commonDifference: 5
 * }
 * 
 * RESULTING REWARDS:
 * - Comment depth 1: 10
 * - Comment depth 2: 15
 * - Comment depth 3: 20
 * - Comment depth 4: 25
 * etc.
 * 
 * WHY NOT HARDCODE:
 * By storing in database, admins can adjust rewards without code changes.
 * This makes the system flexible for experimentation.
 */

export const CreditConfig: Model<ICreditConfig> = model<ICreditConfig>('CreditConfig', creditConfigSchema);

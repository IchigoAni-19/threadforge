/**
 * FILE: src/models/User.ts
 * 
 * PURPOSE:\n * Defines the User document structure for MongoDB.
 * Users are people who can create accounts and post in the forum.
 * 
 * MONGODB CONCEPTS:\n * - Document: A single user record (like a row in a table)\n * - Schema: The structure that all user documents must follow
 * - Model: The interface to create, read, update, delete users
 * 
 * HOW IT FITS IN:\n * - Used by: all auth services and user-related operations
 * - Stored in: MongoDB 'users' collection
 * - Referenced by: posts and comments (via author field)
 */

import { Document, Model, Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';

/**
 * TypeScript Interface for User document\n *\n * WHAT IS AN INTERFACE:\n * Defines what properties a user must have and their types.\n *\n * EXTENDS Document:\n * Document is Mongoose's base class for all database documents.
 * It adds MongoDB features like .save(), .findById(), etc.\n *\n * PROPERTIES:\n * - name: User's display name (string)\n * - email: User's email (unique identifier for login)\n * - password: Hashed password (never store plain text!)\n * - credits: Total credits earned from comments under user's posts\n * - comparePassword(): Method to verify password during login
 */
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  credits: number;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

/**
 * Mongoose Schema for User collection\n *\n * WHAT IS A SCHEMA:\n * A schema defines the rules for each field in the collection.
 * It specifies type, requirements, transformations, etc.
 *\n * FIELD DEFINITIONS:\n * - name: String that's required and trimmed of spaces\n * - email: String that's required, trimmed, lowercase, and unique (no duplicates)\n *   unique: true means MongoDB prevents two users with same email
 * - password: Required string but NOT included in queries by default (select: false)\n *   select: false means password only loads when explicitly requested
 *   This prevents accidentally exposing passwords\n * - credits: Number that defaults to 0 if not provided
n *\n * timestamps: true automatically adds createdAt and updatedAt fields
 *   createdAt: When the user was created
 *   updatedAt: When the user was last modified
 */
const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true },
    // select: false means password won't be loaded by default (security best practice)
    // Only include password when explicitly selecting it
    password: { type: String, required: true, select: false },
    // credits defaults to 0 when creating a new user
    credits: { type: Number, default: 0 }
  },
  // timestamps: true adds createdAt and updatedAt automatically
  { timestamps: true }
);

/**
 * Pre-save hook: Runs automatically before saving a user to the database\n *\n * WHY THIS HOOK:\n * We must never store plain-text passwords. Before saving to database,
 * we hash the password so it's irreversible (one-way encryption).\n *\n * HOW MONGOOSE HOOKS WORK:\n * .pre('save') means \"run this function BEFORE saving\"
 * .post('save') would run AFTER saving\n *\n * WHAT IS HASHING:\n * Hashing converts \"myPassword123\" into a random-looking string that can't be reversed.
 * Even if a hacker gets the database, they can't get original passwords.
 * Same password always hashes to different value (salting).
n *\n * BCRYPT EXPLANATION:\n * bcrypt is an industry-standard library for password hashing.
 * - Intentionally slow (to prevent brute force attacks)\n * - Includes salt (random data mixed in)
 * - 12 rounds = 2^12 hashing iterations (higher = slower but more secure)\n */
userSchema.pre('save', async function hashPassword(next) {
  // Check if password was actually modified
  // If not (e.g., user just updated name), skip hashing
  if (!this.isModified('password')) {
    return next();
  }

  // Number of salt rounds for bcrypt (higher = more secure but slower)
  // 12 rounds is a good balance between security and performance
  const saltRounds = 12;
  
  // Hash the password using bcrypt
  // bcrypt.hash returns a Promise, so we await it
  // Result looks like: $2b$12$... (contains salt + hash + algorithm info)
  this.password = await bcrypt.hash(this.password, saltRounds);
  
  // Continue to the save operation
  next();
});

/**
 * Instance method: Compare password during login\n *\n * WHAT IS AN INSTANCE METHOD:\n * A method that can be called on individual documents.
 * Example: const user = await User.findById(...); user.comparePassword('test')
n *\n * WHY THIS METHOD:\n * When user logs in, they send a plain-text password.
 * We need to compare it with the stored hashed password.
 * bcrypt.compare does this securely.
n *\n * INPUTS:\n * - candidatePassword: The plain-text password user entered
n *\n * OUTPUTS:\n * - Promise<boolean>: true if password matches, false if doesn't
n *\n * HOW IT WORKS:\n * 1. User enters password on login form\n * 2. controller calls user.comparePassword(enteredPassword)
 * 3. bcrypt.compare hashes the entered password again
 * 4. Compares it with stored hash (they won't match unless passwords are same)\n * 5. Returns true/false
n *\n * WHY NOT JUST COMPARE HASHES:\n * Because passwords are hashed with a random salt, same password
 * hashes to different values each time. bcrypt.compare knows how to handle this.
n */
userSchema.methods.comparePassword = function comparePassword(candidatePassword: string): Promise<boolean> {
  // bcrypt.compare(plainText, hash) returns true if they match
  // It's secure - doesn't reveal the actual hash
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Export the User model\n *\n * WHAT IS A MODEL:\n * A model is the interface to work with the collection.
 * Model<IUser> tells TypeScript this model works with IUser documents.
n *\n * USAGE:\n * const users = await User.find();\n * const user = await User.findById(id);\n * const newUser = await User.create({ name, email, password });\n */
export const User: Model<IUser> = model<IUser>('User', userSchema);

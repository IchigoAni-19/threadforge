/**
 * Normalizes user IDs across the API.
 *
 * Backend inconsistency:
 * - Auth endpoints return `user.id`
 * - Mongoose documents return `_id`
 *
 * This helper safely extracts a string ID from either shape.
 */
export function getUserId(entity: { id?: string; _id?: string } | string): string {
  if (typeof entity === 'string') {
    return entity;
  }
  return entity.id ?? entity._id ?? '';
}

/**
 * Extracts author ID from a comment (populated object or raw ObjectId string).
 */
export function getCommentAuthorId(author: { _id?: string } | string): string {
  if (typeof author === 'string') {
    return author;
  }
  return author._id ?? '';
}

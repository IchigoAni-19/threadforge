/**
 * Comment author when populated by GET /api/comments/post/:postId.
 */
export interface CommentAuthor {
  _id: string;
  name: string;
  email: string;
}

/**
 * Flat comment shape returned by the backend.
 * Comments arrive as a FLAT ARRAY — we convert them to a tree in utils/.
 */
export interface Comment {
  _id: string;
  content: string;
  author: CommentAuthor | string;
  postId: string;
  parentCommentId: string | null;
  depth: number;
  reward: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Tree node used for recursive rendering.
 * Each node holds its comment plus an array of child nodes.
 */
export interface CommentNode {
  comment: Comment;
  children: CommentNode[];
}

/** Payload for POST /api/comments (root comment) */
export interface CreateCommentPayload {
  content: string;
  postId: string;
}

/** Payload for POST /api/comments/reply */
export interface ReplyCommentPayload {
  content: string;
  postId: string;
  parentCommentId: string;
}

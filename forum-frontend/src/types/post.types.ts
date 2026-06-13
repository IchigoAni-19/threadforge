/**
 * Author embedded inside a post when the backend populates the field.
 * GET /api/posts and GET /api/posts/:id return this shape.
 */
export interface PostAuthor {
  _id: string;
  name: string;
  email: string;
  credits: number;
}

/** Full post document as returned by the list and detail endpoints. */
export interface Post {
  _id: string;
  title: string;
  body: string;
  author: PostAuthor;
  createdAt: string;
  updatedAt: string;
}

/** Payload for POST /api/posts */
export interface CreatePostPayload {
  title: string;
  body: string;
}

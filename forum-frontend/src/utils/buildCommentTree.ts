/**
 * Converts a FLAT comment array into a NESTED TREE structure.
 *
 * WHY THIS EXISTS:
 * The backend stores comments with a `parentCommentId` reference.
 * It returns them as a flat list. The UI needs a tree to render nesting:
 *
 *   Comment A
 *   └── Comment B
 *       └── Comment C
 *
 * ALGORITHM (two-pass):
 * 1. Build a Map from comment ID → CommentNode (with empty children array)
 * 2. Link each node to its parent using parentCommentId
 *    - parentCommentId === null → root-level comment
 *
 * TypeScript concept: Map<K, V>
 * A Map is like an object but better for frequent lookups by key.
 */

import type { Comment, CommentNode } from '@/types/comment.types';

export function buildCommentTree(flatComments: Comment[]): CommentNode[] {
  const nodeMap = new Map<string, CommentNode>();

  // Pass 1: create a node for every comment
  for (const comment of flatComments) {
    nodeMap.set(comment._id, { comment, children: [] });
  }

  const roots: CommentNode[] = [];

  // Pass 2: attach each node to its parent (or to roots)
  for (const comment of flatComments) {
    const node = nodeMap.get(comment._id);
    if (!node) continue;

    if (comment.parentCommentId) {
      const parent = nodeMap.get(comment.parentCommentId);
      if (parent) {
        parent.children.push(node);
      } else {
        // Orphan: parent missing (deleted or data issue) — show at root
        roots.push(node);
      }
    } else {
      roots.push(node);
    }
  }

  return roots;
}

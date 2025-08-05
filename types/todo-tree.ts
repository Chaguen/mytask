import { Todo } from './todo';

// Type-safe path representation for todo tree navigation
export type TodoPath = number[];

// Result type for tree operations
export interface TodoTreeResult<T> {
  found: boolean;
  value?: T;
  path?: TodoPath;
}

// Callback types for tree traversal
export type TodoVisitor = (todo: Todo, path: TodoPath, parent?: Todo) => void;
export type TodoPredicate = (todo: Todo, path: TodoPath) => boolean;
export type TodoTransformer = (todo: Todo, path: TodoPath) => Todo;

// Tree operation options
export interface TreeOperationOptions {
  maxDepth?: number;
  includeCompleted?: boolean;
}

// Constants
export const MAX_TODO_DEPTH = 5; // Maximum nesting level
export const DEFAULT_MARGIN_STEP = 8; // Tailwind margin step size
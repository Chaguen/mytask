export interface BaseTodo {
  id: number;
  text: string;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
  focusPriority?: number;
  isEditing?: boolean;
}

export interface Todo extends BaseTodo {
  subtasks?: Todo[];
}

export interface TodoStats {
  completed: number;
  total: number;
}

// Type alias for better type safety with paths
export type TodoPath = number[];

// Type guards
export function isTodo(value: unknown): value is Todo {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'text' in value &&
    'completed' in value &&
    'createdAt' in value
  );
}

export function hasSubtasks(todo: Todo): todo is Todo & { subtasks: Todo[] } {
  return Array.isArray(todo.subtasks) && todo.subtasks.length > 0;
}

// Validation functions
export function isValidPath(path: unknown): path is TodoPath {
  return Array.isArray(path) && path.every(id => typeof id === 'number');
}

export function validatePath(path: unknown): TodoPath {
  if (!isValidPath(path)) {
    throw new Error('Invalid todo path: must be an array of numbers');
  }
  return path;
}
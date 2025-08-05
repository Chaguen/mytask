import { Todo, TodoPath, hasSubtasks } from '@/types/todo';
import { MAX_NESTING_DEPTH, MAX_SUBTASKS_PER_TODO } from '@/constants/todo';
import { findTodoByPath, getParentPath } from './todo-tree-utils';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates if a subtask can be added at the given path
 */
export function validateAddSubtask(
  todos: Todo[],
  parentPath: TodoPath
): ValidationResult {
  // Check path depth
  if (parentPath.length >= MAX_NESTING_DEPTH) {
    return {
      isValid: false,
      error: `Maximum nesting depth of ${MAX_NESTING_DEPTH} levels reached`
    };
  }

  // Find parent todo
  const parent = findTodoByPath(todos, parentPath);
  if (!parent) {
    return {
      isValid: false,
      error: 'Parent todo not found'
    };
  }

  // Check subtask count
  const subtaskCount = parent.subtasks?.length || 0;
  if (subtaskCount >= MAX_SUBTASKS_PER_TODO) {
    return {
      isValid: false,
      error: `Maximum of ${MAX_SUBTASKS_PER_TODO} subtasks per todo reached`
    };
  }

  return { isValid: true };
}

/**
 * Detects circular references in the todo tree
 */
export function hasCircularReference(
  todos: Todo[],
  checkId: number,
  visitedIds: Set<number> = new Set()
): boolean {
  if (visitedIds.has(checkId)) {
    return true;
  }

  visitedIds.add(checkId);

  for (const todo of todos) {
    if (todo.id === checkId && hasSubtasks(todo)) {
      if (hasCircularReference(todo.subtasks, checkId, new Set(visitedIds))) {
        return true;
      }
    } else if (hasSubtasks(todo)) {
      if (hasCircularReference(todo.subtasks, checkId, visitedIds)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Validates a todo path exists in the tree
 */
export function validatePath(
  todos: Todo[],
  path: TodoPath
): ValidationResult {
  if (path.length === 0) {
    return {
      isValid: false,
      error: 'Path cannot be empty'
    };
  }

  const todo = findTodoByPath(todos, path);
  if (!todo) {
    return {
      isValid: false,
      error: 'Todo not found at specified path'
    };
  }

  return { isValid: true };
}

/**
 * Validates todo text before creation
 */
export function validateTodoText(text: string): ValidationResult {
  const trimmed = text.trim();
  
  if (!trimmed) {
    return {
      isValid: false,
      error: 'Todo text cannot be empty'
    };
  }

  if (trimmed.length > 500) {
    return {
      isValid: false,
      error: 'Todo text cannot exceed 500 characters'
    };
  }

  return { isValid: true };
}

/**
 * Validates that all parent todos in a path exist
 */
export function validateParentPath(
  todos: Todo[],
  parentPath: TodoPath
): ValidationResult {
  if (parentPath.length === 0) {
    return { isValid: true }; // No parent is valid
  }

  let currentTodos = todos;
  for (let i = 0; i < parentPath.length; i++) {
    const id = parentPath[i];
    const todo = currentTodos.find(t => t.id === id);
    
    if (!todo) {
      return {
        isValid: false,
        error: `Parent todo with id ${id} not found at level ${i}`
      };
    }

    currentTodos = todo.subtasks || [];
  }

  return { isValid: true };
}

/**
 * Sanitizes todo data to prevent XSS and other issues
 */
export function sanitizeTodoText(text: string): string {
  return text
    .trim()
    .replace(/[<>]/g, '') // Basic XSS prevention
    .substring(0, 500); // Enforce max length
}
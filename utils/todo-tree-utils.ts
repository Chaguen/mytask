import { Todo } from '@/types/todo';
import { 
  TodoPath, 
  TodoTreeResult, 
  TodoVisitor, 
  TodoPredicate, 
  TodoTransformer,
  TreeOperationOptions,
  MAX_TODO_DEPTH
} from '@/types/todo-tree';

/**
 * Generic tree traversal function
 */
export function traverseTodoTree(
  todos: Todo[],
  visitor: TodoVisitor,
  options: TreeOperationOptions = {}
): void {
  const { maxDepth = MAX_TODO_DEPTH, includeCompleted = true } = options;

  function traverse(
    todoList: Todo[],
    currentPath: TodoPath = [],
    parent?: Todo
  ): void {
    if (currentPath.length >= maxDepth) return;

    todoList.forEach((todo) => {
      if (!includeCompleted && todo.completed) return;
      
      visitor(todo, currentPath, parent);
      
      if (todo.subtasks && todo.subtasks.length > 0) {
        traverse(todo.subtasks, [...currentPath, todo.id], todo);
      }
    });
  }

  traverse(todos);
}

/**
 * Find a todo by its path in the tree
 */
export function findTodoByPath(
  todos: Todo[],
  targetPath: TodoPath
): TodoTreeResult<Todo> {
  if (targetPath.length === 0) {
    return { found: false };
  }

  function find(todoList: Todo[], path: TodoPath): Todo | null {
    if (path.length === 0) return null;
    
    const [currentId, ...restPath] = path;
    const todo = todoList.find(t => t.id === currentId);
    
    if (!todo) return null;
    
    if (restPath.length === 0) {
      return todo;
    }
    
    return find(todo.subtasks || [], restPath);
  }

  const result = find(todos, targetPath);
  return result 
    ? { found: true, value: result, path: targetPath }
    : { found: false };
}

/**
 * Update a todo at a specific path
 */
export function updateTodoAtPath(
  todos: Todo[],
  path: TodoPath,
  updater: TodoTransformer
): Todo[] {
  if (path.length === 0) return todos;

  function update(todoList: Todo[], currentPath: TodoPath): Todo[] {
    const [currentId, ...restPath] = currentPath;
    
    return todoList.map(todo => {
      if (todo.id !== currentId) return todo;
      
      if (restPath.length === 0) {
        // This is the target todo
        return updater(todo, path);
      }
      
      // Continue traversing
      return {
        ...todo,
        subtasks: update(todo.subtasks || [], restPath)
      };
    });
  }

  return update(todos, path);
}

/**
 * Find all todos matching a predicate
 */
export function findAllTodos(
  todos: Todo[],
  predicate: TodoPredicate
): TodoTreeResult<Todo>[] {
  const results: TodoTreeResult<Todo>[] = [];
  
  traverseTodoTree(todos, (todo, path) => {
    if (predicate(todo, path)) {
      results.push({
        found: true,
        value: todo,
        path: [...path, todo.id]
      });
    }
  });
  
  return results;
}

/**
 * Count todos in the tree
 */
export function countTodos(
  todos: Todo[],
  predicate?: TodoPredicate
): number {
  let count = 0;
  
  traverseTodoTree(todos, (todo, path) => {
    if (!predicate || predicate(todo, path)) {
      count++;
    }
  });
  
  return count;
}

/**
 * Get the depth of the deepest todo
 */
export function getMaxDepth(todos: Todo[]): number {
  let maxDepth = 0;
  
  traverseTodoTree(todos, (_, path) => {
    maxDepth = Math.max(maxDepth, path.length + 1);
  });
  
  return maxDepth;
}

/**
 * Validate a todo path
 */
export function isValidPath(
  todos: Todo[],
  path: TodoPath
): boolean {
  const result = findTodoByPath(todos, path);
  return result.found;
}

/**
 * Get parent todo from a path
 */
export function getParentTodo(
  todos: Todo[],
  childPath: TodoPath
): TodoTreeResult<Todo> {
  if (childPath.length <= 1) {
    return { found: false };
  }
  
  const parentPath = childPath.slice(0, -1);
  return findTodoByPath(todos, parentPath);
}

/**
 * Flatten todo tree into a list with paths
 */
export function flattenTodoTree(todos: Todo[]): Array<{ todo: Todo; path: TodoPath }> {
  const flattened: Array<{ todo: Todo; path: TodoPath }> = [];
  
  traverseTodoTree(todos, (todo, path) => {
    flattened.push({ 
      todo, 
      path: [...path, todo.id] 
    });
  });
  
  return flattened;
}

/**
 * Check if adding a todo would create a circular reference
 */
export function wouldCreateCircularReference(
  todos: Todo[],
  parentPath: TodoPath,
  todoId: number
): boolean {
  // Check if todoId appears in parentPath
  return parentPath.includes(todoId);
}
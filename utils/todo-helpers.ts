import { Todo } from '@/types/todo';
import { TodoPath, MAX_TODO_DEPTH } from '@/types/todo-tree';
import { updateTodoAtPath, isValidPath, wouldCreateCircularReference, findTodoByPath } from './todo-tree-utils';

export function createTodo(text: string, isEditing?: boolean): Todo {
  return {
    id: Date.now(),
    text: text.trim(),
    completed: false,
    createdAt: new Date().toISOString(),
    subtasks: [],
    isEditing: isEditing,
  };
}

export function toggleTodoCompletion(
  todos: Todo[],
  id: number,
  parentIds?: TodoPath
): Todo[] {
  const path = parentIds ? [...parentIds, id] : [id];
  
  // Validate path - skip validation for empty arrays (top-level todos)
  if (parentIds && parentIds.length > 0 && !isValidPath(todos, parentIds)) {
    console.error('Invalid parent path:', parentIds);
    return todos;
  }
  
  return updateTodoAtPath(todos, path, (todo) => {
    const newCompleted = !todo.completed;
    return {
      ...todo,
      completed: newCompleted,
      completedAt: newCompleted ? new Date().toISOString() : undefined,
      subtasks: setAllSubtasksCompleted(todo.subtasks, newCompleted),
    };
  });
}

export function deleteTodoFromList(
  todos: Todo[],
  id: number,
  parentIds?: TodoPath
): Todo[] {
  if (!parentIds || parentIds.length === 0) {
    // Delete top-level todo
    return todos.filter((todo) => todo.id !== id);
  }
  
  // Validate path
  if (!isValidPath(todos, parentIds)) {
    console.error('Invalid parent path:', parentIds);
    return todos;
  }
  
  return updateTodoAtPath(todos, parentIds, (parentTodo) => ({
    ...parentTodo,
    subtasks: parentTodo.subtasks?.filter((st) => st.id !== id),
  }));
}

export function addSubtaskToTodo(
  todos: Todo[],
  parentIds: TodoPath,
  subtaskText: string,
  startEditing: boolean = false
): Todo[] {
  // Validate inputs
  if (!parentIds || parentIds.length === 0) {
    console.error('Parent IDs required for adding subtask');
    return todos;
  }
  
  if (parentIds.length >= MAX_TODO_DEPTH) {
    console.error(`Maximum nesting depth (${MAX_TODO_DEPTH}) reached`);
    return todos;
  }
  
  if (!isValidPath(todos, parentIds)) {
    console.error('Invalid parent path:', parentIds);
    return todos;
  }
  
  const newSubtask = createTodo(subtaskText, startEditing);
  
  return updateTodoAtPath(todos, parentIds, (parentTodo) => {
    const updatedSubtasks = [...(parentTodo.subtasks || []), newSubtask];
    
    // Auto-uncomplete parent if it was marked as complete
    const shouldUpdateCompletion = parentTodo.completed && updatedSubtasks.length > 0;
    
    return {
      ...parentTodo,
      subtasks: updatedSubtasks,
      completed: shouldUpdateCompletion ? false : parentTodo.completed,
    };
  });
}

export function checkAllSubtasksCompleted(subtasks: Todo[] | undefined): boolean {
  if (!subtasks || subtasks.length === 0) return false;
  
  return subtasks.every((subtask) => {
    if (subtask.subtasks && subtask.subtasks.length > 0) {
      return subtask.completed && checkAllSubtasksCompleted(subtask.subtasks);
    }
    return subtask.completed;
  });
}

function setAllSubtasksCompleted(
  subtasks: Todo[] | undefined,
  completed: boolean
): Todo[] | undefined {
  if (!subtasks) return undefined;
  
  const completedAt = completed ? new Date().toISOString() : undefined;
  
  return subtasks.map(subtask => ({
    ...subtask,
    completed,
    completedAt,
    subtasks: setAllSubtasksCompleted(subtask.subtasks, completed),
  }));
}

// Update parent completion status based on subtasks
export function updateParentCompletion(
  todos: Todo[],
  childPath: TodoPath
): Todo[] {
  if (childPath.length === 0) return todos;
  
  // If childPath has only one element, it's a top-level todo - no parent to update
  if (childPath.length === 1) return todos;
  
  const parentPath = childPath.slice(0, -1);
  
  // Recursively update all parents
  let updatedTodos = updateTodoAtPath(todos, parentPath, (parentTodo) => {
    const allCompleted = checkAllSubtasksCompleted(parentTodo.subtasks);
    
    if (parentTodo.completed !== allCompleted) {
      return { 
        ...parentTodo, 
        completed: allCompleted,
        completedAt: allCompleted ? new Date().toISOString() : undefined
      };
    }
    
    return parentTodo;
  });
  
  // Continue updating parent's parent if needed
  if (parentPath.length > 1) {
    updatedTodos = updateParentCompletion(updatedTodos, parentPath);
  }
  
  return updatedTodos;
}

// Update todo text
export function updateTodoText(
  todos: Todo[],
  id: number,
  newText: string,
  parentIds?: TodoPath
): Todo[] {
  const path = parentIds ? [...parentIds, id] : [id];
  
  // Validate path - skip validation for empty arrays (top-level todos)
  if (parentIds && parentIds.length > 0 && !isValidPath(todos, parentIds)) {
    console.error('Invalid parent path:', parentIds);
    return todos;
  }
  
  return updateTodoAtPath(todos, path, (todo) => ({
    ...todo,
    text: newText.trim(),
    // Don't change isEditing here - let it be handled separately
  }));
}

// Set todo editing state
export function setTodoEditing(
  todos: Todo[],
  id: number,
  isEditing: boolean,
  parentIds?: TodoPath
): Todo[] {
  const path = parentIds ? [...parentIds, id] : [id];
  
  // Validate path - skip validation for empty arrays (top-level todos)
  if (parentIds && parentIds.length > 0 && !isValidPath(todos, parentIds)) {
    console.error('Invalid parent path:', parentIds);
    return todos;
  }
  
  return updateTodoAtPath(todos, path, (todo) => ({
    ...todo,
    isEditing,
  }));
}

// Copy a todo and all its subtasks
export function copyTodoWithSubtasks(todo: Todo): Todo {
  const newTodo: Todo = {
    id: Date.now() + Math.random(), // Ensure unique ID
    text: todo.text,
    completed: false, // Always set to unchecked
    createdAt: new Date().toISOString(),
    completedAt: undefined, // Reset completion time
    isEditing: false,
  };

  // Recursively copy subtasks if they exist
  if (todo.subtasks && todo.subtasks.length > 0) {
    newTodo.subtasks = todo.subtasks.map(subtask => copyTodoWithSubtasks(subtask));
  }

  return newTodo;
}

// Copy todo at specific position in the tree
export function copyTodoInList(
  todos: Todo[],
  id: number,
  parentIds?: TodoPath
): Todo[] {
  if (!parentIds || parentIds.length === 0) {
    // Copy top-level todo
    const todoIndex = todos.findIndex(t => t.id === id);
    if (todoIndex === -1) {
      console.error('Todo not found:', id);
      return todos;
    }
    
    const originalTodo = todos[todoIndex];
    const copiedTodo = copyTodoWithSubtasks(originalTodo);
    
    // Insert the copy right after the original
    const newTodos = [...todos];
    newTodos.splice(todoIndex + 1, 0, copiedTodo);
    return newTodos;
  }
  
  // Copy subtask
  if (!isValidPath(todos, parentIds)) {
    console.error('Invalid parent path:', parentIds);
    return todos;
  }
  
  return updateTodoAtPath(todos, parentIds, (parentTodo) => {
    const subtaskIndex = parentTodo.subtasks?.findIndex(st => st.id === id) ?? -1;
    if (subtaskIndex === -1) {
      console.error('Subtask not found:', id);
      return parentTodo;
    }
    
    const originalSubtask = parentTodo.subtasks![subtaskIndex];
    const copiedSubtask = copyTodoWithSubtasks(originalSubtask);
    
    // Insert the copy right after the original
    const newSubtasks = [...(parentTodo.subtasks || [])];
    newSubtasks.splice(subtaskIndex + 1, 0, copiedSubtask);
    
    return {
      ...parentTodo,
      subtasks: newSubtasks,
    };
  });
}

// Get the next action for a todo with subtasks
export function getNextActionForTodo(todo: Todo): Todo | null {
  if (!todo.subtasks || todo.subtasks.length === 0 || todo.completed) {
    return null;
  }
  
  // Find the first incomplete subtask
  for (const subtask of todo.subtasks) {
    if (!subtask.completed) {
      // If this subtask has its own subtasks, recurse
      if (subtask.subtasks && subtask.subtasks.length > 0) {
        const nextAction = getNextActionForTodo(subtask);
        return nextAction || subtask;
      }
      return subtask;
    }
  }
  
  return null;
}

// Check if a todo is a next action
export function isNextAction(
  todo: Todo,
  parentTodo?: Todo,
  parentIds?: TodoPath,
  allTodos?: Todo[]
): boolean {
  // If it's completed, it's not a next action
  if (todo.completed) return false;
  
  // If it has uncompleted subtasks, it's not a next action (the subtask is)
  if (todo.subtasks && todo.subtasks.some(st => !st.completed)) return false;
  
  // If no parent is provided, check if it's a top-level next action
  if (!parentTodo) {
    // Top-level todos without subtasks are next actions
    return !todo.subtasks || todo.subtasks.length === 0;
  }
  
  // Check if this is the first incomplete subtask of its parent
  const firstIncomplete = parentTodo.subtasks?.find(st => !st.completed);
  return firstIncomplete?.id === todo.id;
}

// Get all next actions from the todo tree
export function getAllNextActions(
  todos: Todo[],
  parentIds: TodoPath = [],
  parentTodo?: Todo
): Array<{ todo: Todo; path: TodoPath; parentTodo?: Todo }> {
  const nextActions: Array<{ todo: Todo; path: TodoPath; parentTodo?: Todo }> = [];
  
  for (const todo of todos) {
    const currentPath = [...parentIds, todo.id];
    
    if (isNextAction(todo, parentTodo)) {
      nextActions.push({ todo, path: currentPath, parentTodo });
    }
    
    // Recurse into subtasks
    if (todo.subtasks && todo.subtasks.length > 0 && !todo.completed) {
      const subtaskNextActions = getAllNextActions(todo.subtasks, currentPath, todo);
      nextActions.push(...subtaskNextActions);
    }
  }
  
  return nextActions;
}

// Get project path as string array
export function getProjectPath(
  todos: Todo[],
  path: TodoPath
): string[] {
  const pathNames: string[] = [];
  let currentTodos = todos;
  
  for (const id of path) {
    const todo = currentTodos.find(t => t.id === id);
    if (todo) {
      pathNames.push(todo.text);
      currentTodos = todo.subtasks || [];
    }
  }
  
  return pathNames;
}

// Reorder todos at the same level
export function reorderTodos(
  todos: Todo[],
  activeId: number,
  overId: number,
  parentIds?: TodoPath
): Todo[] {
  if (activeId === overId) return todos;

  // Helper function to reorder items in an array
  const reorderArray = (items: Todo[]): Todo[] => {
    const activeIndex = items.findIndex(item => item.id === activeId);
    const overIndex = items.findIndex(item => item.id === overId);
    
    if (activeIndex === -1 || overIndex === -1) return items;
    
    const newItems = [...items];
    const [movedItem] = newItems.splice(activeIndex, 1);
    newItems.splice(overIndex, 0, movedItem);
    
    return newItems;
  };

  // If no parent IDs, reorder at root level
  if (!parentIds || parentIds.length === 0) {
    return reorderArray(todos);
  }

  // Otherwise, reorder within the parent
  return updateTodoAtPath(todos, parentIds, (parentTodo) => ({
    ...parentTodo,
    subtasks: reorderArray(parentTodo.subtasks || []),
  }));
}

// Get siblings of a todo (todos at the same level)
export function getSiblings(
  todos: Todo[],
  todoId: number,
  parentIds?: TodoPath
): Todo[] {
  if (!parentIds || parentIds.length === 0) {
    return todos;
  }

  const result = findTodoByPath(todos, parentIds);
  if (result.found && result.value?.subtasks) {
    return result.value.subtasks;
  }

  return [];
}

// Check if two todos are siblings (at the same level)
export function areSiblings(
  todos: Todo[],
  id1: number,
  id2: number,
  parentIds1?: TodoPath,
  parentIds2?: TodoPath
): boolean {
  // Compare parent paths
  const path1 = parentIds1 || [];
  const path2 = parentIds2 || [];
  
  if (path1.length !== path2.length) return false;
  
  // Check if all parent IDs match
  return path1.every((id, index) => id === path2[index]);
}

// Get parent IDs that should be collapsed after todo completion
export function getParentIdsToCollapse(
  todos: Todo[],
  parentIds: TodoPath
): number[] {
  const idsToCollapse: number[] = [];
  
  // Check each parent in the path from bottom to top
  for (let i = parentIds.length - 1; i >= 0; i--) {
    const parentPath = parentIds.slice(0, i);
    const parentId = parentIds[i];
    
    // Get the parent todo
    if (parentPath.length === 0) {
      const parentTodo = todos.find(t => t.id === parentId);
      if (parentTodo?.completed && parentTodo.subtasks && parentTodo.subtasks.length > 0) {
        idsToCollapse.push(parentId);
      }
    } else {
      const result = findTodoByPath(todos, [...parentPath, parentId]);
      if (result.found && result.value?.completed && result.value.subtasks && result.value.subtasks.length > 0) {
        idsToCollapse.push(parentId);
      }
    }
  }
  
  return idsToCollapse;
}

// Batch update multiple todos
export function batchUpdateTodos(
  todos: Todo[],
  updates: Array<{ path: TodoPath; updates: Partial<Todo> }>
): Todo[] {
  let result = todos;
  
  for (const update of updates) {
    result = updateTodoAtPath(result, update.path, (todo) => ({
      ...todo,
      ...update.updates,
    }));
  }
  
  return result;
}

// Get all todos with focus priority
export function getFocusTodos(todos: Todo[]): Array<{ todo: Todo; path: TodoPath }> {
  const focusTodos: Array<{ todo: Todo; path: TodoPath }> = [];
  
  function traverse(todoList: Todo[], currentPath: TodoPath = []) {
    for (const todo of todoList) {
      const path = [...currentPath, todo.id];
      if (todo.focusPriority !== undefined) {
        focusTodos.push({ todo, path });
      }
      if (todo.subtasks && todo.subtasks.length > 0) {
        traverse(todo.subtasks, path);
      }
    }
  }
  
  traverse(todos);
  return focusTodos.sort((a, b) => (a.todo.focusPriority || 0) - (b.todo.focusPriority || 0));
}

// Sort todos by focus priority (keeping tree structure)
export function sortTodosByFocusPriority(todos: Todo[]): Todo[] {
  // Get all todos with their focus priorities
  const todoMap = new Map<number, number>();
  
  function collectPriorities(todoList: Todo[]) {
    for (const todo of todoList) {
      if (todo.focusPriority !== undefined) {
        todoMap.set(todo.id, todo.focusPriority);
      }
      if (todo.subtasks && todo.subtasks.length > 0) {
        collectPriorities(todo.subtasks);
      }
    }
  }
  
  collectPriorities(todos);
  
  // Sort function that considers focus priority
  const sortByPriority = (todoList: Todo[]): Todo[] => {
    return [...todoList].sort((a, b) => {
      const aPriority = todoMap.get(a.id) ?? Infinity;
      const bPriority = todoMap.get(b.id) ?? Infinity;
      
      // If both have priorities, sort by priority
      if (aPriority !== Infinity && bPriority !== Infinity) {
        return aPriority - bPriority;
      }
      
      // If only one has priority, it comes first
      if (aPriority !== Infinity) return -1;
      if (bPriority !== Infinity) return 1;
      
      // Otherwise maintain original order
      return 0;
    }).map(todo => ({
      ...todo,
      subtasks: todo.subtasks ? sortByPriority(todo.subtasks) : undefined
    }));
  };
  
  return sortByPriority(todos);
}

// Extract focus tasks as a flat list sorted by priority
export function extractFocusTasksFlat(todos: Todo[]): Todo[] {
  const focusTasks: Todo[] = [];
  
  function traverse(todoList: Todo[]) {
    for (const todo of todoList) {
      if (todo.focusPriority !== undefined) {
        // Keep original reference for proper state updates
        focusTasks.push(todo);
      }
      if (todo.subtasks && todo.subtasks.length > 0) {
        traverse(todo.subtasks);
      }
    }
  }
  
  traverse(todos);
  
  // Sort by focus priority
  return focusTasks.sort((a, b) => (a.focusPriority || 0) - (b.focusPriority || 0));
}

// Extract focus tasks with their full subtree (hierarchical)
export function extractFocusTasksWithSubtasks(todos: Todo[]): Todo[] {
  const result: Todo[] = [];
  
  function processLevel(todoList: Todo[]): Todo[] {
    const levelResult: Todo[] = [];
    
    for (const todo of todoList) {
      // If this todo is focused, include it with all its subtasks
      if (todo.focusPriority !== undefined) {
        levelResult.push({
          ...todo,
          // Include ALL subtasks regardless of their focus status
          subtasks: todo.subtasks
        });
      } else if (todo.subtasks && todo.subtasks.length > 0) {
        // If not focused, check if any subtask is focused
        const focusedSubtasks = processLevel(todo.subtasks);
        if (focusedSubtasks.length > 0) {
          // Include this todo but only with focused subtasks
          levelResult.push({
            ...todo,
            focusPriority: undefined, // Parent isn't directly focused
            subtasks: focusedSubtasks
          });
        }
      }
    }
    
    return levelResult;
  }
  
  const processed = processLevel(todos);
  
  // Sort by focus priority at the top level
  return processed.sort((a, b) => {
    const aPriority = a.focusPriority ?? Infinity;
    const bPriority = b.focusPriority ?? Infinity;
    
    if (aPriority !== Infinity && bPriority !== Infinity) {
      return aPriority - bPriority;
    }
    if (aPriority !== Infinity) return -1;
    if (bPriority !== Infinity) return 1;
    return 0;
  });
}

// Toggle focus priority for a todo
export function toggleFocusTodo(
  todos: Todo[],
  id: number,
  parentIds?: TodoPath
): Todo[] {
  const path = parentIds ? [...parentIds, id] : [id];
  const focusTodos = getFocusTodos(todos);
  
  // Find if this todo already has focus priority
  const existingFocus = focusTodos.find(ft => 
    ft.path[ft.path.length - 1] === id && 
    ft.path.slice(0, -1).every((pid, idx) => pid === (parentIds || [])[idx])
  );
  
  if (existingFocus) {
    // Remove focus priority
    const updatedTodos = updateTodoAtPath(todos, path, (todo) => ({
      ...todo,
      focusPriority: undefined,
    }));
    // Reorder remaining priorities
    return autoReorderFocusPriorities(updatedTodos);
  } else {
    // Add focus priority
    if (focusTodos.length >= 5) {
      console.warn('Maximum 5 focus tasks allowed');
      return todos;
    }
    
    const newPriority = focusTodos.length + 1;
    return updateTodoAtPath(todos, path, (todo) => ({
      ...todo,
      focusPriority: newPriority,
    }));
  }
}

// Auto reorder focus priorities when one is removed or completed
export function autoReorderFocusPriorities(todos: Todo[]): Todo[] {
  const focusTodos = getFocusTodos(todos);
  let updates: Array<{ path: TodoPath; updates: Partial<Todo> }> = [];
  
  // Remove focus priority from completed todos
  focusTodos.forEach(({ todo, path }) => {
    if (todo.completed) {
      updates.push({ path, updates: { focusPriority: undefined } });
    }
  });
  
  // Get remaining uncompleted focus todos
  const remainingFocus = focusTodos.filter(({ todo }) => !todo.completed);
  
  // Reorder priorities
  remainingFocus.forEach(({ path }, index) => {
    updates.push({ path, updates: { focusPriority: index + 1 } });
  });
  
  return batchUpdateTodos(todos, updates);
}

// Get count of todos completed today
export function getTodayCompletedCount(todos: Todo[]): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTime = today.getTime();
  
  let count = 0;
  
  function traverse(todoList: Todo[]) {
    for (const todo of todoList) {
      if (todo.completed && todo.completedAt) {
        const completedDate = new Date(todo.completedAt);
        completedDate.setHours(0, 0, 0, 0);
        if (completedDate.getTime() === todayTime) {
          count++;
        }
      }
      if (todo.subtasks && todo.subtasks.length > 0) {
        traverse(todo.subtasks);
      }
    }
  }
  
  traverse(todos);
  return count;
}
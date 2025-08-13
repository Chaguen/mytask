import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Todo, RecurringPattern, Difficulty } from '@/types/todo';
import { TodoPath, MAX_TODO_DEPTH } from '@/types/todo-tree';
import { useTodoAPI } from './useTodoAPI';
import { useExpandedState } from './useExpandedState';
import { 
  createTodo, 
  toggleTodoCompletion, 
  deleteTodoFromList,
  addSubtaskToTodo,
  addSiblingTodo,
  updateParentCompletion,
  updateTodoText,
  updateTodoDueDate,
  setTodoEditing,
  copyTodoInList,
  getProjectPath,
  reorderTodos,
  getParentIdsToCollapse,
  toggleFocusTodo,
  getFocusTodos,
  autoReorderFocusPriorities,
  sortTodosByFocusPriority,
  extractFocusTasksFlat,
  extractFocusTasksWithSubtasks,
  getTodayCompletedCount
} from '@/utils/todo-helpers';
import { findTodoByPath, updateTodoAtPath } from '@/utils/todo-tree-utils';
import { DEBOUNCE_DELAY } from '@/constants/todo';
import { getMaxDepth, countTodos } from '@/utils/todo-tree-utils';
import { parseRecurringText, generateNextRecurrence, createRecurringInstance, shouldShowInTodayView } from '@/utils/recurring-utils';
import { format } from 'date-fns';

export type ViewMode = 'all' | 'today';

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [subtaskInputs, setSubtaskInputs] = useState<{ [key: number]: string }>({});
  const [showCompleted, setShowCompleted] = useState<boolean>(true);
  const [showOnlyFocusTasks, setShowOnlyFocusTasks] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const { loading, error, loadTodos, saveTodos } = useTodoAPI();
  const { expandedTodos, toggleExpanded, expand, collapse, isExpanded } = useExpandedState();
  
  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Memoized focus todos
  const focusTodos = useMemo(() => {
    return getFocusTodos(todos);
  }, [todos]);

  // Memoized visible todos (filter out completed top-level todos if showCompleted is false)
  const visibleTodos = useMemo(() => {
    let filtered = todos;
    
    // Filter by view mode (today view)
    if (viewMode === 'today') {
      filtered = filtered.filter(todo => shouldShowInTodayView(todo, viewMode));
    }
    
    // Filter by completion status
    if (!showCompleted) {
      filtered = filtered.filter(todo => !todo.completed);
    }
    
    // Filter by focus tasks
    if (showOnlyFocusTasks) {
      // Extract focus tasks with their full subtree (hierarchical)
      return extractFocusTasksWithSubtasks(filtered);
    }
    
    return filtered;
  }, [todos, showCompleted, showOnlyFocusTasks, focusTodos, viewMode]);

  // Memoized stats (calculate from all todos, not just visible)
  const todoStats = useMemo(() => {
    const totalCompleted = countTodos(todos, (todo) => todo.completed);
    const visibleCompleted = countTodos(visibleTodos, (todo) => todo.completed);
    const hiddenCount = totalCompleted - visibleCompleted;
    const todayCompleted = getTodayCompletedCount(todos);
    
    return {
      total: countTodos(todos),
      completed: totalCompleted,
      visibleCompleted,
      hiddenCount,
      focusTasksCount: focusTodos.length,
      maxDepth: getMaxDepth(todos),
      todayCompleted,
    };
  }, [todos, visibleTodos, focusTodos]);

  // Load todos on mount and clean old completed todos
  useEffect(() => {
    const initTodos = async () => {
      const loadedTodos = await loadTodos();
      
      // Auto-clean completed todos older than 3 days
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      
      const cleanOldCompleted = (todoList: Todo[]): Todo[] => {
        return todoList
          .filter(todo => {
            // Keep if not completed or completed within 3 days
            if (!todo.completed || !todo.completedAt) return true;
            const completedDate = new Date(todo.completedAt);
            return completedDate > threeDaysAgo;
          })
          .map(todo => ({
            ...todo,
            subtasks: todo.subtasks ? cleanOldCompleted(todo.subtasks) : undefined,
          }));
      };
      
      const cleanedTodos = cleanOldCompleted(loadedTodos);
      setTodos(cleanedTodos);
      
      // Save cleaned todos if anything was removed
      if (JSON.stringify(cleanedTodos) !== JSON.stringify(loadedTodos)) {
        saveTodos(cleanedTodos);
      }
    };
    initTodos();
  }, [loadTodos, saveTodos]);

  // Load showCompleted from localStorage after mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('showCompleted');
      if (saved !== null) {
        setShowCompleted(JSON.parse(saved));
      }
    }
  }, []);

  // Load showOnlyFocusTasks from localStorage after mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('showOnlyFocusTasks');
      if (saved !== null) {
        setShowOnlyFocusTasks(JSON.parse(saved));
      }
    }
  }, []);

  // Debounced save
  const debouncedSave = useCallback((newTodos: Todo[]) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      saveTodos(newTodos);
    }, DEBOUNCE_DELAY);
  }, [saveTodos]);

  const addTodo = useCallback(() => {
    if (inputValue.trim()) {
      const { cleanText, pattern } = parseRecurringText(inputValue.trim());
      const newTodo = createTodo(cleanText);
      
      if (pattern) {
        newTodo.recurringPattern = pattern;
        newTodo.isRecurring = true;
        newTodo.dueDate = pattern.nextDueDate || format(new Date(), 'yyyy-MM-dd');
      }
      
      const newTodos = [...todos, newTodo];
      setTodos(newTodos);
      setInputValue('');
      debouncedSave(newTodos);
    }
  }, [inputValue, todos, debouncedSave]);

  const toggleTodo = useCallback((id: number, parentIds?: TodoPath) => {
    let newTodos = toggleTodoCompletion(todos, id, parentIds);
    
    // Check if this is a recurring task being completed
    const result = findTodoByPath(newTodos, parentIds ? [...parentIds, id] : [id]);
    const todo = result.value;
    if (todo && todo.completed && todo.recurringPattern && !todo.parentRecurringId) {
      // Generate next instance
      const nextDueDate = generateNextRecurrence(todo.recurringPattern);
      const nextInstance = createRecurringInstance(todo, nextDueDate);
      
      // Update the recurring pattern for next time
      nextInstance.recurringPattern = {
        ...todo.recurringPattern,
        nextDueDate,
      };
      
      // Add the new instance to the list
      newTodos = [...newTodos, nextInstance];
    }
    
    // Update parent completion if this is a subtask
    if (parentIds && parentIds.length > 0) {
      const fullPath = [...parentIds, id];
      newTodos = updateParentCompletion(newTodos, fullPath);
      
      // Auto-collapse completed parent todos
      const idsToCollapse = getParentIdsToCollapse(newTodos, parentIds);
      idsToCollapse.forEach(parentId => collapse(parentId));
    }
    
    // Auto-reorder focus priorities if a focus task was completed
    newTodos = autoReorderFocusPriorities(newTodos);
    
    setTodos(newTodos);
    debouncedSave(newTodos);
  }, [todos, debouncedSave, collapse]);

  const deleteTodo = useCallback((id: number, parentIds?: TodoPath) => {
    let newTodos = deleteTodoFromList(todos, id, parentIds);
    
    // Update parent completion if this was a subtask
    if (parentIds && parentIds.length > 0) {
      newTodos = updateParentCompletion(newTodos, parentIds);
    }
    
    setTodos(newTodos);
    debouncedSave(newTodos);
  }, [todos, debouncedSave]);

  const addSubtask = useCallback((parentIds: TodoPath) => {
    // Check depth limit
    if (parentIds.length >= MAX_TODO_DEPTH) {
      console.warn(`Maximum nesting depth (${MAX_TODO_DEPTH}) reached`);
      return;
    }

    // Create subtask with default text "하위 할 일" and start editing
    const newTodos = addSubtaskToTodo(todos, parentIds, "하위 할 일", true);
    setTodos(newTodos);
    
    // Expand parent to show the new subtask
    const parentId = parentIds[parentIds.length - 1];
    expand(parentId);
    debouncedSave(newTodos);
  }, [todos, expand, debouncedSave]);

  const addSibling = useCallback((id: number, parentIds?: TodoPath) => {
    // Check depth limit for new sibling at same level
    if (parentIds && parentIds.length >= MAX_TODO_DEPTH) {
      console.warn(`Maximum nesting depth (${MAX_TODO_DEPTH}) reached`);
      return;
    }

    const newTodos = addSiblingTodo(todos, id, parentIds, '', true);
    setTodos(newTodos);
    
    // If adding sibling to a subtask, ensure parent is expanded
    if (parentIds && parentIds.length > 0) {
      const parentId = parentIds[parentIds.length - 1];
      expand(parentId);
    }
    
    debouncedSave(newTodos);
  }, [todos, expand, debouncedSave]);

  const setSubtaskInput = useCallback((parentId: number, value: string) => {
    setSubtaskInputs(prev => ({ ...prev, [parentId]: value }));
  }, []);

  // Clear all completed todos
  const updateTodoTextHandler = useCallback((id: number, newText: string, parentIds?: TodoPath) => {
    // If text is empty, delete the todo instead
    if (!newText.trim()) {
      deleteTodo(id, parentIds);
      return;
    }
    
    let newTodos = updateTodoText(todos, id, newText, parentIds);
    // Also set isEditing to false when updating text
    newTodos = setTodoEditing(newTodos, id, false, parentIds);
    setTodos(newTodos);
    debouncedSave(newTodos);
  }, [todos, debouncedSave, deleteTodo]);

  const setTodoEditingHandler = useCallback((id: number, isEditing: boolean, parentIds?: TodoPath) => {
    const newTodos = setTodoEditing(todos, id, isEditing, parentIds);
    setTodos(newTodos);
  }, [todos]);

  const updateTodoDueDateHandler = useCallback((id: number, dueDate: string | undefined, parentIds?: TodoPath) => {
    const newTodos = updateTodoDueDate(todos, id, dueDate, parentIds);
    setTodos(newTodos);
    debouncedSave(newTodos);
  }, [todos, debouncedSave]);

  const updateRecurringHandler = useCallback((id: number, pattern: RecurringPattern | undefined, parentIds?: TodoPath) => {
    const result = findTodoByPath(todos, parentIds ? [...parentIds, id] : [id]);
    const todo = result.value;
    
    if (!todo) return;
    
    // Update the todo with the new recurring pattern
    const updateTodo = (todoList: Todo[]): Todo[] => {
      return todoList.map(t => {
        if (t.id === id) {
          if (pattern) {
            // Setting recurring pattern
            return {
              ...t,
              recurringPattern: pattern,
              isRecurring: true,
              dueDate: pattern.nextDueDate || t.dueDate,
            };
          } else {
            // Removing recurring pattern
            const { recurringPattern, isRecurring, parentRecurringId, ...rest } = t;
            return rest;
          }
        }
        if (t.subtasks) {
          return {
            ...t,
            subtasks: updateTodo(t.subtasks),
          };
        }
        return t;
      });
    };
    
    const newTodos = parentIds && parentIds.length > 0
      ? (updateTodoAtPath(todos, parentIds, parent => ({
          ...parent,
          subtasks: updateTodo(parent.subtasks || []),
        })).value || todos)
      : updateTodo(todos);
    
    setTodos(newTodos);
    debouncedSave(newTodos);
  }, [todos, debouncedSave]);

  const updateDifficultyHandler = useCallback((id: number, difficulty: Difficulty | undefined, parentIds?: TodoPath) => {
    // Simple recursive update that works for all levels
    const updateTodo = (todoList: Todo[]): Todo[] => {
      return todoList.map(t => {
        if (t.id === id) {
          return { ...t, difficulty };
        }
        if (t.subtasks) {
          return {
            ...t,
            subtasks: updateTodo(t.subtasks),
          };
        }
        return t;
      });
    };
    
    // Always use the simple recursive approach
    const newTodos = updateTodo(todos);
    
    setTodos(newTodos);
    debouncedSave(newTodos);
  }, [todos, debouncedSave]);

  const clearCompleted = useCallback(() => {
    const filterCompleted = (todoList: Todo[]): Todo[] => {
      return todoList
        .filter(todo => !todo.completed)
        .map(todo => ({
          ...todo,
          subtasks: todo.subtasks ? filterCompleted(todo.subtasks) : undefined,
        }));
    };
    
    const newTodos = filterCompleted(todos);
    setTodos(newTodos);
    debouncedSave(newTodos);
  }, [todos, debouncedSave]);

  const copyTodo = useCallback((id: number, parentIds?: TodoPath) => {
    const newTodos = copyTodoInList(todos, id, parentIds);
    setTodos(newTodos);
    debouncedSave(newTodos);
  }, [todos, debouncedSave]);

  const toggleShowCompleted = useCallback(() => {
    setShowCompleted(prev => !prev);
  }, []);

  const toggleShowOnlyFocusTasks = useCallback(() => {
    setShowOnlyFocusTasks(prev => !prev);
  }, []);

  const toggleFocusTodoHandler = useCallback((id: number, parentIds?: TodoPath) => {
    const newTodos = toggleFocusTodo(todos, id, parentIds);
    setTodos(newTodos);
    debouncedSave(newTodos);
  }, [todos, debouncedSave]);

  const reorderTodosHandler = useCallback((activeId: number, overId: number, parentIds?: TodoPath) => {
    const newTodos = reorderTodos(todos, activeId, overId, parentIds);
    setTodos(newTodos);
    debouncedSave(newTodos);
  }, [todos, debouncedSave]);

  // Save showCompleted to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('showCompleted', JSON.stringify(showCompleted));
    }
  }, [showCompleted]);

  // Save showOnlyFocusTasks to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('showOnlyFocusTasks', JSON.stringify(showOnlyFocusTasks));
    }
  }, [showOnlyFocusTasks]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const toggleViewMode = useCallback(() => {
    setViewMode(prev => prev === 'all' ? 'today' : 'all');
  }, []);

  return {
    todos,
    visibleTodos,
    loading,
    error,
    inputValue,
    setInputValue,
    subtaskInputs,
    setSubtaskInput,
    expandedTodos,
    isExpanded,
    toggleExpanded,
    addTodo,
    toggleTodo,
    deleteTodo,
    addSubtask,
    addSibling,
    updateTodoText: updateTodoTextHandler,
    updateTodoDueDate: updateTodoDueDateHandler,
    updateRecurring: updateRecurringHandler,
    updateDifficulty: updateDifficultyHandler,
    setTodoEditing: setTodoEditingHandler,
    clearCompleted,
    copyTodo,
    showCompleted,
    toggleShowCompleted,
    showOnlyFocusTasks,
    toggleShowOnlyFocusTasks,
    toggleFocusTodo: toggleFocusTodoHandler,
    focusTodos,
    getProjectPath,
    reorderTodos: reorderTodosHandler,
    stats: todoStats,
    viewMode,
    setViewMode,
    toggleViewMode,
  };
}
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Todo } from '@/types/todo';
import { TodoPath, MAX_TODO_DEPTH } from '@/types/todo-tree';
import { useTodoAPI } from './useTodoAPI';
import { useExpandedState } from './useExpandedState';
import { 
  createTodo, 
  toggleTodoCompletion, 
  deleteTodoFromList,
  addSubtaskToTodo,
  updateParentCompletion,
  updateTodoText,
  setTodoEditing,
  copyTodoInList,
  getAllNextActions,
  isNextAction,
  getProjectPath,
  reorderTodos,
  getParentIdsToCollapse
} from '@/utils/todo-helpers';
import { findTodoByPath } from '@/utils/todo-tree-utils';
import { DEBOUNCE_DELAY } from '@/constants/todo';
import { getMaxDepth, countTodos } from '@/utils/todo-tree-utils';

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [subtaskInputs, setSubtaskInputs] = useState<{ [key: number]: string }>({});
  const [showCompleted, setShowCompleted] = useState<boolean>(true);
  const [showOnlyNextActions, setShowOnlyNextActions] = useState<boolean>(false);
  const { loading, error, loadTodos, saveTodos } = useTodoAPI();
  const { expandedTodos, toggleExpanded, expand, collapse, isExpanded } = useExpandedState();
  
  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Memoized next actions
  const nextActions = useMemo(() => {
    return getAllNextActions(todos);
  }, [todos]);

  // Memoized visible todos (filter out completed top-level todos if showCompleted is false)
  const visibleTodos = useMemo(() => {
    let filtered = todos;
    
    // Filter by completion status
    if (!showCompleted) {
      filtered = filtered.filter(todo => !todo.completed);
    }
    
    // Filter by next actions
    if (showOnlyNextActions) {
      const nextActionIds = new Set(nextActions.map(na => na.todo.id));
      // Include todos that are next actions or contain next actions
      filtered = filtered.filter(todo => {
        if (nextActionIds.has(todo.id)) return true;
        // Check if this todo contains any next actions
        const todoNextActions = getAllNextActions([todo]);
        return todoNextActions.length > 0;
      });
    }
    
    return filtered;
  }, [todos, showCompleted, showOnlyNextActions, nextActions]);

  // Memoized stats (calculate from all todos, not just visible)
  const todoStats = useMemo(() => {
    const totalCompleted = countTodos(todos, (todo) => todo.completed);
    const visibleCompleted = countTodos(visibleTodos, (todo) => todo.completed);
    const hiddenCount = totalCompleted - visibleCompleted;
    
    return {
      total: countTodos(todos),
      completed: totalCompleted,
      visibleCompleted,
      hiddenCount,
      nextActionsCount: nextActions.length,
      maxDepth: getMaxDepth(todos),
    };
  }, [todos, visibleTodos, nextActions]);

  // Load todos on mount
  useEffect(() => {
    const initTodos = async () => {
      const loadedTodos = await loadTodos();
      setTodos(loadedTodos);
    };
    initTodos();
  }, [loadTodos]);

  // Load showCompleted from localStorage after mount
  useEffect(() => {
    const saved = localStorage.getItem('showCompleted');
    if (saved !== null) {
      setShowCompleted(JSON.parse(saved));
    }
  }, []);

  // Load showOnlyNextActions from localStorage after mount
  useEffect(() => {
    const saved = localStorage.getItem('showOnlyNextActions');
    if (saved !== null) {
      setShowOnlyNextActions(JSON.parse(saved));
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
      const newTodo = createTodo(inputValue);
      const newTodos = [...todos, newTodo];
      setTodos(newTodos);
      setInputValue('');
      debouncedSave(newTodos);
    }
  }, [inputValue, todos, debouncedSave]);

  const toggleTodo = useCallback((id: number, parentIds?: TodoPath) => {
    let newTodos = toggleTodoCompletion(todos, id, parentIds);
    
    // Update parent completion if this is a subtask
    if (parentIds && parentIds.length > 0) {
      const fullPath = [...parentIds, id];
      newTodos = updateParentCompletion(newTodos, fullPath);
      
      // Auto-collapse completed parent todos
      const idsToCollapse = getParentIdsToCollapse(newTodos, parentIds);
      idsToCollapse.forEach(parentId => collapse(parentId));
    }
    
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

  const toggleShowOnlyNextActions = useCallback(() => {
    setShowOnlyNextActions(prev => !prev);
  }, []);

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

  // Save showOnlyNextActions to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('showOnlyNextActions', JSON.stringify(showOnlyNextActions));
    }
  }, [showOnlyNextActions]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
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
    updateTodoText: updateTodoTextHandler,
    setTodoEditing: setTodoEditingHandler,
    clearCompleted,
    copyTodo,
    showCompleted,
    toggleShowCompleted,
    showOnlyNextActions,
    toggleShowOnlyNextActions,
    nextActions,
    isNextAction,
    getProjectPath,
    reorderTodos: reorderTodosHandler,
    stats: todoStats,
  };
}
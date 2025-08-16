"use client";

import React, { createContext, useContext } from 'react';
import { useTodos, ViewMode } from '@/hooks/useTodos';
import { Todo, RecurringPattern, Difficulty } from '@/types/todo';
import { TodoPath } from '@/types/todo-tree';

interface TodoContextType {
  todos: Todo[];
  visibleTodos: Todo[];
  loading: boolean;
  error: string | null;
  inputValue: string;
  setInputValue: (value: string) => void;
  subtaskInputs: { [key: number]: string };
  setSubtaskInput: (parentId: number, value: string) => void;
  expandedTodos: Set<number>;
  isExpanded: (id: number) => boolean;
  toggleExpanded: (id: number) => void;
  expandAll: () => void;
  collapseAll: () => void;
  addTodo: () => void;
  toggleTodo: (id: number, parentIds?: TodoPath) => void;
  deleteTodo: (id: number, parentIds?: TodoPath) => void;
  addSubtask: (parentIds: TodoPath) => void;
  addSibling: (id: number, parentIds?: TodoPath) => void;
  updateTodoText: (id: number, text: string, parentIds?: TodoPath) => void;
  updateTodoDueDate: (id: number, dueDate: string | undefined, parentIds?: TodoPath) => void;
  updateRecurring: (id: number, pattern: RecurringPattern | undefined, parentIds?: TodoPath) => void;
  updateDifficulty: (id: number, difficulty: Difficulty | undefined, parentIds?: TodoPath) => void;
  setTodoEditing: (id: number, isEditing: boolean, parentIds?: TodoPath) => void;
  clearCompleted: () => void;
  copyTodo: (id: number, parentIds?: TodoPath) => void;
  showCompleted: boolean;
  toggleShowCompleted: () => void;
  showOnlyFocusTasks: boolean;
  toggleShowOnlyFocusTasks: () => void;
  toggleFocusTodo: (id: number, parentIds?: TodoPath) => void;
  focusTodos: Array<{ todo: Todo; path: TodoPath }>;
  getProjectPath: (todos: Todo[], path: TodoPath) => string[];
  reorderTodos: (activeId: number, overId: number, parentIds?: TodoPath) => void;
  stats: {
    total: number;
    completed: number;
    visibleCompleted: number;
    hiddenCount: number;
    focusTasksCount: number;
    maxDepth: number;
    todayCompleted: number;
  };
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  toggleViewMode: () => void;
}

const TodoContext = createContext<TodoContextType | undefined>(undefined);

export function TodoProvider({ children }: { children: React.ReactNode }) {
  const todoData = useTodos();

  return (
    <TodoContext.Provider value={todoData}>
      {children}
    </TodoContext.Provider>
  );
}

export function useTodoContext() {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error('useTodoContext must be used within a TodoProvider');
  }
  return context;
}
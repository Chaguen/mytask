"use client";

import React, { createContext, useContext } from 'react';
import { useTodos } from '@/hooks/useTodos';
import { Todo } from '@/types/todo';
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
  addTodo: () => void;
  toggleTodo: (id: number, parentIds?: TodoPath) => void;
  deleteTodo: (id: number, parentIds?: TodoPath) => void;
  addSubtask: (parentIds: TodoPath) => void;
  updateTodoText: (id: number, text: string, parentIds?: TodoPath) => void;
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
}

const TodoContext = createContext<TodoContextType | undefined>(undefined);

export function TodoProvider({ children }: { children: React.ReactNode }) {
  console.log('[TodoProvider] Starting render');
  console.log('[TodoProvider] Calling useTodos');
  const todoData = useTodos();
  console.log('[TodoProvider] useTodos completed');

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
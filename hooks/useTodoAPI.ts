import { useState, useCallback } from 'react';
import { Todo } from '@/types/todo';
import { todoAPI } from '@/lib/api-client';

export function useTodoAPI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTodos = useCallback(async (): Promise<Todo[]> => {
    setLoading(true);
    setError(null);
    try {
      const todos = await todoAPI.getTodos();
      return todos;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load todos');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const saveTodos = useCallback(async (todos: Todo[]): Promise<boolean> => {
    setError(null);
    try {
      await todoAPI.saveTodos(todos);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save todos');
      return false;
    }
  }, []);

  return {
    loading,
    error,
    loadTodos,
    saveTodos,
  };
}
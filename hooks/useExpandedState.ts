import { useState, useCallback } from 'react';

export function useExpandedState() {
  const [expandedTodos, setExpandedTodos] = useState<Set<number>>(new Set());

  const toggleExpanded = useCallback((id: number) => {
    setExpandedTodos((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const expand = useCallback((id: number) => {
    setExpandedTodos((prev) => new Set([...prev, id]));
  }, []);

  const collapse = useCallback((id: number) => {
    setExpandedTodos((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }, []);

  const isExpanded = useCallback((id: number) => {
    return expandedTodos.has(id);
  }, [expandedTodos]);

  return {
    expandedTodos,
    toggleExpanded,
    expand,
    collapse,
    isExpanded,
  };
}
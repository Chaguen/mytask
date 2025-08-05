import { useMemo } from 'react';
import { NESTING_INDENT_CLASSES, NESTING_TEXT_SIZES, MAX_NESTING_DEPTH } from '@/constants/todo';

interface NestingStyles {
  marginClass: string;
  textSizeClass: string;
  canAddSubtask: boolean;
}

export function useTodoNesting(level: number): NestingStyles {
  return useMemo(() => {
    const clampedLevel = Math.min(level, NESTING_INDENT_CLASSES.length - 1);
    
    return {
      marginClass: NESTING_INDENT_CLASSES[clampedLevel],
      textSizeClass: NESTING_TEXT_SIZES[clampedLevel as keyof typeof NESTING_TEXT_SIZES] || NESTING_TEXT_SIZES[4],
      canAddSubtask: level < MAX_NESTING_DEPTH
    };
  }, [level]);
}

export function useSubtaskStats(subtasks: any[] | undefined) {
  return useMemo(() => {
    if (!subtasks || subtasks.length === 0) {
      return { hasSubtasks: false, completed: 0, total: 0 };
    }
    
    const completed = subtasks.filter(st => st.completed).length;
    return {
      hasSubtasks: true,
      completed,
      total: subtasks.length
    };
  }, [subtasks]);
}
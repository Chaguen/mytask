import { useMemo } from 'react';
import { DEFAULT_MARGIN_STEP } from '@/types/todo-tree';

interface TodoStyleOptions {
  level: number;
  isCompleted: boolean;
  hasSubtasks: boolean;
  isExpanded: boolean;
}

export function useTodoStyles(options: TodoStyleOptions) {
  const { level, isCompleted, hasSubtasks, isExpanded } = options;

  const styles = useMemo(() => {
    // Margin classes for indentation
    const marginClasses = [
      '',           // level 0
      'ml-8',       // level 1
      'ml-16',      // level 2
      'ml-24',      // level 3
      'ml-32',      // level 4+
    ];
    
    const containerMargin = marginClasses[Math.min(level, 4)];
    const inputMargin = marginClasses[Math.min(level + 1, 4)];
    
    // Text size based on level
    const textSize = level > 0 ? 'text-sm' : '';
    
    // Text style based on completion
    const textStyle = isCompleted 
      ? 'line-through text-muted-foreground' 
      : '';
    
    // Icon classes
    const expandIconClass = isExpanded 
      ? 'rotate-90 transition-transform' 
      : 'transition-transform';
    
    // Button visibility
    const showExpandButton = hasSubtasks;
    const showPlaceholder = !hasSubtasks;
    
    return {
      container: {
        className: containerMargin,
      },
      todoItem: {
        className: `flex items-center gap-2 p-2 rounded hover:bg-muted/50 ${textSize}`,
      },
      text: {
        className: `flex-1 ${textStyle}`,
      },
      expandIcon: {
        className: expandIconClass,
      },
      inputContainer: {
        className: `${inputMargin} mt-2 mb-2`,
      },
      showExpandButton,
      showPlaceholder,
    };
  }, [level, isCompleted, hasSubtasks, isExpanded]);

  return styles;
}

// Hook for managing keyboard shortcuts
export function useTodoKeyboardShortcuts({
  onAddTodo,
  onToggleExpand,
  onDelete,
}: {
  onAddTodo?: () => void;
  onToggleExpand?: () => void;
  onDelete?: () => void;
}) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ctrl/Cmd + Enter to add subtask
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && onAddTodo) {
      e.preventDefault();
      onAddTodo();
    }
    
    // Space to toggle expand (when not in input)
    if (e.key === ' ' && e.target instanceof HTMLElement && 
        e.target.tagName !== 'INPUT' && onToggleExpand) {
      e.preventDefault();
      onToggleExpand();
    }
    
    // Delete key to delete todo
    if (e.key === 'Delete' && e.target instanceof HTMLElement && 
        e.target.tagName !== 'INPUT' && onDelete) {
      e.preventDefault();
      onDelete();
    }
  };

  return { handleKeyDown };
}
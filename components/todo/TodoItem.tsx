"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Plus, ChevronRight, Copy, Check, Star } from "lucide-react";
import { Todo } from "@/types/todo";
import { TodoPath } from "@/types/todo-tree";
import { EditableTodoText } from "./EditableTodoText";
import { useTodoStyles, useTodoKeyboardShortcuts } from "@/hooks/useTodoStyles";
import { formatCompletionTime, getFullDateTime } from "@/utils/date-helpers";
import { motion, AnimatePresence } from "framer-motion";

interface TodoItemProps {
  todo: Todo;
  level?: number;
  parentIds?: TodoPath;
  parentTodo?: Todo;
  isExpanded?: boolean;
  isInFocusMode?: boolean;
  projectPath?: string[];
  showProjectPath?: boolean;
  showFocusPath?: boolean;
  onToggle: (id: number, parentIds?: TodoPath) => void;
  onDelete: (id: number, parentIds?: TodoPath) => void;
  onCopy: (id: number, parentIds?: TodoPath) => void;
  onToggleFocus?: (id: number, parentIds?: TodoPath) => void;
  onExpand?: (id: number) => void;
  onAddSubtask?: () => void;
  onUpdateText: (id: number, text: string, parentIds?: TodoPath) => void;
  onSetEditing: (id: number, isEditing: boolean, parentIds?: TodoPath) => void;
  renderSubtask?: (parentTodo: Todo, parentIds: TodoPath) => React.ReactNode;
}

function TodoItemComponent({
  todo,
  level = 0,
  parentIds = [],
  isExpanded = false,
  isInFocusMode = false,
  projectPath,
  showProjectPath = false,
  showFocusPath = false,
  onToggle,
  onDelete,
  onCopy,
  onToggleFocus,
  onExpand,
  onAddSubtask,
  onUpdateText,
  onSetEditing,
  renderSubtask,
}: TodoItemProps) {
  // All hooks must be called unconditionally at the top
  const [showCelebration, setShowCelebration] = useState(false);
  const [isChecked, setIsChecked] = useState(todo.completed);
  
  // Computed values after hooks
  const hasSubtasks = todo.subtasks && todo.subtasks.length > 0;
  const completedSubtasks = todo.subtasks?.filter(st => st.completed).length || 0;
  const totalSubtasks = todo.subtasks?.length || 0;

  const styles = useTodoStyles({
    level,
    isCompleted: todo.completed,
    hasSubtasks: !!hasSubtasks,
    isExpanded,
  });

  const { handleKeyDown } = useTodoKeyboardShortcuts({
    onAddTodo: onAddSubtask,
    onToggleExpand: onExpand ? () => onExpand(todo.id) : undefined,
    onDelete: () => onDelete(todo.id, parentIds),
  });

  const handleExpandClick = () => {
    if (onExpand) {
      onExpand(todo.id);
    }
  };

  const handleAddClick = () => {
    if (onAddSubtask) {
      onAddSubtask();
    }
  };

  useEffect(() => {
    setIsChecked(todo.completed);
  }, [todo.completed]);

  const handleCheckboxChange = () => {
    const newCheckedState = !isChecked;
    setIsChecked(newCheckedState);
    
    if (newCheckedState && !hasSubtasks) {
      // Show celebration for tasks without subtasks
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 1500);
    }
    
    onToggle(todo.id, parentIds);
  };

  // Determine focus mode styling
  const getFocusModeStyle = () => {
    if (!isInFocusMode) return '';
    if (todo.focusPriority !== undefined) {
      // Directly selected for focus (darker background)
      return 'bg-yellow-50 dark:bg-yellow-950/30 border-l-4 border-yellow-400';
    }
    // Auto-included subtask (lighter background)
    return 'bg-yellow-50/50 dark:bg-yellow-950/15';
  };

  return (
    <motion.div 
      className={`${styles.container.className} ${getFocusModeStyle()}`} 
      onKeyDown={handleKeyDown}
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
    >
      {showProjectPath && projectPath && projectPath.length > 1 && (
        <div className="text-xs text-muted-foreground mb-1 ml-6">
          {projectPath.slice(0, -1).join(' > ')}
        </div>
      )}
      <motion.div 
        className={styles.todoItem.className}
        animate={{
          scale: showCelebration ? [1, 1.05, 1] : 1,
          backgroundColor: showCelebration ? ["transparent", "rgba(34, 197, 94, 0.1)", "transparent"] : "transparent"
        }}
        transition={{ duration: 0.5 }}
      >
        {styles.showExpandButton && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleExpandClick}
            className="h-6 w-6"
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            <ChevronRight className={`h-4 w-4 ${styles.expandIcon.className}`} />
          </Button>
        )}
        {styles.showPlaceholder && <div className="w-6" />}
        
        <Checkbox
          checked={isChecked}
          onCheckedChange={handleCheckboxChange}
          aria-label={`Mark "${todo.text}" as ${todo.completed ? 'incomplete' : 'complete'}`}
          className="transition-colors duration-200"
        />
        
        {todo.focusPriority && (
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold ml-2">
            {todo.focusPriority}
          </span>
        )}
        
        <motion.div 
          className={styles.text.className}
          animate={{
            opacity: isChecked ? 0.5 : 1,
            x: isChecked ? 5 : 0
          }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <EditableTodoText
                text={todo.text}
                isEditing={todo.isEditing || false}
                isCompleted={isChecked}
                onTextChange={(newText) => onUpdateText(todo.id, newText, parentIds)}
                onEditStart={() => onSetEditing(todo.id, true, parentIds)}
                onEditEnd={() => onSetEditing(todo.id, false, parentIds)}
              />
            </div>
            {todo.completed && todo.completedAt && (
              <div className="flex items-center gap-1 ml-6 mt-1">
                <Check className="h-3 w-3 text-muted-foreground" />
                <span 
                  className="text-xs text-muted-foreground"
                  title={getFullDateTime(todo.completedAt)}
                >
                  {formatCompletionTime(todo.completedAt)}
                </span>
              </div>
            )}
            {showFocusPath && projectPath && projectPath.length > 1 && todo.focusPriority && (
              <div className="text-xs text-muted-foreground ml-6 mt-1">
                경로: {projectPath.slice(0, -1).join(' > ')}
              </div>
            )}
          </div>
          {hasSubtasks && (
            <span className="text-xs text-muted-foreground ml-2">
              ({completedSubtasks}/{totalSubtasks} 완료)
            </span>
          )}
        </motion.div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={handleAddClick}
          className="h-8 w-8"
          aria-label="Add subtask"
        >
          <Plus className="h-4 w-4" />
        </Button>
        
        {onToggleFocus && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggleFocus(todo.id, parentIds)}
            className={`h-8 w-8 ${todo.focusPriority ? 'text-yellow-500' : ''}`}
            aria-label={todo.focusPriority ? `Remove from focus (priority ${todo.focusPriority})` : 'Add to focus tasks'}
          >
            <Star className={`h-4 w-4 ${todo.focusPriority ? 'fill-yellow-500' : ''}`} />
          </Button>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onCopy(todo.id, parentIds)}
          className="h-8 w-8"
          aria-label={`Copy "${todo.text}"`}
        >
          <Copy className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(todo.id, parentIds)}
          className="h-8 w-8"
          aria-label={`Delete "${todo.text}"`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </motion.div>
      
      <AnimatePresence>
        {isExpanded && renderSubtask && todo.subtasks && todo.subtasks.length > 0 && (
          <motion.div 
            className="ml-6"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {renderSubtask(todo, [...parentIds, todo.id])}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Memoized component with custom comparison
export const TodoItem = React.memo(TodoItemComponent);
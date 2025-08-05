"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Plus, ChevronRight, Copy, Check, Star } from "lucide-react";
import { Todo } from "@/types/todo";
import { TodoPath } from "@/types/todo-tree";
import { EditableTodoText } from "./EditableTodoText";
import { useTodoStyles, useTodoKeyboardShortcuts } from "@/hooks/useTodoStyles";
import { formatCompletionTime, getFullDateTime } from "@/utils/date-helpers";

interface TodoItemProps {
  todo: Todo;
  level?: number;
  parentIds?: TodoPath;
  parentTodo?: Todo;
  isExpanded?: boolean;
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
  isNextAction = false,
  hasNextAction = false,
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

  return (
    <div className={styles.container.className} onKeyDown={handleKeyDown}>
      {showProjectPath && projectPath && projectPath.length > 1 && (
        <div className="text-xs text-muted-foreground mb-1 ml-6">
          {projectPath.slice(0, -1).join(' > ')}
        </div>
      )}
      <div className={styles.todoItem.className}>
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
          checked={todo.completed}
          onCheckedChange={() => onToggle(todo.id, parentIds)}
          aria-label={`Mark "${todo.text}" as ${todo.completed ? 'incomplete' : 'complete'}`}
        />
        
        {todo.focusPriority && (
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold ml-2">
            {todo.focusPriority}
          </span>
        )}
        
        <div className={styles.text.className}>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <EditableTodoText
                text={todo.text}
                isEditing={todo.isEditing || false}
                isCompleted={todo.completed}
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
        </div>
        
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
      </div>
      
      {isExpanded && renderSubtask && todo.subtasks && todo.subtasks.length > 0 && (
        <div className="ml-6">
          {renderSubtask(todo, [...parentIds, todo.id])}
        </div>
      )}
    </div>
  );
}

// Memoized component with custom comparison
export const TodoItem = React.memo(TodoItemComponent);
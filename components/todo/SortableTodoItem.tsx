"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TodoItem } from "./TodoItem";
import { Todo, RecurringPattern } from "@/types/todo";
import { TodoPath } from "@/types/todo-tree";
import { GripVertical } from "lucide-react";

interface SortableTodoItemProps {
  todo: Todo;
  level?: number;
  parentIds?: TodoPath;
  parentTodo?: Todo;
  isExpanded?: boolean;
  isInFocusMode?: boolean;
  isNextAction?: boolean;
  hasNextAction?: boolean;
  projectPath?: string[];
  showProjectPath?: boolean;
  showFocusPath?: boolean;
  activeTimerId?: number;
  onToggle: (id: number, parentIds?: TodoPath) => void;
  onDelete: (id: number, parentIds?: TodoPath) => void;
  onCopy: (id: number, parentIds?: TodoPath) => void;
  onToggleFocus?: (id: number, parentIds?: TodoPath) => void;
  onExpand?: (id: number) => void;
  onAddSubtask?: () => void;
  onAddSibling?: (id: number, parentIds?: TodoPath) => void;
  onUpdateText: (id: number, text: string, parentIds?: TodoPath) => void;
  onUpdateDueDate?: (id: number, dueDate: string | undefined, parentIds?: TodoPath) => void;
  onUpdateRecurring?: (id: number, pattern: RecurringPattern | undefined, parentIds?: TodoPath) => void;
  onSetEditing: (id: number, isEditing: boolean, parentIds?: TodoPath) => void;
  onToggleTimer?: (id: number, text: string, parentIds?: TodoPath) => void;
  todoTimeSpent?: number;
  renderSubtask?: (parentTodo: Todo, parentIds: TodoPath) => React.ReactNode;
}

export function SortableTodoItem(props: SortableTodoItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: props.todo.id,
    data: {
      parentIds: props.parentIds,
      level: props.level,
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute left-0 top-2 -ml-6 p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
        title="Drag to reorder"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      
      <TodoItem {...props} />
    </div>
  );
}
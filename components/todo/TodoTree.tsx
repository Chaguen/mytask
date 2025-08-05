"use client";

import React from 'react';
import { Todo, TodoPath } from '@/types/todo';
import { TodoItem } from './TodoItem';

interface TodoTreeProps {
  todos: Todo[];
  level?: number;
  parentIds?: TodoPath;
  parentTodo?: Todo;
  expandedTodos: Set<number>;
  subtaskInputs: { [key: number]: string };
  onToggle: (id: number, parentIds?: TodoPath) => void;
  onDelete: (id: number, parentIds?: TodoPath) => void;
  onCopy: (id: number, parentIds?: TodoPath) => void;
  onExpand: (id: number) => void;
  onSubtaskInputChange: (parentId: number, value: string) => void;
  onAddSubtask: (parentIds: TodoPath) => void;
  onUpdateText: (id: number, text: string, parentIds?: TodoPath) => void;
  onSetEditing: (id: number, isEditing: boolean, parentIds?: TodoPath) => void;
  isNextAction: (todo: Todo, parentTodo?: Todo) => boolean;
  hasNextAction: (todo: Todo) => boolean;
  getProjectPath: (todos: Todo[], path: TodoPath) => string[];
  showOnlyNextActions: boolean;
}

export const TodoTree = React.memo(({
  todos,
  level = 0,
  parentIds = [],
  expandedTodos,
  subtaskInputs,
  onToggle,
  onDelete,
  onCopy,
  onExpand,
  onSubtaskInputChange,
  onAddSubtask,
  onUpdateText,
  onSetEditing,
}: TodoTreeProps) => {
  const renderTodo = (todo: Todo) => {
    const isExpanded = expandedTodos.has(todo.id);
    const currentPath = [...parentIds, todo.id];
    
    return (
      <TodoItem
        key={todo.id}
        todo={todo}
        level={level}
        parentIds={parentIds}
        isExpanded={isExpanded}
        onToggle={onToggle}
        onDelete={onDelete}
        onCopy={onCopy}
        onExpand={onExpand}
        onAddSubtask={() => onAddSubtask(currentPath)}
        onUpdateText={onUpdateText}
        onSetEditing={onSetEditing}
        renderSubtask={(subtask, newParentIds) => (
          <TodoTree
            key={subtask.id}
            todos={[subtask]}
            level={level + 1}
            parentIds={newParentIds}
            expandedTodos={expandedTodos}
            subtaskInputs={subtaskInputs}
            onToggle={onToggle}
            onDelete={onDelete}
            onCopy={onCopy}
            onExpand={onExpand}
            onSubtaskInputChange={onSubtaskInputChange}
            onAddSubtask={onAddSubtask}
            onUpdateText={onUpdateText}
            onSetEditing={onSetEditing}
          />
        )}
      />
    );
  };

  return (
    <>
      {todos.map(renderTodo)}
    </>
  );
});

TodoTree.displayName = 'TodoTree';
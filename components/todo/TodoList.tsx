"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { SortableTodoItem } from "./SortableTodoItem";
import { TodoInput } from "./TodoInput";
import { Button } from "@/components/ui/button";
import { useTodos } from "@/hooks/useTodos";
import { TodoPath, MAX_TODO_DEPTH } from "@/types/todo-tree";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Todo } from "@/types/todo";
import { Eye, EyeOff, Zap, Star } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useState } from "react";

function TodoListContent() {
  const {
    todos,
    visibleTodos,
    loading,
    error,
    inputValue,
    setInputValue,
    isExpanded,
    toggleExpanded,
    addTodo,
    toggleTodo,
    deleteTodo,
    addSubtask,
    updateTodoText,
    setTodoEditing,
    clearCompleted,
    copyTodo,
    showCompleted,
    toggleShowCompleted,
    showOnlyNextActions,
    toggleShowOnlyNextActions,
    showOnlyFocusTasks,
    toggleShowOnlyFocusTasks,
    toggleFocusTodo,
    nextActions,
    isNextAction,
    getProjectPath,
    reorderTodos,
    stats,
  } = useTodos();

  const [, setActiveId] = useState<number | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as number);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const activeData = active.data.current as { parentIds?: TodoPath };
      const overData = over.data.current as { parentIds?: TodoPath };
      
      // Only allow reordering within the same level
      const activeParents = activeData?.parentIds || [];
      const overParents = overData?.parentIds || [];
      
      if (activeParents.length === overParents.length &&
          activeParents.every((id, idx) => id === overParents[idx])) {
        reorderTodos(active.id as number, over.id as number, activeParents);
      }
    }
    
    setActiveId(null);
  };

  if (loading) {
    return (
      <Card className="w-full max-w-2xl">
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading todos...
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-2xl">
        <CardContent className="py-8 text-center text-destructive">
          Error: {error}
        </CardContent>
      </Card>
    );
  }

  const renderTodo = (todo: Todo, level: number = 0, parentIds: TodoPath = [], parentTodo?: Todo) => {
    // Prevent rendering beyond max depth
    if (level >= MAX_TODO_DEPTH) {
      return null;
    }

    const currentPath = [...parentIds, todo.id];
    const isNA = isNextAction(todo, parentTodo);
    const hasNA = nextActions.some(na => {
      // Check if this todo contains any next actions
      return na.path.slice(0, currentPath.length).every((id, idx) => id === currentPath[idx]);
    });
    const projectPath = (showOnlyNextActions || showOnlyFocusTasks) ? getProjectPath(todos, currentPath) : undefined;

    return (
      <SortableTodoItem
        key={todo.id}
        todo={todo}
        level={level}
        parentIds={parentIds}
        parentTodo={parentTodo}
        isExpanded={isExpanded(todo.id)}
        isNextAction={isNA}
        hasNextAction={hasNA}
        projectPath={projectPath}
        showProjectPath={showOnlyNextActions}
        showFocusPath={showOnlyFocusTasks}
        onToggle={toggleTodo}
        onDelete={deleteTodo}
        onCopy={copyTodo}
        onToggleFocus={toggleFocusTodo}
        onExpand={toggleExpanded}
        onAddSubtask={() => addSubtask([...parentIds, todo.id])}
        onUpdateText={updateTodoText}
        onSetEditing={setTodoEditing}
        renderSubtask={(parentTodo, newParentIds) => {
          const siblings = parentTodo.subtasks || [];
          if (siblings.length === 0) return null;
          
          return (
            <SortableContext 
              items={siblings.map(s => s.id)} 
              strategy={verticalListSortingStrategy}
            >
              {siblings.map((subtask) => renderTodo(subtask, level + 1, newParentIds, parentTodo))}
            </SortableContext>
          );
        }}
      />
    );
  };

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>My Todo List</CardTitle>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>
              {stats.completed}/{stats.total} 완료
              {stats.hiddenCount > 0 && ` (${stats.hiddenCount}개 숨김)`}
              {stats.nextActionsCount > 0 && ` | ${stats.nextActionsCount}개 다음 행동`}
              {stats.focusTasksCount > 0 && ` | ${stats.focusTasksCount}개 집중`}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleShowOnlyFocusTasks}
              className="text-xs"
            >
              <Star className="h-3 w-3 mr-1" />
              {showOnlyFocusTasks ? '전체 보기' : '집중할 작업'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleShowOnlyNextActions}
              className="text-xs"
            >
              <Zap className="h-3 w-3 mr-1" />
              {showOnlyNextActions ? '전체 보기' : '다음 행동만'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleShowCompleted}
              className="text-xs"
            >
              {showCompleted ? <EyeOff className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
              {showCompleted ? '완료 항목 숨기기' : '완료 항목 보기'}
            </Button>
            {stats.completed > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCompleted}
                className="text-xs"
              >
                완료 항목 삭제
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <TodoInput
          value={inputValue}
          onChange={setInputValue}
          onSubmit={addTodo}
          placeholder="새로운 할 일 추가..."
        />
        <div className="space-y-2">
          {todos.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              아직 할 일이 없습니다. 위에서 추가해주세요!
            </p>
          ) : visibleTodos.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              모든 항목이 완료되었습니다. &apos;완료 항목 보기&apos;를 클릭하여 확인하세요.
            </p>
          ) : (
            <>
              <SortableContext 
                items={visibleTodos.map(t => t.id)} 
                strategy={verticalListSortingStrategy}
              >
                {visibleTodos.map((todo) => renderTodo(todo))}
              </SortableContext>
              {stats.maxDepth >= MAX_TODO_DEPTH && (
                <p className="text-xs text-muted-foreground text-center mt-4">
                  최대 중첩 깊이 ({MAX_TODO_DEPTH}단계)에 도달했습니다.
                </p>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
    </DndContext>
  );
}

export function TodoList() {
  return (
    <ErrorBoundary>
      <TodoListContent />
    </ErrorBoundary>
  );
}
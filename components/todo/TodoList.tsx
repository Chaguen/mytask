"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { SortableTodoItem } from "./SortableTodoItem";
import { TodoInput } from "./TodoInput";
import { Button } from "@/components/ui/button";
import { useTodoContext } from "@/contexts/TodoContext";
import { TodoPath, MAX_TODO_DEPTH } from "@/types/todo-tree";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Todo } from "@/types/todo";
import { Eye, EyeOff, Star } from "lucide-react";
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
import { useState, useCallback } from "react";
import { CompletionCelebration } from "./CompletionCelebration";

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
    showOnlyFocusTasks,
    toggleShowOnlyFocusTasks,
    toggleFocusTodo,
    focusTodos,
    getProjectPath,
    reorderTodos,
    stats,
  } = useTodoContext();

  const [activeId, setActiveId] = useState<number | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  
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

  // IMPORTANT: All hooks must be called before any conditional returns
  const renderTodo = useCallback((todo: Todo, level: number = 0, parentIds: TodoPath = [], parentTodo?: Todo) => {
    // Prevent rendering beyond max depth
    if (level >= MAX_TODO_DEPTH) {
      return null;
    }

    const currentPath = [...parentIds, todo.id];
    
    // In focus mode, we need to find the original path from the full todos
    let projectPath = undefined;
    if (showOnlyFocusTasks && todo.focusPriority) {
      // Find the original todo path in the full tree
      const focusInfo = focusTodos.find(ft => ft.todo.id === todo.id);
      if (focusInfo) {
        projectPath = getProjectPath(todos, focusInfo.path);
      }
    }

    return (
      <SortableTodoItem
        key={todo.id}
        todo={todo}
        level={level}
        parentIds={parentIds}
        parentTodo={parentTodo}
        isExpanded={isExpanded(todo.id)}
        isInFocusMode={showOnlyFocusTasks}
        projectPath={projectPath}
        showProjectPath={false}
        showFocusPath={showOnlyFocusTasks}
        onToggle={(id, parentIds) => {
          toggleTodo(id, parentIds);
          // Show celebration if a task was completed
          const todo = todos.find(t => t.id === id);
          if (todo && !todo.completed && (!todo.subtasks || todo.subtasks.length === 0)) {
            setShowCelebration(true);
          }
        }}
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
  }, [
    todos,
    showOnlyFocusTasks,
    focusTodos,
    getProjectPath,
    isExpanded,
    toggleTodo,
    deleteTodo,
    copyTodo,
    toggleFocusTodo,
    toggleExpanded,
    addSubtask,
    updateTodoText,
    setTodoEditing,
  ]);

  // Check loading and error states after all hooks are called
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

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <Card className="w-full max-w-2xl">
      <CardHeader className="pb-3">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">My Todo List</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant={showOnlyFocusTasks ? "secondary" : "ghost"}
                size="icon"
                onClick={toggleShowOnlyFocusTasks}
                className="h-8 w-8"
                title={showOnlyFocusTasks ? '전체 보기' : '집중할 작업만 보기'}
              >
                <Star className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleShowCompleted}
                className="h-8 w-8"
                title={showCompleted ? '완료 항목 숨기기' : '완료 항목 보기'}
              >
                {showCompleted ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              {stats.completed > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearCompleted}
                  className="text-xs h-8 px-2"
                  title="완료된 모든 항목 삭제"
                >
                  완료 삭제
                </Button>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <span>{stats.completed}/{stats.total} 완료</span>
              {stats.hiddenCount > 0 && <span className="text-orange-500">({stats.hiddenCount}개 숨김)</span>}
              {stats.focusTasksCount > 0 && <span className="text-yellow-500">⭐ {stats.focusTasksCount}개</span>}
            </div>
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
                {visibleTodos.map((todo) => {
                  // In focus mode, find the original parent path
                  if (showOnlyFocusTasks && todo.focusPriority) {
                    const focusInfo = focusTodos.find(ft => ft.todo.id === todo.id);
                    if (focusInfo && focusInfo.path.length > 0) {
                      const parentIds = focusInfo.path.slice(0, -1);
                      return renderTodo(todo, 0, parentIds);
                    }
                  }
                  return renderTodo(todo);
                })}
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
      <CompletionCelebration 
        show={showCelebration} 
        onComplete={() => setShowCelebration(false)} 
      />
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
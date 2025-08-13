"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { useTodoContext } from "@/contexts/TodoContext";
import { Todo } from "@/types/todo";
import { format } from "date-fns";

interface TimeBox {
  id: string;
  startTime: string;
  endTime: string;
  todos: number[]; // todo IDs
}

export function TimeboxView() {
  const { visibleTodos, toggleTodo } = useTodoContext();
  const [timeboxes, setTimeboxes] = useState<TimeBox[]>([
    { id: '1', startTime: '09:00', endTime: '10:00', todos: [] },
    { id: '2', startTime: '10:00', endTime: '11:00', todos: [] },
    { id: '3', startTime: '11:00', endTime: '12:00', todos: [] },
    { id: '4', startTime: '14:00', endTime: '15:00', todos: [] },
    { id: '5', startTime: '15:00', endTime: '16:00', todos: [] },
    { id: '6', startTime: '16:00', endTime: '17:00', todos: [] },
  ]);
  
  const [draggedTodo, setDraggedTodo] = useState<Todo | null>(null);

  const handleDragStart = (e: React.DragEvent, todo: Todo) => {
    setDraggedTodo(todo);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, boxId: string) => {
    e.preventDefault();
    if (!draggedTodo) return;

    setTimeboxes(prev => prev.map(box => {
      if (box.id === boxId) {
        // Add todo to this box if not already there
        if (!box.todos.includes(draggedTodo.id)) {
          return { ...box, todos: [...box.todos, draggedTodo.id] };
        }
      } else {
        // Remove from other boxes
        return { ...box, todos: box.todos.filter(id => id !== draggedTodo.id) };
      }
      return box;
    }));
    
    setDraggedTodo(null);
  };

  const removeTodoFromBox = (boxId: string, todoId: number) => {
    setTimeboxes(prev => prev.map(box => 
      box.id === boxId 
        ? { ...box, todos: box.todos.filter(id => id !== todoId) }
        : box
    ));
  };

  const getTodoById = (id: number): Todo | undefined => {
    const findTodo = (todos: Todo[]): Todo | undefined => {
      for (const todo of todos) {
        if (todo.id === id) return todo;
        if (todo.subtasks) {
          const found = findTodo(todo.subtasks);
          if (found) return found;
        }
      }
    };
    return findTodo(visibleTodos);
  };

  // 할당되지 않은 할일들
  const assignedTodoIds = timeboxes.flatMap(box => box.todos);
  const unassignedTodos = visibleTodos.filter(todo => 
    !todo.completed && !assignedTodoIds.includes(todo.id)
  );

  return (
    <div className="flex gap-4 h-[calc(100vh-8rem)]">
      {/* 타임박스 영역 */}
      <div className="flex-1 overflow-y-auto">
        <h3 className="font-bold mb-4">오늘의 타임박스</h3>
        <div className="space-y-2">
          {timeboxes.map(box => (
            <Card
              key={box.id}
              className="p-3"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, box.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-sm font-bold">
                  {box.startTime} - {box.endTime}
                </span>
                <span className="text-xs text-muted-foreground">
                  {box.todos.length}개 할일
                </span>
              </div>
              
              <div className="min-h-[60px] space-y-1">
                {box.todos.map(todoId => {
                  const todo = getTodoById(todoId);
                  if (!todo) return null;
                  
                  return (
                    <div
                      key={todoId}
                      className="flex items-center justify-between p-2 bg-muted rounded text-sm"
                    >
                      <span className={todo.completed ? 'line-through opacity-50' : ''}>
                        {todo.text}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={() => removeTodoFromBox(box.id, todoId)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  );
                })}
                
                {box.todos.length === 0 && (
                  <div className="text-xs text-muted-foreground text-center py-4">
                    여기로 할일을 드래그하세요
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* 할일 목록 */}
      <div className="w-80 overflow-y-auto">
        <h3 className="font-bold mb-4">할일 목록</h3>
        <div className="space-y-1">
          {unassignedTodos.map(todo => (
            <div
              key={todo.id}
              draggable
              onDragStart={(e) => handleDragStart(e, todo)}
              className="p-2 bg-muted rounded cursor-move hover:bg-muted/80 text-sm"
            >
              {todo.text}
              {todo.difficulty && (
                <span className={`ml-2 text-[10px] px-1 py-0.5 rounded ${
                  todo.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                  todo.difficulty === 'normal' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {todo.difficulty === 'easy' ? 'E' :
                   todo.difficulty === 'normal' ? 'N' : 'H'}
                </span>
              )}
            </div>
          ))}
          
          {unassignedTodos.length === 0 && (
            <div className="text-xs text-muted-foreground text-center py-8">
              모든 할일이 배치되었거나<br />할일이 없습니다
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
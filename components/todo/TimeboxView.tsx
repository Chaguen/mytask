"use client";

import { useState, useEffect, useRef } from "react";
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // 24시간 30분 단위 타임박스 생성
  const generateTimeboxes = (): TimeBox[] => {
    const boxes: TimeBox[] = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const startHour = hour.toString().padStart(2, '0');
        const startMinute = minute.toString().padStart(2, '0');
        const endHour = minute === 30 ? (hour + 1).toString().padStart(2, '0') : hour.toString().padStart(2, '0');
        const endMinute = minute === 30 ? '00' : '30';
        
        boxes.push({
          id: `${hour}-${minute}`,
          startTime: `${startHour}:${startMinute}`,
          endTime: hour === 23 && minute === 30 ? '00:00' : `${endHour}:${endMinute}`,
          todos: []
        });
      }
    }
    return boxes;
  };
  
  const [timeboxes, setTimeboxes] = useState<TimeBox[]>(generateTimeboxes());
  const [draggedTodo, setDraggedTodo] = useState<Todo | null>(null);
  
  // 현재 시간으로 자동 스크롤
  useEffect(() => {
    if (scrollContainerRef.current) {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes() < 30 ? 0 : 30;
      const index = currentHour * 2 + (currentMinute / 30);
      const elementHeight = 50; // 대략적인 높이
      scrollContainerRef.current.scrollTop = index * elementHeight - 200;
    }
  }, []);

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
    <div className="flex gap-4 h-[calc(100vh-8rem)] max-w-7xl mx-auto w-full">
      {/* 타임박스 영역 */}
      <div className="flex-1 overflow-y-auto" ref={scrollContainerRef}>
        <div className="sticky top-0 bg-background z-10 pb-2 mb-2 border-b">
          <h3 className="font-bold">24시간 타임박스</h3>
        </div>
        <div className="space-y-1">
          {timeboxes.map(box => {
            const isCurrentTime = () => {
              const now = new Date();
              const currentHour = now.getHours().toString().padStart(2, '0');
              const currentMinute = now.getMinutes() < 30 ? '00' : '30';
              return box.startTime === `${currentHour}:${currentMinute}`;
            };
            
            return (
              <div
                key={box.id}
                className={`flex gap-2 p-2 border rounded-lg transition-colors ${
                  isCurrentTime() ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : ''
                } ${box.todos.length > 0 ? 'bg-muted/50' : ''}`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, box.id)}
              >
                <div className="w-20 flex-shrink-0">
                  <span className={`font-mono text-xs ${
                    isCurrentTime() ? 'font-bold text-blue-600' : 'text-muted-foreground'
                  }`}>
                    {box.startTime}
                  </span>
                </div>
                
                <div className="flex-1 min-h-[30px] flex flex-wrap gap-1">
                  {box.todos.map(todoId => {
                    const todo = getTodoById(todoId);
                    if (!todo) return null;
                    
                    return (
                      <div
                        key={todoId}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 rounded text-xs"
                      >
                        <span className={todo.completed ? 'line-through opacity-50' : ''}>
                          {todo.text}
                        </span>
                        <button
                          onClick={() => removeTodoFromBox(box.id, todoId)}
                          className="hover:text-destructive"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                  
                  {box.todos.length === 0 && (
                    <div className="text-[10px] text-muted-foreground self-center">
                      드래그하여 추가
                    </div>
                  )}
                </div>
              </div>
            );
          })}
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
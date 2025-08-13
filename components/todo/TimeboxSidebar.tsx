"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { useTodoContext } from "@/contexts/TodoContext";
import { Todo } from "@/types/todo";

interface TimeBox {
  id: string;
  time: string;
  todos: number[];
}

interface TimeboxSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function TimeboxSidebar({ isOpen, onToggle }: TimeboxSidebarProps) {
  const { visibleTodos } = useTodoContext();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // 24시간 30분 단위 타임박스 생성
  const generateTimeboxes = (): TimeBox[] => {
    const boxes: TimeBox[] = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        boxes.push({
          id: `${hour}-${minute}`,
          time,
          todos: []
        });
      }
    }
    return boxes;
  };
  
  const [timeboxes, setTimeboxes] = useState<TimeBox[]>(generateTimeboxes());
  const [draggedOverBox, setDraggedOverBox] = useState<string | null>(null);
  
  // 현재 시간으로 자동 스크롤
  useEffect(() => {
    if (scrollContainerRef.current && isOpen) {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes() < 30 ? 0 : 30;
      const index = currentHour * 2 + (currentMinute / 30);
      const elementHeight = 32; // 각 타임박스의 대략적인 높이
      scrollContainerRef.current.scrollTop = index * elementHeight - 100;
    }
  }, [isOpen]);

  const handleDragOver = (e: React.DragEvent, boxId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggedOverBox(boxId);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedOverBox(null);
  };

  const handleDrop = (e: React.DragEvent, boxId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggedOverBox(null);
    
    try {
      const todoData = e.dataTransfer.getData('application/json');
      if (!todoData) return;
      
      const todo = JSON.parse(todoData);
      
      setTimeboxes(prev => prev.map(box => {
        if (box.id === boxId) {
          if (!box.todos.includes(todo.id)) {
            return { ...box, todos: [...box.todos, todo.id] };
          }
        } else {
          return { ...box, todos: box.todos.filter(id => id !== todo.id) };
        }
        return box;
      }));
    } catch (error) {
      console.error('Failed to handle drop:', error);
    }
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

  const getCurrentTimeBox = () => {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes() < 30 ? 0 : 30;
    return `${hour}-${minute}`;
  };

  const currentBox = getCurrentTimeBox();

  return (
    <>
      {/* 사이드바 토글 버튼 */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className="fixed left-0 top-20 z-40 rounded-l-none"
        title="타임박스 사이드바"
      >
        {isOpen ? <ChevronLeft className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
      </Button>

      {/* 사이드바 */}
      <div className={`fixed left-0 top-0 h-full bg-background border-r transition-all duration-300 z-30 ${
        isOpen ? 'w-80' : 'w-0 overflow-hidden'
      }`}>
        <div className="h-full flex flex-col pt-16">
          <div className="px-4 py-2 border-b">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Clock className="h-4 w-4" />
              오늘의 타임박스
            </h3>
          </div>
          
          <div className="flex-1 overflow-y-auto" ref={scrollContainerRef}>
            <div className="p-2 space-y-1">
              {timeboxes.map(box => {
                const isCurrentTime = box.id === currentBox;
                const hasTodos = box.todos.length > 0;
                
                return (
                  <div
                    key={box.id}
                    className={`
                      relative p-2 rounded border transition-all
                      ${isCurrentTime ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : 'border-transparent'}
                      ${hasTodos ? 'bg-muted/50' : ''}
                      ${draggedOverBox === box.id ? 'ring-2 ring-primary' : ''}
                      hover:bg-muted/30
                    `}
                    onDragOver={(e) => handleDragOver(e, box.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, box.id)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-mono text-xs ${
                        isCurrentTime ? 'font-bold text-blue-600' : 'text-muted-foreground'
                      }`}>
                        {box.time}
                      </span>
                      {hasTodos && (
                        <span className="text-[10px] text-muted-foreground">
                          {box.todos.length}개
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-1 min-h-[20px]">
                      {box.todos.map(todoId => {
                        const todo = getTodoById(todoId);
                        if (!todo) return null;
                        
                        return (
                          <div
                            key={todoId}
                            className="flex items-center justify-between gap-1 text-[11px] bg-primary/10 rounded px-1 py-0.5"
                          >
                            <span className="truncate flex-1">
                              {todo.text}
                            </span>
                            <button
                              onClick={() => removeTodoFromBox(box.id, todoId)}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              ×
                            </button>
                          </div>
                        );
                      })}
                      
                      {!hasTodos && (
                        <div className="text-[10px] text-muted-foreground/50 text-center">
                          드래그
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
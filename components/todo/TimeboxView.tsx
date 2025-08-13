"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronDown, Clock, Search, Filter } from "lucide-react";
import { useTodoContext } from "@/contexts/TodoContext";
import { Todo } from "@/types/todo";
import { Input } from "@/components/ui/input";

interface TimeBox {
  id: string;
  time: string;
  hour: number;
  minute: number;
  todos: number[];
}

export function TimeboxView() {
  const { visibleTodos } = useTodoContext();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [expandedTodos, setExpandedTodos] = useState<Set<number>>(new Set());
  const [showTodoList, setShowTodoList] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState<string | null>(null);
  
  // 24시간 30분 단위 타임박스 생성
  const generateTimeboxes = (): TimeBox[] => {
    const boxes: TimeBox[] = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        boxes.push({
          id: `${hour}-${minute}`,
          time,
          hour,
          minute,
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
    if (scrollContainerRef.current) {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes() < 30 ? 0 : 30;
      const index = currentHour * 2 + (currentMinute / 30);
      const elementHeight = 100; // 각 타임박스의 높이
      scrollContainerRef.current.scrollTop = index * elementHeight - 200;
    }
  }, []);

  // 현재 시간 업데이트
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

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
      
      const { id } = JSON.parse(todoData);
      
      setTimeboxes(prev => prev.map(box => {
        if (box.id === boxId) {
          if (!box.todos.includes(id)) {
            return { ...box, todos: [...box.todos, id] };
          }
        } else {
          return { ...box, todos: box.todos.filter(todoId => todoId !== id) };
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

  const getTodoPath = (id: number, todos: Todo[] = visibleTodos, path: string[] = []): string[] | null => {
    for (const todo of todos) {
      if (todo.id === id) {
        return path;
      }
      if (todo.subtasks) {
        const found = getTodoPath(id, todo.subtasks, [...path, todo.text]);
        if (found) return found;
      }
    }
    return null;
  };

  const toggleExpanded = (id: number) => {
    setExpandedTodos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // 검색 및 필터링된 할일 목록
  const getFilteredTodos = (todos: Todo[]): Todo[] => {
    return todos.filter(todo => {
      if (todo.completed) return false;
      
      const matchesSearch = !searchTerm || 
        todo.text.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDifficulty = !filterDifficulty || 
        todo.difficulty === filterDifficulty;
      
      if (matchesSearch && matchesDifficulty) return true;
      
      // 하위 항목도 검색
      if (todo.subtasks && todo.subtasks.length > 0) {
        return getFilteredTodos(todo.subtasks).length > 0;
      }
      
      return false;
    });
  };

  const renderTodoTree = (todos: Todo[], level: number = 0, parentPath: string[] = []): JSX.Element[] => {
    const filtered = getFilteredTodos(todos);
    
    return filtered.map(todo => {
      const isExpanded = expandedTodos.has(todo.id);
      const hasSubtasks = todo.subtasks && todo.subtasks.length > 0;
      const isInTimebox = timeboxes.some(box => box.todos.includes(todo.id));
      
      return (
        <div key={todo.id}>
          <div
            className={`flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 group transition-colors ${
              isInTimebox ? 'opacity-40' : ''
            } ${!todo.completed ? 'cursor-move' : 'opacity-50'}`}
            style={{ paddingLeft: `${level * 20 + 8}px` }}
            draggable={!todo.completed && !isInTimebox}
            onDragStart={(e) => {
              e.dataTransfer.effectAllowed = 'move';
              e.dataTransfer.setData('application/json', JSON.stringify({
                id: todo.id,
                text: todo.text,
                path: parentPath
              }));
            }}
          >
            {hasSubtasks && (
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0"
                onClick={() => toggleExpanded(todo.id)}
              >
                {isExpanded ? 
                  <ChevronDown className="h-3 w-3" /> : 
                  <ChevronRight className="h-3 w-3" />
                }
              </Button>
            )}
            {!hasSubtasks && <div className="w-4" />}
            
            <span className={`text-sm flex-1 ${
              todo.completed ? 'line-through text-muted-foreground' : ''
            }`}>
              {todo.text}
            </span>
            
            {todo.difficulty && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                todo.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                todo.difficulty === 'normal' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {todo.difficulty === 'easy' ? 'E' :
                 todo.difficulty === 'normal' ? 'N' : 'H'}
              </span>
            )}
            
            {isInTimebox && (
              <span className="text-[10px] text-muted-foreground bg-primary/10 px-2 py-0.5 rounded">
                배치됨
              </span>
            )}
          </div>
          
          {isExpanded && hasSubtasks && (
            <div>
              {renderTodoTree(todo.subtasks!, level + 1, [...parentPath, todo.text])}
            </div>
          )}
        </div>
      );
    });
  };

  const getCurrentTimeBox = () => {
    const hour = currentTime.getHours();
    const minute = currentTime.getMinutes() < 30 ? 0 : 30;
    return `${hour}-${minute}`;
  };

  const isWorkingHours = (hour: number) => hour >= 9 && hour < 18;
  const currentBox = getCurrentTimeBox();

  return (
    <div className="w-full h-[calc(100vh-8rem)] flex gap-4">
      {/* 왼쪽: 할일 목록 */}
      <div className={`bg-card border rounded-lg transition-all duration-300 flex-shrink-0 ${
        showTodoList ? 'w-80' : 'w-12'
      }`}>
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between p-3 border-b bg-muted/30">
            <h4 className={`font-semibold text-sm ${showTodoList ? 'block' : 'hidden'}`}>
              할일 목록
            </h4>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowTodoList(!showTodoList)}
              className="h-8 w-8"
            >
              <ChevronRight className={`h-4 w-4 transition-transform ${
                showTodoList ? 'rotate-180' : ''
              }`} />
            </Button>
          </div>
          
          {showTodoList && (
            <>
              {/* 검색 및 필터 */}
              <div className="p-3 space-y-2 border-b">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="할일 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 h-9 text-sm"
                  />
                </div>
                <div className="flex gap-1">
                  <Button
                    variant={filterDifficulty === null ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterDifficulty(null)}
                    className="h-7 text-xs flex-1"
                  >
                    전체
                  </Button>
                  <Button
                    variant={filterDifficulty === 'easy' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterDifficulty('easy')}
                    className="h-7 text-xs flex-1"
                  >
                    쉬움
                  </Button>
                  <Button
                    variant={filterDifficulty === 'normal' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterDifficulty('normal')}
                    className="h-7 text-xs flex-1"
                  >
                    보통
                  </Button>
                  <Button
                    variant={filterDifficulty === 'hard' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterDifficulty('hard')}
                    className="h-7 text-xs flex-1"
                  >
                    어려움
                  </Button>
                </div>
              </div>
              
              {/* 할일 목록 */}
              <div className="flex-1 overflow-y-auto p-3">
                <div className="text-xs text-muted-foreground mb-3">
                  드래그하여 타임박스에 배치
                </div>
                {renderTodoTree(visibleTodos)}
                {getFilteredTodos(visibleTodos).length === 0 && (
                  <div className="text-center text-sm text-muted-foreground mt-8">
                    {searchTerm || filterDifficulty ? '검색 결과가 없습니다' : '할일이 없습니다'}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* 오른쪽: 타임박스 (세로 스크롤) */}
      <div className="flex-1 bg-card border rounded-lg overflow-hidden">
        <div className="h-full flex flex-col">
          <div className="p-4 border-b bg-muted/30">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              24시간 타임박스
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {currentTime.toLocaleDateString('ko-KR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                weekday: 'long' 
              })}
            </p>
          </div>
          
          <div 
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto"
          >
            <div className="p-4 space-y-2">
              {timeboxes.map(box => {
                const isCurrentTime = box.id === currentBox;
                const hasTodos = box.todos.length > 0;
                const isWorking = isWorkingHours(box.hour);
                
                return (
                  <div
                    key={box.id}
                    className={`
                      flex gap-4 min-h-[80px] p-3 rounded-lg border transition-all
                      ${isCurrentTime ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 shadow-md' : 
                        isWorking ? 'border-border bg-muted/10' : 'border-border'}
                      ${hasTodos ? 'bg-primary/5' : ''}
                      ${draggedOverBox === box.id ? 'ring-2 ring-primary bg-primary/10' : ''}
                      hover:bg-muted/20
                    `}
                    onDragOver={(e) => handleDragOver(e, box.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, box.id)}
                  >
                    {/* 시간 표시 */}
                    <div className="w-16 flex-shrink-0">
                      <span className={`font-mono text-sm font-medium ${
                        isCurrentTime ? 'text-blue-600' : 'text-muted-foreground'
                      }`}>
                        {box.time}
                      </span>
                      {isCurrentTime && (
                        <div className="text-[10px] text-blue-600 mt-1">현재</div>
                      )}
                    </div>
                    
                    {/* 할일 영역 */}
                    <div className="flex-1 min-h-[50px]">
                      {box.todos.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {box.todos.map(todoId => {
                            const todo = getTodoById(todoId);
                            if (!todo) return null;
                            
                            const path = getTodoPath(todoId);
                            
                            return (
                              <div
                                key={todoId}
                                className="group bg-background border rounded-md p-2 flex-1 min-w-[200px] hover:shadow-sm transition-shadow"
                              >
                                {path && path.length > 0 && (
                                  <div className="text-[10px] text-muted-foreground/70 mb-1">
                                    {path.join(' › ')}
                                  </div>
                                )}
                                <div className="flex items-start justify-between gap-2">
                                  <span className="text-sm flex-1">
                                    {todo.text}
                                  </span>
                                  <button
                                    onClick={() => removeTodoFromBox(box.id, todoId)}
                                    className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity mt-0.5"
                                  >
                                    ×
                                  </button>
                                </div>
                                {todo.difficulty && (
                                  <span className={`inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded ${
                                    todo.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                                    todo.difficulty === 'normal' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-red-100 text-red-700'
                                  }`}>
                                    {todo.difficulty === 'easy' ? '쉬움' :
                                     todo.difficulty === 'normal' ? '보통' : '어려움'}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full text-xs text-muted-foreground/50">
                          {draggedOverBox === box.id ? '여기에 놓기' : '드래그하여 추가'}
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
    </div>
  );
}
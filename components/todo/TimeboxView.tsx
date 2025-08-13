"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronDown, Clock, Search, Calendar } from "lucide-react";
import { useTodoContext } from "@/contexts/TodoContext";
import { Todo } from "@/types/todo";
import { Input } from "@/components/ui/input";
import { useTimeboxes } from "@/hooks/useTimeboxes";
import { format } from "date-fns";
import { TimeboxItem } from "@/types/timebox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const HOUR_HEIGHT = 60; // pixels per hour
const MINUTE_HEIGHT = HOUR_HEIGHT / 60;

export function TimeboxView() {
  const { visibleTodos } = useTodoContext();
  const { 
    timeboxItems, 
    loading, 
    defaultDuration,
    setDefaultDuration,
    addTimeboxItem, 
    removeTimeboxItem,
    moveTimeboxItem,
    resizeTimeboxItem,
    getItemsForDate 
  } = useTimeboxes();
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [expandedTodos, setExpandedTodos] = useState<Set<number>>(new Set());
  const [showTodoList, setShowTodoList] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [draggedItem, setDraggedItem] = useState<TimeboxItem | null>(null);
  const [resizingItem, setResizingItem] = useState<TimeboxItem | null>(null);
  const [isDraggingNew, setIsDraggingNew] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [isDraggingExisting, setIsDraggingExisting] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [previewPosition, setPreviewPosition] = useState<{ time: string; duration: number } | null>(null);
  const [draggedTodoInfo, setDraggedTodoInfo] = useState<{ id: number; text: string } | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  
  // Get items for selected date
  const todayItems = useMemo(() => {
    return getItemsForDate(selectedDate);
  }, [getItemsForDate, selectedDate, timeboxItems]);
  
  // Auto scroll to current time on mount
  useEffect(() => {
    if (scrollContainerRef.current) {
      const now = new Date();
      const currentHour = now.getHours();
      const scrollPosition = currentHour * HOUR_HEIGHT - 200;
      scrollContainerRef.current.scrollTop = scrollPosition;
    }
  }, []);

  // Current time indicator update
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

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

  // Calculate position from time
  const timeToPosition = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * HOUR_HEIGHT + minutes * MINUTE_HEIGHT;
  };

  // Calculate time from position
  const positionToTime = (y: number): string => {
    const totalMinutes = Math.max(0, Math.min(23 * 60 + 59, Math.round(y / MINUTE_HEIGHT)));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round((totalMinutes % 60) / 15) * 15; // Round to 15 min intervals
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  // Handle dropping new todo
  const handleDropNewTodo = (e: React.DragEvent, time?: string) => {
    e.preventDefault();
    setIsDraggingNew(false);
    setPreviewPosition(null);
    setDraggedTodoInfo(null);
    
    try {
      const todoData = e.dataTransfer.getData('application/json');
      if (!todoData) return;
      
      const { id } = JSON.parse(todoData);
      const rect = e.currentTarget.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const startTime = time || positionToTime(y);
      
      addTimeboxItem(id, startTime, defaultDuration, selectedDate);
    } catch (error) {
      console.error('Failed to handle drop:', error);
    }
  };

  // Handle moving existing item
  const handleMoveItem = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingExisting(false);
    setPreviewPosition(null);
    setDragOffset({ x: 0, y: 0 });
    
    if (!draggedItem) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    // Use offset from drag start position
    const y = e.clientY - rect.top - dragOffset.y;
    const newTime = positionToTime(y);
    
    moveTimeboxItem(draggedItem.id, newTime);
    setDraggedItem(null);
  };

  // Handle drag over for preview
  const handleDragOverTimeline = (e: React.DragEvent) => {
    e.preventDefault();
    
    const rect = e.currentTarget.getBoundingClientRect();
    
    let y: number;
    if (draggedItem) {
      // For existing items, use offset from drag start position
      y = e.clientY - rect.top - dragOffset.y;
    } else {
      // For new items, use mouse position directly
      y = e.clientY - rect.top;
    }
    
    const time = positionToTime(y);
    
    if (draggedItem) {
      setIsDraggingExisting(true);
      setPreviewPosition({ time, duration: draggedItem.duration });
    } else if (draggedTodoInfo) {
      setIsDraggingNew(true);
      setPreviewPosition({ time, duration: defaultDuration });
    }
  };

  // Handle resize
  const handleResizeStart = (e: React.MouseEvent, item: TimeboxItem) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizingItem(item);
    setDragStartY(e.clientY);
    
    // Create initial duration snapshot
    const initialDuration = item.duration;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = moveEvent.clientY - e.clientY;
      const deltaMinutes = Math.round(deltaY / MINUTE_HEIGHT / 15) * 15;
      const newDuration = Math.max(15, initialDuration + deltaMinutes);
      
      resizeTimeboxItem(item.id, newDuration);
    };
    
    const handleMouseUp = () => {
      setIsResizing(false);
      setResizingItem(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Filter todos
  const getFilteredTodos = (todos: Todo[]): Todo[] => {
    return todos.filter(todo => {
      if (todo.completed) return false;
      
      // Check if already in timebox
      const isInTimebox = todayItems.some(item => item.todoId === todo.id);
      if (isInTimebox) return false;
      
      const matchesSearch = !searchTerm || 
        todo.text.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDifficulty = !filterDifficulty || 
        todo.difficulty === filterDifficulty;
      
      if (matchesSearch && matchesDifficulty) return true;
      
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
      
      return (
        <div key={todo.id}>
          <div
            className={`flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 group transition-colors cursor-move`}
            style={{ paddingLeft: `${level * 20 + 8}px` }}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.effectAllowed = 'copy';
              const data = {
                id: todo.id,
                text: todo.text,
                path: parentPath
              };
              e.dataTransfer.setData('application/json', JSON.stringify(data));
              setDraggedTodoInfo({ id: todo.id, text: todo.text });
            }}
            onDragEnd={() => {
              setDraggedTodoInfo(null);
              setPreviewPosition(null);
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
            
            <span className="text-sm flex-1">{todo.text}</span>
            
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

  // Generate hour labels
  const hours = Array.from({ length: 24 }, (_, i) => i);

  if (loading) {
    return (
      <div className="w-full h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="text-muted-foreground">타임박스 데이터 로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-[calc(100vh-8rem)] flex gap-4">
      {/* Left: Todo list */}
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
              {/* Duration selector */}
              <div className="p-3 border-b">
                <label className="text-xs text-muted-foreground">기본 작업 시간</label>
                <Select value={defaultDuration.toString()} onValueChange={(v) => setDefaultDuration(Number(v))}>
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15분</SelectItem>
                    <SelectItem value="30">30분</SelectItem>
                    <SelectItem value="45">45분</SelectItem>
                    <SelectItem value="60">1시간</SelectItem>
                    <SelectItem value="90">1시간 30분</SelectItem>
                    <SelectItem value="120">2시간</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Search and filter */}
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
              </div>
              
              {/* Todo list */}
              <div className="flex-1 overflow-y-auto p-3">
                <div className="text-xs text-muted-foreground mb-3">
                  드래그하여 타임라인에 추가
                </div>
                {renderTodoTree(visibleTodos)}
                {getFilteredTodos(visibleTodos).length === 0 && (
                  <div className="text-center text-sm text-muted-foreground mt-8">
                    {searchTerm ? '검색 결과가 없습니다' : '할일이 없습니다'}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Right: Timeline */}
      <div className="flex-1 bg-card border rounded-lg overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" />
                타임박스
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {format(new Date(selectedDate), 'yyyy년 M월 d일 EEEE')}
              </p>
            </div>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-40"
            />
          </div>
          
          {/* Timeline */}
          <div 
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto relative"
          >
            <div className="flex">
              {/* Hour labels */}
              <div className="w-16 flex-shrink-0">
                {hours.map(hour => (
                  <div
                    key={hour}
                    className="h-[60px] border-b border-border/50 text-xs text-muted-foreground px-2 py-1"
                  >
                    {hour.toString().padStart(2, '0')}:00
                  </div>
                ))}
              </div>
              
              {/* Timeline grid */}
              <div 
                className="flex-1 relative"
                onDragOver={handleDragOverTimeline}
                onDragLeave={() => {
                  setIsDraggingNew(false);
                  setIsDraggingExisting(false);
                  setPreviewPosition(null);
                }}
                onDrop={(e) => {
                  if (draggedItem) {
                    handleMoveItem(e);
                  } else {
                    handleDropNewTodo(e);
                  }
                }}
              >
                {/* Hour lines */}
                {hours.map(hour => (
                  <div
                    key={hour}
                    className="absolute w-full h-[60px] border-b border-border/50"
                    style={{ top: `${hour * HOUR_HEIGHT}px` }}
                  >
                    {/* 30 minute line */}
                    <div className="absolute w-full border-b border-border/20" style={{ top: '30px' }} />
                  </div>
                ))}
                
                {/* Current time indicator */}
                {selectedDate === format(new Date(), 'yyyy-MM-dd') && (
                  <div
                    className="absolute w-full border-b-2 border-red-500 z-10"
                    style={{
                      top: `${currentTime.getHours() * HOUR_HEIGHT + currentTime.getMinutes() * MINUTE_HEIGHT}px`
                    }}
                  >
                    <div className="absolute -left-16 -top-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded">
                      {format(currentTime, 'HH:mm')}
                    </div>
                  </div>
                )}
                
                {/* Preview of drop position */}
                {previewPosition && (
                  <div
                    className="absolute left-2 right-2 bg-primary/20 border-2 border-dashed border-primary/40 rounded-md pointer-events-none"
                    style={{
                      top: `${timeToPosition(previewPosition.time)}px`,
                      height: `${previewPosition.duration * MINUTE_HEIGHT}px`,
                      minHeight: '25px'
                    }}
                  >
                    <div className="p-1.5 opacity-70">
                      <div className="text-xs font-medium">
                        {draggedTodoInfo?.text || draggedItem && getTodoById(draggedItem.todoId)?.text}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {previewPosition.time} - {format(
                          new Date(2000, 0, 1, 
                            parseInt(previewPosition.time.split(':')[0]), 
                            parseInt(previewPosition.time.split(':')[1]) + previewPosition.duration
                          ), 
                          'HH:mm'
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Timebox items */}
                {todayItems.map(item => {
                  const todo = getTodoById(item.todoId);
                  if (!todo) return null;
                  
                  const path = getTodoPath(item.todoId);
                  const top = timeToPosition(item.startTime);
                  const height = item.duration * MINUTE_HEIGHT;
                  
                  return (
                    <div
                      key={item.id}
                      className={`absolute left-2 right-2 bg-primary/10 border-2 border-primary/30 rounded-md p-1.5 group hover:shadow-md transition-shadow ${
                        isResizing && resizingItem?.id === item.id ? '' : 'cursor-move'
                      }`}
                      style={{
                        top: `${top}px`,
                        height: `${height}px`,
                        minHeight: '25px',
                        opacity: draggedItem?.id === item.id ? 0.5 : 1
                      }}
                      draggable={!isResizing}
                      onDragStart={(e) => {
                        if (isResizing) {
                          e.preventDefault();
                          return;
                        }
                        e.dataTransfer.effectAllowed = 'move';
                        setDraggedItem(item);
                        
                        // Calculate offset from top of the item to where mouse clicked
                        const itemRect = e.currentTarget.getBoundingClientRect();
                        const offsetY = e.clientY - itemRect.top;
                        setDragOffset({ x: 0, y: offsetY });
                      }}
                      onDragEnd={() => {
                        setDraggedItem(null);
                        setIsDraggingExisting(false);
                        setPreviewPosition(null);
                        setDragOffset({ x: 0, y: 0 });
                      }}
                    >
                      {/* Delete button */}
                      <button
                        onClick={() => removeTimeboxItem(item.id)}
                        className="absolute top-0.5 right-0.5 text-xs text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      >
                        ×
                      </button>
                      
                      {/* Content */}
                      <div className="h-full overflow-hidden pr-4">
                        {path && path.length > 0 && height > 40 && (
                          <div className="text-[9px] leading-tight text-muted-foreground/70 truncate">
                            {path.join(' › ')}
                          </div>
                        )}
                        <div className="text-xs font-medium leading-tight line-clamp-2">{todo.text}</div>
                        {height > 35 && (
                          <div className="text-[10px] leading-tight text-muted-foreground mt-0.5">
                            {item.startTime}-{format(
                              new Date(2000, 0, 1, 
                                parseInt(item.startTime.split(':')[0]), 
                                parseInt(item.startTime.split(':')[1]) + item.duration
                              ), 
                              'HH:mm'
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Resize handle */}
                      <div
                        className="absolute bottom-0 left-0 right-0 h-3 cursor-ns-resize hover:bg-primary/20 flex items-end justify-center"
                        onMouseDown={(e) => handleResizeStart(e, item)}
                        draggable={false}
                      >
                        <div className="w-8 h-1 bg-primary/30 rounded-full mb-0.5" />
                      </div>
                    </div>
                  );
                })}
                
                {/* Drop indicator - removed to prevent gray overlay */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
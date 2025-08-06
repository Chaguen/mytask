"use client";

import { useState, useMemo } from "react";
import { Todo } from "@/types/todo";
import { TodoPath } from "@/types/todo-tree";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, isToday, addMonths, subMonths } from "date-fns";
import { ko } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface CalendarViewProps {
  todos: Todo[];
  onToggleTodo: (id: number, parentIds?: TodoPath) => void;
  onEditTodo: (id: number, parentIds?: TodoPath) => void;
}

export function CalendarView({ todos, onToggleTodo, onEditTodo }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // 모든 할 일을 평면화하고 날짜별로 그룹화
  const todosByDate = useMemo(() => {
    const result: Record<string, Todo[]> = {};
    
    function collectTodos(todoList: Todo[], parentIds: TodoPath = []) {
      for (const todo of todoList) {
        if (todo.dueDate && !todo.completed) {
          const dateKey = todo.dueDate.split('T')[0];
          if (!result[dateKey]) {
            result[dateKey] = [];
          }
          result[dateKey].push(todo);
        }
        if (todo.subtasks) {
          collectTodos(todo.subtasks, [...parentIds, todo.id]);
        }
      }
    }
    
    collectTodos(todos);
    return result;
  }, [todos]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // 주 단위로 날짜를 그룹화
  const weeks = useMemo(() => {
    const weeksArray: Date[][] = [];
    let currentWeek: Date[] = [];
    
    // 첫 주의 빈 날짜 채우기
    const firstDayOfWeek = monthStart.getDay();
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push(new Date(0)); // placeholder
    }
    
    days.forEach((day) => {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeksArray.push(currentWeek);
        currentWeek = [];
      }
    });
    
    // 마지막 주의 빈 날짜 채우기
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(new Date(0)); // placeholder
      }
      weeksArray.push(currentWeek);
    }
    
    return weeksArray;
  }, [days, monthStart]);

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleToday = () => {
    setCurrentMonth(new Date());
  };

  return (
    <Card className="w-full max-w-6xl">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevMonth}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-xl font-semibold">
              {format(currentMonth, 'yyyy년 M월', { locale: ko })}
            </h2>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNextMonth}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleToday}
            className="h-8"
          >
            오늘
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-px bg-muted rounded-lg overflow-hidden">
          {/* 요일 헤더 */}
          {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
            <div
              key={day}
              className={cn(
                "p-2 text-center text-sm font-medium bg-background",
                index === 0 && "text-red-500",
                index === 6 && "text-blue-500"
              )}
            >
              {day}
            </div>
          ))}

          {/* 날짜 그리드 */}
          {weeks.map((week, weekIndex) => (
            week.map((day, dayIndex) => {
              const dateKey = day.getTime() === 0 ? null : format(day, 'yyyy-MM-dd');
              const dayTodos = dateKey ? todosByDate[dateKey] || [] : [];
              const isCurrentMonth = day.getTime() !== 0 && isSameMonth(day, currentMonth);
              const isTodayDate = day.getTime() !== 0 && isToday(day);
              
              return (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  className={cn(
                    "min-h-[100px] p-2 bg-background border-t",
                    !isCurrentMonth && "opacity-0",
                    isTodayDate && "bg-blue-50 dark:bg-blue-950/20",
                    dayIndex === 0 && "border-l",
                    dayIndex === 6 && "border-r",
                    weekIndex === weeks.length - 1 && "border-b"
                  )}
                >
                  {isCurrentMonth && (
                    <>
                      <div className={cn(
                        "text-sm font-medium mb-1",
                        dayIndex === 0 && "text-red-500",
                        dayIndex === 6 && "text-blue-500",
                        isTodayDate && "text-blue-600 dark:text-blue-400"
                      )}>
                        {format(day, 'd')}
                      </div>
                      <div className="space-y-1">
                        {dayTodos.slice(0, 3).map((todo) => (
                          <div
                            key={todo.id}
                            className={cn(
                              "text-xs p-1 rounded cursor-pointer truncate",
                              "bg-yellow-100 dark:bg-yellow-900/30 hover:bg-yellow-200 dark:hover:bg-yellow-900/50",
                              "text-yellow-900 dark:text-yellow-200"
                            )}
                            onClick={() => onEditTodo(todo.id)}
                            title={todo.text}
                          >
                            {todo.focusPriority && (
                              <span className="inline-block w-4 h-4 rounded-full bg-yellow-500 text-white text-[10px] text-center mr-1">
                                {todo.focusPriority}
                              </span>
                            )}
                            {todo.text}
                          </div>
                        ))}
                        {dayTodos.length > 3 && (
                          <div className="text-xs text-muted-foreground pl-1">
                            +{dayTodos.length - 3}개 더
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })
          ))}
        </div>
      </div>
    </Card>
  );
}
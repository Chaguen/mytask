"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, List, Star, Eye, EyeOff, CheckCircle2, Timer } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

interface TodoToolbarProps {
  view: 'list' | 'calendar';
  onViewChange: (view: 'list' | 'calendar') => void;
  showCompleted: boolean;
  onToggleShowCompleted: () => void;
  showOnlyFocusTasks: boolean;
  onToggleShowOnlyFocusTasks: () => void;
  onToggleTimerSidebar?: () => void;
  hasActiveTimer?: boolean;
  stats: {
    total: number;
    completed: number;
    focusTasksCount: number;
    todayCompleted: number;
  };
}

export function TodoToolbar({
  view,
  onViewChange,
  showCompleted,
  onToggleShowCompleted,
  showOnlyFocusTasks,
  onToggleShowOnlyFocusTasks,
  onToggleTimerSidebar,
  hasActiveTimer = false,
  stats,
}: TodoToolbarProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);
  return (
    <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-2">
        <div className="flex items-center rounded-lg border bg-muted p-1">
          <Button
            variant={view === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewChange('list')}
            className="h-8 px-3"
          >
            <List className="h-4 w-4 mr-2" />
            리스트
          </Button>
          <Button
            variant={view === 'calendar' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewChange('calendar')}
            className="h-8 px-3"
          >
            <Calendar className="h-4 w-4 mr-2" />
            캘린더
          </Button>
        </div>

        <div className="h-8 w-px bg-border" />
        
        <Button
          variant={showOnlyFocusTasks ? "secondary" : "ghost"}
          size="sm"
          onClick={onToggleShowOnlyFocusTasks}
          className="h-8 px-3"
        >
          <Star className="h-4 w-4 mr-2" />
          집중 모드
          {stats.focusTasksCount > 0 && (
            <span className="ml-2 rounded-full bg-yellow-500 px-1.5 py-0.5 text-xs text-white">
              {stats.focusTasksCount}
            </span>
          )}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleShowCompleted}
          className="h-8 px-3"
        >
          {showCompleted ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
          {showCompleted ? '완료 숨기기' : '완료 보기'}
        </Button>

        {onToggleTimerSidebar && (
          <>
            <div className="h-8 w-px bg-border" />
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleTimerSidebar}
              className={`h-8 px-3 ${hasActiveTimer ? 'text-red-500' : ''}`}
            >
              <Timer className="h-4 w-4 mr-2" />
              타이머 통계
              {hasActiveTimer && (
                <span className="ml-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              )}
            </Button>
          </>
        )}
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">오늘 완료</span>
              <span className="text-sm font-semibold text-foreground">{stats.todayCompleted}개</span>
            </div>
          </div>
          
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">전체 진행</span>
            <span className="text-sm font-semibold text-foreground">
              {stats.completed}/{stats.total}
            </span>
          </div>
        </div>
        
        <div className="h-10 w-px bg-border" />
        
        <div className="flex flex-col items-end">
          <div className="text-lg font-semibold text-foreground">
            {format(currentTime, 'a h:mm:ss', { locale: ko })}
          </div>
          <div className="text-xs text-muted-foreground">
            {format(currentTime, 'yyyy년 M월 d일 EEEE', { locale: ko })}
          </div>
        </div>
      </div>
    </div>
  );
}
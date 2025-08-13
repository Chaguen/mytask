"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, List, Star, Eye, EyeOff, Timer, CalendarDays, Infinity } from "lucide-react";
import { format } from "date-fns";
import { ViewMode } from "@/hooks/useTodos";

interface TodoToolbarProps {
  view: 'list' | 'calendar';
  onViewChange: (view: 'list' | 'calendar') => void;
  showCompleted: boolean;
  onToggleShowCompleted: () => void;
  showOnlyFocusTasks: boolean;
  onToggleShowOnlyFocusTasks: () => void;
  onToggleTimerSidebar?: () => void;
  hasActiveTimer?: boolean;
  viewMode: ViewMode;
  onToggleViewMode: () => void;
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
  viewMode,
  onToggleViewMode,
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
    <div className="flex items-center justify-between px-4 py-2 border-b">
      {/* 왼쪽: 필수 토글만 */}
      <div className="flex items-center gap-1">
        <Button
          variant={viewMode === 'today' ? "default" : "ghost"}
          size="icon"
          onClick={onToggleViewMode}
          className="h-8 w-8"
          title={viewMode === 'today' ? '전체 보기' : '오늘만 보기'}
        >
          {viewMode === 'today' ? <CalendarDays className="h-4 w-4" /> : <Infinity className="h-4 w-4" />}
        </Button>
        
        <Button
          variant={showOnlyFocusTasks ? "default" : "ghost"}
          size="icon"
          onClick={onToggleShowOnlyFocusTasks}
          className="h-8 w-8"
          title={`집중 모드 ${stats.focusTasksCount > 0 ? `(${stats.focusTasksCount})` : ''}`}
        >
          <Star className={`h-4 w-4 ${stats.focusTasksCount > 0 ? 'fill-current' : ''}`} />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleShowCompleted}
          className="h-8 w-8"
          title={showCompleted ? '완료 숨기기' : '완료 보기'}
        >
          {showCompleted ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </Button>

        <Button
          variant={view === 'calendar' ? "default" : "ghost"}
          size="icon"
          onClick={() => onViewChange(view === 'list' ? 'calendar' : 'list')}
          className="h-8 w-8"
          title={view === 'list' ? '캘린더 보기' : '리스트 보기'}
        >
          {view === 'list' ? <Calendar className="h-4 w-4" /> : <List className="h-4 w-4" />}
        </Button>

        {onToggleTimerSidebar && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleTimerSidebar}
            className="h-8 w-8"
            title="타이머 통계"
          >
            <Timer className={`h-4 w-4 ${hasActiveTimer ? 'text-red-500' : ''}`} />
          </Button>
        )}
      </div>

      {/* 오른쪽: 시계와 진행률만 */}
      <div className="flex items-center gap-4 text-sm">
        <span className="text-muted-foreground">
          {stats.completed}/{stats.total}
        </span>
        <span className="font-medium">
          {format(currentTime, 'HH:mm')}
        </span>
      </div>
    </div>
  );
}
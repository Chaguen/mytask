"use client";

import { useState } from "react";
import { TodoList } from "@/components/todo/TodoList";
import { CalendarView } from "@/components/todo/CalendarView";
import { TodoToolbar } from "@/components/todo/TodoToolbar";
import { TodoErrorBoundary } from "@/components/todo/TodoErrorBoundary";
import { FloatingTimer } from "@/components/timer/FloatingTimer";
import { TimerSidebar } from "@/components/timer/TimerSidebar";
import { useTodoContext } from "@/contexts/TodoContext";
import { useTimerContext } from "@/contexts/TimerContext";

export default function Home() {
  const { 
    stats, 
    todos,
    showCompleted,
    toggleShowCompleted,
    showOnlyFocusTasks,
    toggleShowOnlyFocusTasks,
    toggleTodo,
    setTodoEditing,
    viewMode,
    toggleViewMode,
  } = useTodoContext();
  
  const { activeTimer, stopTimer, todaySessions } = useTimerContext();
  
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [showTimerSidebar, setShowTimerSidebar] = useState(false);
  
  return (
    <div className="min-h-screen flex flex-col">
      <TodoToolbar
        view={view}
        onViewChange={setView}
        showCompleted={showCompleted}
        onToggleShowCompleted={toggleShowCompleted}
        showOnlyFocusTasks={showOnlyFocusTasks}
        onToggleShowOnlyFocusTasks={toggleShowOnlyFocusTasks}
        onToggleTimerSidebar={() => setShowTimerSidebar(!showTimerSidebar)}
        hasActiveTimer={!!activeTimer}
        viewMode={viewMode}
        onToggleViewMode={toggleViewMode}
        stats={stats}
      />
      
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <TodoErrorBoundary>
          {view === 'list' ? (
            <TodoList />
          ) : (
            <CalendarView 
              todos={todos}
              onToggleTodo={toggleTodo}
              onEditTodo={(id, parentIds) => setTodoEditing(id, true, parentIds)}
            />
          )}
        </TodoErrorBoundary>
      </main>
      
      <FloatingTimer 
        activeTimer={activeTimer}
        onStop={stopTimer}
      />
      
      <TimerSidebar
        isOpen={showTimerSidebar}
        onClose={() => setShowTimerSidebar(false)}
        sessions={todaySessions}
        activeTimer={activeTimer}
      />
    </div>
  );
}
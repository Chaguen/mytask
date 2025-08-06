"use client";

import { useState } from "react";
import { TodoList } from "@/components/todo/TodoList";
import { CalendarView } from "@/components/todo/CalendarView";
import { TodoToolbar } from "@/components/todo/TodoToolbar";
import { TodoErrorBoundary } from "@/components/todo/TodoErrorBoundary";
import { useTodoContext } from "@/contexts/TodoContext";

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
  } = useTodoContext();
  
  const [view, setView] = useState<'list' | 'calendar'>('list');
  
  return (
    <div className="min-h-screen flex flex-col">
      <TodoToolbar
        view={view}
        onViewChange={setView}
        showCompleted={showCompleted}
        onToggleShowCompleted={toggleShowCompleted}
        showOnlyFocusTasks={showOnlyFocusTasks}
        onToggleShowOnlyFocusTasks={toggleShowOnlyFocusTasks}
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
              onEditTodo={setTodoEditing}
            />
          )}
        </TodoErrorBoundary>
      </main>
    </div>
  );
}
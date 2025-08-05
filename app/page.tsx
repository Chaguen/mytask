"use client";

import { TodoList } from "@/components/todo/TodoList";
import { TodoErrorBoundary } from "@/components/todo/TodoErrorBoundary";
import { CurrentTime } from "@/components/CurrentTime";
import { useTodoContext } from "@/contexts/TodoContext";

export default function Home() {
  const { stats } = useTodoContext();
  
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <CurrentTime todayCompleted={stats.todayCompleted} />
      <TodoErrorBoundary>
        <TodoList />
      </TodoErrorBoundary>
    </main>
  );
}

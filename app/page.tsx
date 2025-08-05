import { TodoList } from "@/components/todo/TodoList";
import { TodoErrorBoundary } from "@/components/todo/TodoErrorBoundary";
import { CurrentTime } from "@/components/CurrentTime";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <CurrentTime />
      <TodoErrorBoundary>
        <TodoList />
      </TodoErrorBoundary>
    </main>
  );
}

export interface TimerSession {
  id: string;
  todoId: number;
  todoText: string;
  todoPath?: string[]; // Parent path for nested todos
  startedAt: string; // ISO string
  endedAt?: string; // ISO string
  duration: number; // milliseconds
  date: string; // YYYY-MM-DD for grouping
}

export interface ActiveTimer {
  todoId: number;
  todoText: string;
  todoPath?: string[];
  startedAt: string;
}

export interface DailyTimerStats {
  date: string;
  totalDuration: number;
  sessionCount: number;
  todoBreakdown: {
    todoId: number;
    todoText: string;
    totalDuration: number;
    sessionCount: number;
  }[];
}
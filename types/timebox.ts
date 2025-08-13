export interface TimeboxItem {
  id: string;
  todoId: number;
  startTime: string; // HH:mm format
  duration: number; // in minutes (30, 45, 60, 90, 120, etc.)
  date: string; // YYYY-MM-DD format
}

export interface TimeSlot {
  time: string; // HH:mm format
  hour: number;
  minute: number;
}
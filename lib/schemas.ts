import { z } from 'zod';

const RecurringPatternSchema = z.object({
  type: z.enum(['daily', 'weekly', 'monthly', 'weekdays', 'custom']),
  interval: z.number().optional(),
  daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
  dayOfMonth: z.number().min(1).max(31).optional(),
  endDate: z.string().optional(),
  nextDueDate: z.string().optional(),
});

const BaseTodoSchema = z.object({
  id: z.number(),
  text: z.string(),  // Allow empty string for editing mode
  completed: z.boolean(),
  createdAt: z.string(),
  completedAt: z.string().optional(),
  focusPriority: z.number().min(1).max(5).optional(),
  dueDate: z.string().optional(),
  isEditing: z.boolean().optional(),
  timeSpent: z.number().optional(),
  isTimerRunning: z.boolean().optional(),
  timerStartedAt: z.string().optional(),
  recurringPattern: RecurringPatternSchema.optional(),
  isRecurring: z.boolean().optional(),
  parentRecurringId: z.number().optional(),
  difficulty: z.enum(['easy', 'normal', 'hard']).optional(),
});

export type TodoInput = z.infer<typeof BaseTodoSchema>;

export const TodoSchema: z.ZodType<TodoInput> = BaseTodoSchema.extend({
  subtasks: z.lazy(() => z.array(TodoSchema).optional()),
});

export const TodosArraySchema = z.array(TodoSchema);

export function validateTodos(data: unknown): TodoInput[] {
  return TodosArraySchema.parse(data);
}

export function validateTodo(data: unknown): TodoInput {
  return TodoSchema.parse(data);
}
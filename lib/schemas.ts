import { z } from 'zod';

const BaseTodoSchema = z.object({
  id: z.number(),
  text: z.string().min(1),
  completed: z.boolean(),
  createdAt: z.string(),
  completedAt: z.string().optional(),
  focusPriority: z.number().min(1).max(5).optional(),
  dueDate: z.string().optional(),
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
import { Todo } from '@/types/todo';

export class TodoAPIClient {
  private baseUrl = '/api/todos';

  async getTodos(): Promise<Todo[]> {
    try {
      const response = await fetch(this.baseUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch todos: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching todos:', error);
      throw error;
    }
  }

  async saveTodos(todos: Todo[]): Promise<void> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(todos),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save todos: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error saving todos:', error);
      throw error;
    }
  }
}

export const todoAPI = new TodoAPIClient();
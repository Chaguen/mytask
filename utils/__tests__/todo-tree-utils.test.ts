import { describe, it, expect } from 'vitest';
import {
  traverseTodoTree,
  findTodoByPath,
  updateTodoByPath,
  removeTodoByPath,
  addSubtaskByPath,
  flattenTodoTree,
  pathsEqual,
  getTodoTreeStats
} from '../todo-tree-utils';
import { Todo } from '@/types/todo';

describe('todo-tree-utils', () => {
  const mockTodos: Todo[] = [
    {
      id: 1,
      text: 'Todo 1',
      completed: false,
      createdAt: '2024-01-01',
      subtasks: [
        {
          id: 11,
          text: 'Subtask 1.1',
          completed: true,
          createdAt: '2024-01-01',
          subtasks: [
            {
              id: 111,
              text: 'Subtask 1.1.1',
              completed: false,
              createdAt: '2024-01-01'
            }
          ]
        },
        {
          id: 12,
          text: 'Subtask 1.2',
          completed: false,
          createdAt: '2024-01-01'
        }
      ]
    },
    {
      id: 2,
      text: 'Todo 2',
      completed: true,
      createdAt: '2024-01-01'
    }
  ];

  describe('findTodoByPath', () => {
    it('finds top-level todo', () => {
      const todo = findTodoByPath(mockTodos, [2]);
      expect(todo).toBeDefined();
      expect(todo?.id).toBe(2);
    });

    it('finds nested todo', () => {
      const todo = findTodoByPath(mockTodos, [1, 11]);
      expect(todo).toBeDefined();
      expect(todo?.id).toBe(11);
    });

    it('finds deeply nested todo', () => {
      const todo = findTodoByPath(mockTodos, [1, 11, 111]);
      expect(todo).toBeDefined();
      expect(todo?.id).toBe(111);
    });

    it('returns undefined for invalid path', () => {
      const todo = findTodoByPath(mockTodos, [99]);
      expect(todo).toBeUndefined();
    });
  });

  describe('updateTodoByPath', () => {
    it('updates top-level todo', () => {
      const updated = updateTodoByPath(mockTodos, [1], (todo) => ({
        completed: true
      }));
      expect(updated[0].completed).toBe(true);
    });

    it('updates nested todo', () => {
      const updated = updateTodoByPath(mockTodos, [1, 12], (todo) => ({
        completed: true
      }));
      const subtask = updated[0].subtasks?.[1];
      expect(subtask?.completed).toBe(true);
    });
  });

  describe('removeTodoByPath', () => {
    it('removes top-level todo', () => {
      const updated = removeTodoByPath(mockTodos, [2]);
      expect(updated.length).toBe(1);
      expect(updated[0].id).toBe(1);
    });

    it('removes nested todo', () => {
      const updated = removeTodoByPath(mockTodos, [1, 12]);
      expect(updated[0].subtasks?.length).toBe(1);
      expect(updated[0].subtasks?.[0].id).toBe(11);
    });
  });

  describe('flattenTodoTree', () => {
    it('flattens todo tree with correct paths and levels', () => {
      const flattened = flattenTodoTree(mockTodos);
      expect(flattened).toHaveLength(5);
      
      expect(flattened[0]).toMatchObject({
        todo: expect.objectContaining({ id: 1 }),
        path: [1],
        level: 0
      });
      
      expect(flattened[1]).toMatchObject({
        todo: expect.objectContaining({ id: 11 }),
        path: [1, 11],
        level: 1
      });
      
      expect(flattened[2]).toMatchObject({
        todo: expect.objectContaining({ id: 111 }),
        path: [1, 11, 111],
        level: 2
      });
    });
  });

  describe('pathsEqual', () => {
    it('returns true for equal paths', () => {
      expect(pathsEqual([1, 2, 3], [1, 2, 3])).toBe(true);
    });

    it('returns false for different lengths', () => {
      expect(pathsEqual([1, 2], [1, 2, 3])).toBe(false);
    });

    it('returns false for different values', () => {
      expect(pathsEqual([1, 2, 3], [1, 2, 4])).toBe(false);
    });
  });

  describe('getTodoTreeStats', () => {
    it('calculates stats for todo with subtasks', () => {
      const stats = getTodoTreeStats(mockTodos[0]);
      expect(stats).toEqual({
        total: 3,
        completed: 1,
        pending: 2,
        hasSubtasks: true
      });
    });

    it('calculates stats for todo without subtasks', () => {
      const stats = getTodoTreeStats(mockTodos[1]);
      expect(stats).toEqual({
        total: 1,
        completed: 1,
        pending: 0,
        hasSubtasks: false
      });
    });
  });
});
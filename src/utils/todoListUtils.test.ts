import { describe, expect, it } from 'vitest';

import type { TodoList } from '../types';
import {
  copyTodoList,
  createDefaultList,
  getAllUniqueIcons,
  migrateTodoList,
} from './todoListUtils';

describe('todoListUtils', () => {
  describe('migrateTodoList', () => {
    it('should complement icons in tasks', () => {
      const unmigrated: TodoList = {
        id: 'l1',
        title: 'L1',
        tasks: [
          {
            id: 't1',
            name: 'トイレ',
            icon: '',
            plannedSeconds: 300,
            actualSeconds: 0,
            elapsedSeconds: 0,
            kind: 'todo',
            status: 'todo',
          },
        ],
      };
      const migrated = migrateTodoList(unmigrated);
      expect(migrated.tasks[0].icon).not.toBe('');
      expect(migrated.tasks[0].icon).toContain('toilet');
    });
  });

  describe('createDefaultList', () => {
    it('should create a list with default tasks', () => {
      const list = createDefaultList();
      expect(list.title).toBe('あさ');
      expect(list.tasks.length).toBe(2);
      expect(list.tasks[0].name).toBe('トイレ');
      expect(list.tasks[1].name).toBe('あそぶ');
    });
  });

  describe('copyTodoList', () => {
    it('should copy a list with new IDs and status reset', () => {
      const original: TodoList = {
        id: 'l1',
        title: 'Original',
        tasks: [
          {
            id: 't1',
            name: 'T1',
            icon: 'icon1',
            plannedSeconds: 100,
            actualSeconds: 50,
            elapsedSeconds: 50,
            kind: 'todo',
            status: 'done',
          },
          {
            id: 'reward-task',
            name: 'Reward',
            icon: 'icon2',
            plannedSeconds: 200,
            actualSeconds: 0,
            elapsedSeconds: 0,
            kind: 'reward',
            status: 'todo',
          },
        ],
      };
      const copy = copyTodoList(original);
      expect(copy.id).not.toBe(original.id);
      expect(copy.title).toBe('Original (コピー)');
      expect(copy.tasks[0].id).not.toBe(original.tasks[0].id);
      expect(copy.tasks[0].status).toBe('todo');
      expect(copy.tasks[0].elapsedSeconds).toBe(0);
      expect(copy.tasks[1].id).toBe('reward-task'); // reward-task ID should be preserved according to our logic
    });
  });

  describe('getAllUniqueIcons', () => {
    it('should return unique icons from multiple lists', () => {
      const lists: TodoList[] = [
        {
          id: 'l1',
          title: 'L1',
          tasks: [
            {
              id: 't1',
              name: 'T1',
              icon: 'i1',
              plannedSeconds: 0,
              actualSeconds: 0,
              elapsedSeconds: 0,
              kind: 'todo',
              status: 'todo',
            },
          ],
        },
        {
          id: 'l2',
          title: 'L2',
          tasks: [
            {
              id: 't2',
              name: 'T2',
              icon: 'i2',
              plannedSeconds: 0,
              actualSeconds: 0,
              elapsedSeconds: 0,
              kind: 'todo',
              status: 'todo',
            },
          ],
        },
      ];
      const icons = getAllUniqueIcons(lists);
      expect(icons).toContain('i1');
      expect(icons).toContain('i2');
      expect(icons).not.toContain('');
    });
  });
});

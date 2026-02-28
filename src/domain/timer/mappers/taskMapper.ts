import type { Task, TodoList } from '../../../types';
import type { DomainTask, DomainTodoList } from '../model';

export const toDomainTasks = (tasks: Task[]): DomainTask[] => tasks.map((task) => ({ ...task }));

export const toAppTasks = (tasks: DomainTask[]): Task[] => tasks.map((task) => ({ ...task }));

export const toDomainList = (list: TodoList | null): DomainTodoList | null => {
  if (!list) return null;

  return {
    ...list,
    tasks: toDomainTasks(list.tasks),
  };
};

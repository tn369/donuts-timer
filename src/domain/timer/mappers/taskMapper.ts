import type { Task, TodoList } from '../../../types';
import {
  fromAppList,
  fromAppTasks,
  toAppList,
  toAppTasks as toAppTasksByFactory,
} from '../factories/taskFactory';
import type { DomainTask, DomainTodoList } from '../model';

export const toDomainTasks = (tasks: Task[]): DomainTask[] => fromAppTasks(tasks);

export const toAppTasks = (tasks: DomainTask[]): Task[] => toAppTasksByFactory(tasks);

export const toDomainList = (list: TodoList | null): DomainTodoList | null => fromAppList(list);

export const toAppListFromDomain = (list: DomainTodoList | null): TodoList | null =>
  toAppList(list);

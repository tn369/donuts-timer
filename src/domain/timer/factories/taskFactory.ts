import type { RewardTaskSettings, Task, TodoList } from '../../../types';
import type { DomainRewardSettings, DomainTask, DomainTodoList } from '../model';

// App層でrewardSettingsが欠けていても、Domainでは扱える形へ正規化する。
const toDomainRewardSettings = (settings?: RewardTaskSettings): DomainRewardSettings => ({
  mode: settings?.mode ?? 'duration',
  targetHour: settings?.targetHour,
  targetMinute: settings?.targetMinute,
});

const toAppRewardSettings = (settings?: DomainRewardSettings): RewardTaskSettings | undefined => {
  if (!settings) return undefined;

  return {
    mode: settings.mode,
    targetHour: settings.targetHour,
    targetMinute: settings.targetMinute,
  };
};

export const fromAppTask = (task: Task): DomainTask => {
  if (task.kind === 'reward') {
    return {
      ...task,
      kind: 'reward',
      rewardSettings: toDomainRewardSettings(task.rewardSettings),
    };
  }

  return {
    ...task,
    kind: 'todo',
  };
};

export const toAppTask = (task: DomainTask): Task => {
  if (task.kind === 'reward') {
    return {
      ...task,
      kind: 'reward',
      rewardSettings: toAppRewardSettings(task.rewardSettings),
    };
  }

  return {
    ...task,
    kind: 'todo',
  };
};

export const fromAppTasks = (tasks: Task[]): DomainTask[] => tasks.map((task) => fromAppTask(task));

export const toAppTasks = (tasks: DomainTask[]): Task[] => tasks.map((task) => toAppTask(task));

export const fromAppList = (list: TodoList | null): DomainTodoList | null => {
  if (!list) return null;

  return {
    ...list,
    tasks: fromAppTasks(list.tasks),
  };
};

export const toAppList = (list: DomainTodoList | null): TodoList | null => {
  if (!list) return null;

  return {
    ...list,
    tasks: toAppTasks(list.tasks),
  };
};

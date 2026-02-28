import type { DomainRewardTask, DomainTask } from '../model';

export const isDoneTask = (task: DomainTask): boolean => task.status === 'done';

export const isRewardTask = (task: DomainTask): task is DomainRewardTask => task.kind === 'reward';

export const markTaskRunning = (task: DomainTask): DomainTask => {
  if (task.status === 'done') return task;
  return { ...task, status: 'running' };
};

export const markTaskPaused = (task: DomainTask): DomainTask =>
  task.status === 'running' ? { ...task, status: 'paused' } : task;

export const markTaskDone = (task: DomainTask): DomainTask => ({
  ...task,
  status: 'done',
  actualSeconds: task.elapsedSeconds,
});

export const reopenTask = (task: DomainTask): DomainTask => ({
  ...task,
  status: 'todo',
  actualSeconds: 0,
});

export const resetTaskProgress = (task: DomainTask): DomainTask => ({
  ...task,
  status: 'todo',
  elapsedSeconds: 0,
  actualSeconds: 0,
});

export const withElapsedSeconds = (task: DomainTask, elapsedSeconds: number): DomainTask => ({
  ...task,
  elapsedSeconds,
});

export const canSelectRewardTaskAtIndex = (tasks: DomainTask[], index: number): boolean => {
  if (index < 0 || index >= tasks.length) return false;
  // ごほうびタスクは「先行タスクをすべて完了してから」の制約を表現する。
  return !tasks.slice(0, index).some((task) => task.status !== 'done');
};

export const isTaskSelectable = (tasks: DomainTask[], taskId: string): boolean => {
  const index = tasks.findIndex((task) => task.id === taskId);
  if (index === -1) return false;

  const task = tasks[index];
  if (task.status === 'done') return true;
  if (task.kind !== 'reward') return true;

  return canSelectRewardTaskAtIndex(tasks, index);
};

export const getNextIncompleteTaskId = (
  tasks: DomainTask[],
  currentIndex: number
): string | null => {
  const nextIncomplete = tasks.slice(currentIndex + 1).find((task) => task.status !== 'done');
  const allIncomplete = tasks.filter((task) => task.status !== 'done');

  if (nextIncomplete) {
    if (nextIncomplete.kind === 'reward') {
      // 直後がごほうびでも、未完了のtodoが残っている間は先にtodoへ戻す。
      const hasOtherTodo = tasks.some(
        (task) => task.status !== 'done' && task.kind === 'todo' && task.id !== nextIncomplete.id
      );
      return hasOtherTodo ? allIncomplete[0].id : nextIncomplete.id;
    }

    return nextIncomplete.id;
  }

  return allIncomplete.length > 0 ? allIncomplete[0].id : null;
};

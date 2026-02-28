import type { DomainTask, DomainTimerSession } from '../model';

export type RestoredSession = DomainTimerSession;

export const mergeRestoredTasks = (
  currentTasks: DomainTask[],
  savedTasks: DomainTask[]
): DomainTask[] => {
  if (currentTasks.length === 0) {
    return savedTasks;
  }

  return currentTasks.map((task) => {
    const savedTask = savedTasks.find((candidate) => candidate.id === task.id);
    if (!savedTask) return task;

    return {
      ...task,
      status: savedTask.status,
      elapsedSeconds: savedTask.elapsedSeconds,
      actualSeconds: savedTask.actualSeconds,
    };
  });
};

export const resolveRestoredSelection = (
  tasks: DomainTask[],
  selectedTaskId: string | null,
  isTimerRunning: boolean
): Pick<RestoredSession, 'selectedTaskId' | 'isTimerRunning'> => {
  const finalSelectedTaskId = tasks.some((task) => task.id === selectedTaskId)
    ? selectedTaskId
    : null;
  const finalIsTimerRunning = !!(finalSelectedTaskId && isTimerRunning);

  return {
    selectedTaskId: finalSelectedTaskId,
    isTimerRunning: finalIsTimerRunning,
  };
};

export const restoreSession = (
  currentTasks: DomainTask[],
  savedTasks: DomainTask[],
  selectedTaskId: string | null,
  isTimerRunning: boolean
): RestoredSession => {
  const mergedTasks = mergeRestoredTasks(currentTasks, savedTasks);
  const selection = resolveRestoredSelection(mergedTasks, selectedTaskId, isTimerRunning);

  return {
    tasks: mergedTasks,
    selectedTaskId: selection.selectedTaskId,
    isTimerRunning: selection.isTimerRunning,
  };
};

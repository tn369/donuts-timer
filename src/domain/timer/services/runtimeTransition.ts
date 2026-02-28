import {
  getNextIncompleteTaskId,
  markTaskDone,
  markTaskPaused,
  markTaskRunning,
  reopenTask,
  resetTaskProgress,
  withElapsedSeconds,
} from '../entities/taskEntity';
import type { DomainTask, DomainTodoList } from '../model';
import { getBaseRewardSeconds, updateRewardTime } from '../policies/rewardPolicy';
import { canSelectRewardTaskAtIndex } from '../policies/selectabilityPolicy';
import { restoreSession } from './sessionTransition';

export interface DomainRuntimeState {
  tasks: DomainTask[];
  selectedTaskId: string | null;
  isTimerRunning: boolean;
  lastTickTimestamp: number | null;
}

const recalculateReward = (
  tasks: DomainTask[],
  activeList: DomainTodoList | null,
  now?: Date
): DomainTask[] => {
  const baseRewardSeconds = getBaseRewardSeconds(activeList);
  return updateRewardTime(tasks, baseRewardSeconds, now);
};

export const tickRuntime = (
  state: DomainRuntimeState,
  now: number,
  activeList: DomainTodoList | null
): DomainRuntimeState => {
  if (!state.isTimerRunning || !state.selectedTaskId || state.lastTickTimestamp === null) {
    return state;
  }

  const deltaMs = now - state.lastTickTimestamp;
  const deltaSeconds = Math.floor(deltaMs / 1000);

  if (deltaSeconds < 1) {
    return state;
  }

  const currentIndex = state.tasks.findIndex((task) => task.id === state.selectedTaskId);
  const task = state.tasks[currentIndex];

  if (currentIndex === -1 || task.status !== 'running') {
    return state;
  }

  const newElapsed = task.elapsedSeconds + deltaSeconds;
  let updatedTasks = state.tasks.map((candidate) =>
    candidate.id === state.selectedTaskId ? withElapsedSeconds(candidate, newElapsed) : candidate
  );

  updatedTasks = recalculateReward(updatedTasks, activeList);

  const updatedTask = updatedTasks.find((candidate) => candidate.id === state.selectedTaskId);
  if (updatedTask?.kind === 'reward' && updatedTask.elapsedSeconds >= updatedTask.plannedSeconds) {
    updatedTasks = updatedTasks.map((candidate) =>
      candidate.id === state.selectedTaskId ? markTaskDone(candidate) : candidate
    );

    return {
      ...state,
      tasks: updatedTasks,
      isTimerRunning: false,
      lastTickTimestamp: null,
    };
  }

  return {
    ...state,
    tasks: updatedTasks,
    lastTickTimestamp: state.lastTickTimestamp + deltaSeconds * 1000,
  };
};

const handleDoneTaskClick = (state: DomainRuntimeState, taskId: string): DomainRuntimeState => {
  let updatedTasks = [...state.tasks];

  if (state.selectedTaskId) {
    updatedTasks = updatedTasks.map((task) =>
      task.id === state.selectedTaskId ? markTaskPaused(task) : task
    );
  }

  updatedTasks = updatedTasks.map((task) => (task.id === taskId ? reopenTask(task) : task));

  return {
    ...state,
    tasks: updatedTasks,
    selectedTaskId: taskId,
    isTimerRunning: state.isTimerRunning,
  };
};

const handleActiveTaskClick = (state: DomainRuntimeState): DomainRuntimeState => {
  if (!state.selectedTaskId) {
    return state;
  }

  const tappedIndex = state.tasks.findIndex((task) => task.id === state.selectedTaskId);
  if (tappedIndex === -1) {
    return state;
  }

  const tappedTask = state.tasks[tappedIndex];
  const updatedTasks = [...state.tasks];
  let nextTaskIdToSelect: string | null = state.selectedTaskId;
  let nextIsTimerRunning = state.isTimerRunning;

  if (state.isTimerRunning) {
    updatedTasks[tappedIndex] = markTaskDone(tappedTask);

    nextTaskIdToSelect = getNextIncompleteTaskId(updatedTasks, tappedIndex);
    if (!nextTaskIdToSelect) {
      nextIsTimerRunning = false;
    }
  } else {
    nextIsTimerRunning = true;
  }

  return {
    ...state,
    tasks: updatedTasks,
    selectedTaskId: nextTaskIdToSelect,
    isTimerRunning: nextIsTimerRunning,
  };
};

const handleTodoTaskClick = (state: DomainRuntimeState, taskId: string): DomainRuntimeState => {
  const tappedIndex = state.tasks.findIndex((task) => task.id === taskId);
  if (tappedIndex === -1) {
    return state;
  }

  const tappedTask = state.tasks[tappedIndex];
  let updatedTasks = [...state.tasks];

  if (tappedTask.kind === 'reward' && !canSelectRewardTaskAtIndex(updatedTasks, tappedIndex)) {
    return state;
  }

  if (state.selectedTaskId) {
    updatedTasks = updatedTasks.map((task) =>
      task.id === state.selectedTaskId ? markTaskPaused(task) : task
    );
  }

  return {
    ...state,
    tasks: updatedTasks,
    selectedTaskId: taskId,
    isTimerRunning: true,
  };
};

export const selectTaskRuntime = (
  state: DomainRuntimeState,
  taskId: string,
  now: number,
  activeList: DomainTodoList | null
): DomainRuntimeState => {
  const tappedTask = state.tasks.find((task) => task.id === taskId);
  if (!tappedTask) {
    return state;
  }

  const isCurrentTapped = taskId === state.selectedTaskId;

  let transitioned: DomainRuntimeState;
  if (tappedTask.status === 'done') {
    transitioned = handleDoneTaskClick(state, taskId);
  } else if (isCurrentTapped) {
    transitioned = handleActiveTaskClick(state);
  } else {
    transitioned = handleTodoTaskClick(state, taskId);
  }

  if (transitioned === state) {
    return state;
  }

  let updatedTasks = recalculateReward(transitioned.tasks, activeList);

  if (transitioned.selectedTaskId && transitioned.isTimerRunning) {
    updatedTasks = updatedTasks.map((task) =>
      task.id === transitioned.selectedTaskId ? markTaskRunning(task) : task
    );
  }

  return {
    ...transitioned,
    tasks: updatedTasks,
    lastTickTimestamp: transitioned.isTimerRunning ? now : null,
  };
};

export const startRuntime = (state: DomainRuntimeState, now: number): DomainRuntimeState => {
  let targetTaskId = state.selectedTaskId;

  if (!targetTaskId) {
    const firstIncomplete = state.tasks.find((task) => task.status !== 'done');
    if (!firstIncomplete) {
      return state;
    }
    targetTaskId = firstIncomplete.id;
  }

  const updatedTasks = state.tasks.map((task) =>
    task.id === targetTaskId ? markTaskRunning(task) : task
  );

  return {
    ...state,
    tasks: updatedTasks,
    selectedTaskId: targetTaskId,
    isTimerRunning: true,
    lastTickTimestamp: now,
  };
};

export const stopRuntime = (state: DomainRuntimeState): DomainRuntimeState => ({
  ...state,
  tasks: state.tasks.map((task) => markTaskPaused(task)),
  isTimerRunning: false,
  lastTickTimestamp: null,
});

export const resetRuntime = (
  state: DomainRuntimeState,
  activeList: DomainTodoList | null
): DomainRuntimeState => {
  if (!activeList) {
    return state;
  }

  const resetTasks = activeList.tasks.map((task) => resetTaskProgress(task));

  return {
    ...state,
    tasks: recalculateReward(resetTasks, activeList),
    selectedTaskId: null,
    isTimerRunning: false,
    lastTickTimestamp: null,
  };
};

export const applyActiveListRuntime = (
  state: DomainRuntimeState,
  list: DomainTodoList
): DomainRuntimeState => {
  const updatedTasks = list.tasks.map((newTask) => {
    const existingTask = state.tasks.find((task) => task.id === newTask.id);
    if (existingTask) {
      return {
        ...newTask,
        status: existingTask.status,
        elapsedSeconds: existingTask.elapsedSeconds,
        actualSeconds: existingTask.actualSeconds,
      };
    }

    return resetTaskProgress(newTask);
  });

  return {
    ...state,
    tasks: recalculateReward(updatedTasks, list),
  };
};

export const initRuntimeFromList = (list: DomainTodoList): DomainRuntimeState => {
  const initializedTasks = list.tasks.map((task) => resetTaskProgress(task));

  return {
    tasks: recalculateReward(initializedTasks, list),
    selectedTaskId: null,
    isTimerRunning: false,
    lastTickTimestamp: null,
  };
};

export const fastForwardRuntime = (
  state: DomainRuntimeState,
  activeList: DomainTodoList | null
): DomainRuntimeState => {
  if (!state.selectedTaskId) {
    return state;
  }

  const currentIndex = state.tasks.findIndex((task) => task.id === state.selectedTaskId);
  if (currentIndex === -1) {
    return state;
  }

  const task = state.tasks[currentIndex];
  if (task.status === 'done') {
    return state;
  }

  const skipAmount = Math.max(10, Math.floor(task.plannedSeconds * 0.1));
  const newElapsed = Math.min(task.plannedSeconds, task.elapsedSeconds + skipAmount);

  const updatedTasks = state.tasks.map((candidate) =>
    candidate.id === state.selectedTaskId ? withElapsedSeconds(candidate, newElapsed) : candidate
  );

  return {
    ...state,
    tasks: recalculateReward(updatedTasks, activeList),
  };
};

export const reorderTasksRuntime = (
  state: DomainRuntimeState,
  fromIndex: number,
  toIndex: number,
  activeList: DomainTodoList | null
): DomainRuntimeState => {
  if (
    fromIndex < 0 ||
    fromIndex >= state.tasks.length ||
    toIndex < 0 ||
    toIndex >= state.tasks.length ||
    fromIndex === toIndex
  ) {
    return state;
  }

  const newTasks = [...state.tasks];
  const [movedTask] = newTasks.splice(fromIndex, 1);
  newTasks.splice(toIndex, 0, movedTask);

  return {
    ...state,
    tasks: recalculateReward(newTasks, activeList),
  };
};

export const restoreRuntime = (
  state: DomainRuntimeState,
  restorable: DomainRuntimeState,
  activeList: DomainTodoList | null
): DomainRuntimeState => {
  const restored = restoreSession(
    state.tasks,
    restorable.tasks,
    restorable.selectedTaskId,
    restorable.isTimerRunning
  );

  return {
    tasks: recalculateReward(restored.tasks, activeList),
    selectedTaskId: restored.selectedTaskId,
    isTimerRunning: restored.isTimerRunning,
    lastTickTimestamp: restorable.lastTickTimestamp,
  };
};

export const refreshRewardRuntime = (
  state: DomainRuntimeState,
  activeList: DomainTodoList | null
): DomainRuntimeState => ({
  ...state,
  tasks: recalculateReward(state.tasks, activeList),
});

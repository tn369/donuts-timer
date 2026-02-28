import {
  canSelectRewardTaskAtIndex as canSelectRewardTaskAtIndexByEntity,
  isTaskSelectable as isTaskSelectableByEntity,
} from '../entities/taskEntity';
import type { DomainTask } from '../model';

export const canSelectRewardTaskAtIndex = (tasks: DomainTask[], index: number): boolean =>
  canSelectRewardTaskAtIndexByEntity(tasks, index);

export const isTaskSelectable = (tasks: DomainTask[], taskId: string): boolean =>
  isTaskSelectableByEntity(tasks, taskId);

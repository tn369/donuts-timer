import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { TodoList } from '../../types';
import type { useTaskTimer } from '../../useTaskTimer';
import { MainTimerView } from './MainTimerView';

// useTaskTimer のモック
const mockUseTaskTimer = vi.fn();
vi.mock('../../useTaskTimer', () => ({
  useTaskTimer: () => mockUseTaskTimer() as ReturnType<typeof useTaskTimer>,
}));

// useWindowSize のモック
vi.mock('../../hooks/useWindowSize', () => ({
  useWindowSize: () => ({ width: 1024, height: 768 }),
}));

// useTaskEffects のモック（副作用を抑制）
vi.mock('../../hooks/useTaskEffects', () => ({
  useTaskEffects: vi.fn(),
}));

describe('MainTimerView', () => {
  const mockInitialList: TodoList = {
    id: 'list-1',
    title: 'Test List',
    tasks: [],
    targetTimeSettings: { mode: 'duration', targetHour: 0, targetMinute: 0 },
    timerSettings: { shape: 'circle', color: 'blue' },
  };

  const defaultTimerState = {
    tasks: [
      {
        id: 't1',
        name: 'Task 1',
        status: 'todo',
        plannedSeconds: 300,
        elapsedSeconds: 0,
        kind: 'todo',
      },
      {
        id: 't2',
        name: 'Task 2',
        status: 'todo',
        plannedSeconds: 300,
        elapsedSeconds: 0,
        kind: 'todo',
      },
    ],
    activeList: mockInitialList,
    selectedTaskId: null,
    isTaskSelectable: () => true,
    selectTask: vi.fn(),
    startTimer: vi.fn(),
    stopTimer: vi.fn(),
    reset: vi.fn(),
    initList: vi.fn(),
    timerSettings: { shape: 'circle', color: 'blue' },
    setTimerSettings: vi.fn(),
    fastForward: vi.fn(),
    resumeSession: vi.fn(),
    cancelResume: vi.fn(),
    pendingRestorableState: null,
    reorderTasks: vi.fn(),
  };

  const defaultProps = {
    initialList: mockInitialList,
    onBackToSelection: vi.fn(),
    onEditSettings: vi.fn(),
  };

  it('初期レンダリングでタスクが表示されること', () => {
    mockUseTaskTimer.mockReturnValue(defaultTimerState);
    render(<MainTimerView {...defaultProps} />);

    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
  });

  it('タスクをクリックすると selectTask が呼ばれること', () => {
    mockUseTaskTimer.mockReturnValue(defaultTimerState);
    render(<MainTimerView {...defaultProps} />);

    // ラベルやテキストで特定
    fireEvent.click(screen.getByText('Task 1'));
    expect(defaultTimerState.selectTask).toHaveBeenCalledWith('t1');
  });

  it('スタートボタンをクリックすると startTimer が呼ばれること', () => {
    mockUseTaskTimer.mockReturnValue(defaultTimerState);
    render(<MainTimerView {...defaultProps} />);

    fireEvent.click(screen.getByText('スタート'));
    expect(defaultTimerState.startTimer).toHaveBeenCalled();
  });

  it('タイマー実行中に「ストップ」ボタンが表示され、クリックすると stopTimer が呼ばれること', () => {
    const runningState = {
      ...defaultTimerState,
      selectedTaskId: 't1',
      tasks: [{ ...defaultTimerState.tasks[0], status: 'running' }, defaultTimerState.tasks[1]],
    };
    mockUseTaskTimer.mockReturnValue(runningState);
    render(<MainTimerView {...defaultProps} />);

    const stopButton = screen.getByText('ストップ');
    expect(stopButton).toBeInTheDocument();
    fireEvent.click(stopButton);
    expect(runningState.stopTimer).toHaveBeenCalled();
  });
});

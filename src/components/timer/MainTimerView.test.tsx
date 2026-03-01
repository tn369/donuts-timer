import { act, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as storage from '../../storage';
import type { TodoList } from '../../types';
import { MainTimerView } from './MainTimerView';

// Mock storage and effects
// ストレージと副作用をモック化
vi.mock('../../storage', () => ({
  loadExecutionState: vi.fn(),
  saveExecutionState: vi.fn(),
  clearExecutionState: vi.fn(),
  loadUiSettings: vi.fn(() => ({
    countdownWarningEnabled: true,
  })),
}));

vi.mock('../../hooks/useTaskEffects', () => ({
  useTaskEffects: vi.fn(),
}));

const mockUseCountdownWarning = vi.fn<() => string | null>(() => null);
vi.mock('../../hooks/useCountdownWarning', () => ({
  useCountdownWarning: () => mockUseCountdownWarning(),
}));

// Mock sound effects
// 効果音をモック化
vi.mock('../../utils/sound', () => ({
  playBeep: vi.fn(),
  playReward: vi.fn(),
}));

describe('MainTimerView Integration', () => {
  const mockList: TodoList = {
    id: 'l1',
    title: 'Test List',
    tasks: [
      {
        id: 't1',
        name: 'Task 1',
        icon: 'i1',
        plannedSeconds: 10,
        actualSeconds: 0,
        elapsedSeconds: 0,
        kind: 'todo',
        status: 'todo',
      },
      {
        id: 't2',
        name: 'Task 2',
        icon: 'i2',
        plannedSeconds: 20,
        actualSeconds: 0,
        elapsedSeconds: 0,
        kind: 'todo',
        status: 'todo',
      },
    ],
    targetTimeSettings: { mode: 'duration', targetHour: 0, targetMinute: 0 },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCountdownWarning.mockReturnValue(null);
    vi.mocked(storage.loadExecutionState).mockReturnValue(null);
  });

  it('should initialize with the provided list and display the task name', () => {
    // 提供されたリストで初期化され、タスク名が表示されること
    render(
      <MainTimerView initialList={mockList} onBackToSelection={vi.fn()} onEditSettings={vi.fn()} />
    );

    expect(screen.getByText('Task 1')).toBeInTheDocument();
  });

  it('should start the timer when the start button is clicked', () => {
    // スタートボタンがクリックされたときにタイマーが開始されること
    render(
      <MainTimerView initialList={mockList} onBackToSelection={vi.fn()} onEditSettings={vi.fn()} />
    );

    const startButton = screen.getByText(/スタート/);

    act(() => {
      startButton.click();
    });

    // In a real test, we might check if useTaskTimer's state changes.
    // Here we check if the button label changed or startTimer was called (indirectly via UI).
    // useTaskTimer wraps the logic, so we test the resulting UI state.
    // タイマーが実行中になると、停止ボタンが表示されるか、ステータスが変わる
    expect(screen.getByText(/やすむ/)).toBeInTheDocument();
  });

  it('should show only the running task while timer is running', () => {
    const { container } = render(
      <MainTimerView initialList={mockList} onBackToSelection={vi.fn()} onEditSettings={vi.fn()} />
    );

    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();

    const startButton = screen.getByText(/スタート/);
    act(() => {
      startButton.click();
    });

    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.queryByText('Task 2')).not.toBeInTheDocument();
    expect(container.querySelector('[class*="singleTaskFocusMode"]')).toBeInTheDocument();
  });

  it('should restore all tasks when timer is stopped', () => {
    render(
      <MainTimerView initialList={mockList} onBackToSelection={vi.fn()} onEditSettings={vi.fn()} />
    );

    const startButton = screen.getByText(/スタート/);
    act(() => {
      startButton.click();
    });
    expect(screen.queryByText('Task 2')).not.toBeInTheDocument();

    const stopButton = screen.getByText(/やすむ/);
    act(() => {
      stopButton.click();
    });

    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
  });

  it('should show the reset confirmation modal when the reset button is clicked', () => {
    // リセットボタンがクリックされたときにリセット確認モーダルが表示されること
    render(
      <MainTimerView initialList={mockList} onBackToSelection={vi.fn()} onEditSettings={vi.fn()} />
    );

    // Open the menu first as the reset button is inside the menu
    // リセットボタンはメニュー内にあるため、まずメニューを開く
    const menuButton = screen.getByRole('button', { name: /メニューをひらく/i });
    act(() => {
      menuButton.click();
    });

    const resetButton = screen.getByRole('button', { name: /リセットする/i });

    act(() => {
      resetButton.click();
    });

    // Check if ResetModal content is visible
    // リセット確認のダイアログが表示されていることを確認
    expect(screen.getByText(/さいしょから やりなおしますか？/)).toBeInTheDocument();
  });

  it('should display countdown warning banner when warning message is provided', () => {
    mockUseCountdownWarning.mockReturnValue('あと 3ふん');

    render(
      <MainTimerView initialList={mockList} onBackToSelection={vi.fn()} onEditSettings={vi.fn()} />
    );

    expect(screen.getByRole('status')).toHaveTextContent('あと 3ふん');
  });

  it('should show reward gain notice on reward card after completing a todo task', () => {
    vi.useFakeTimers();

    const listWithReward: TodoList = {
      ...mockList,
      tasks: [
        {
          id: 't1',
          name: 'はみがき',
          icon: 'i1',
          plannedSeconds: 10,
          actualSeconds: 0,
          elapsedSeconds: 0,
          kind: 'todo',
          status: 'todo',
        },
        {
          id: 'reward-1',
          name: 'あそぶ',
          icon: 'i2',
          plannedSeconds: 60,
          actualSeconds: 0,
          elapsedSeconds: 0,
          kind: 'reward',
          status: 'todo',
        },
      ],
    };

    try {
      render(
        <MainTimerView
          initialList={listWithReward}
          onBackToSelection={vi.fn()}
          onEditSettings={vi.fn()}
        />
      );

      act(() => {
        screen.getByText(/スタート/).click();
      });

      act(() => {
        screen.getByRole('button', { name: /はみがきをできたにする/ }).click();
      });

      expect(screen.getByText(/10びょう ふえたよ！/)).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(2500);
      });

      expect(screen.queryByText(/10びょう ふえたよ！/)).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it('should disable drag handles while timer is running and restore when stopped', () => {
    render(
      <MainTimerView initialList={mockList} onBackToSelection={vi.fn()} onEditSettings={vi.fn()} />
    );

    expect(screen.getAllByLabelText('タスクをならびかえる')).toHaveLength(2);

    act(() => {
      screen.getByText(/スタート/).click();
    });

    expect(screen.queryByLabelText('タスクをならびかえる')).not.toBeInTheDocument();

    act(() => {
      screen.getByText(/やすむ/).click();
    });

    expect(screen.getAllByLabelText('タスクをならびかえる')).toHaveLength(2);
  });

  it('should resume from previous session when resume modal confirm is clicked', async () => {
    vi.mocked(storage.loadExecutionState).mockReturnValue({
      listId: 'l1',
      tasks: [
        {
          ...mockList.tasks[0],
          status: 'paused',
          elapsedSeconds: 4,
        },
      ],
      selectedTaskId: 't1',
      isTimerRunning: false,
      lastTickTimestamp: null,
      mode: 'single',
      isAutoResume: false,
    });

    render(
      <MainTimerView initialList={mockList} onBackToSelection={vi.fn()} onEditSettings={vi.fn()} />
    );

    expect(await screen.findByText('まえのつづきからはじめる？')).toBeInTheDocument();

    act(() => {
      screen.getByText('つづきから').click();
    });

    await waitFor(() => {
      expect(screen.queryByText('まえのつづきからはじめる？')).not.toBeInTheDocument();
    });
    expect(storage.clearExecutionState).not.toHaveBeenCalled();
  });

  it('should clear previous session when resume modal cancel is clicked', async () => {
    vi.mocked(storage.loadExecutionState).mockReturnValue({
      listId: 'l1',
      tasks: [
        {
          ...mockList.tasks[0],
          status: 'paused',
          elapsedSeconds: 4,
        },
      ],
      selectedTaskId: 't1',
      isTimerRunning: false,
      lastTickTimestamp: null,
      mode: 'single',
      isAutoResume: false,
    });

    render(
      <MainTimerView initialList={mockList} onBackToSelection={vi.fn()} onEditSettings={vi.fn()} />
    );

    expect(await screen.findByText('まえのつづきからはじめる？')).toBeInTheDocument();

    act(() => {
      screen.getByText('あたらしく').click();
    });

    expect(storage.clearExecutionState).toHaveBeenCalledWith('l1', 'single');
    await waitFor(() => {
      expect(screen.queryByText('まえのつづきからはじめる？')).not.toBeInTheDocument();
    });
  });
});

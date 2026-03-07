import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { Task } from '../../types';
import { type RewardGainVisualState, TaskCard } from './TaskCard';

const baseTask: Task = {
  id: 'task-1',
  name: 'はみがき',
  icon: '',
  plannedSeconds: 120,
  actualSeconds: 0,
  elapsedSeconds: 10,
  kind: 'todo',
  status: 'todo',
};

describe('TaskCard', () => {
  const rewardGainVisualState: RewardGainVisualState = {
    deltaSeconds: 30,
    previousPlannedSeconds: 90,
    phase: 'message',
  };

  it('選択中かつ実行中のタスクでは「できた！」ボタンを表示する', () => {
    render(
      <TaskCard
        task={{ ...baseTask, status: 'running' }}
        isSelected={true}
        isSelectable={true}
        onSelect={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: /できたにする/ })).toBeInTheDocument();
  });

  it('実行中カードはカード本体クリックでも完了できる', () => {
    const onSelect = vi.fn();
    const { container } = render(
      <TaskCard
        task={{ ...baseTask, status: 'running' }}
        isSelected={true}
        isSelectable={true}
        onSelect={onSelect}
      />
    );

    const card = container.querySelector('[class*="taskCard"]');
    expect(card).toBeTruthy();
    if (card) {
      fireEvent.click(card);
    }

    expect(onSelect).toHaveBeenCalledWith('task-1');
  });

  it('「できた！」ボタンを押すと選択イベントが呼ばれる', () => {
    const onSelect = vi.fn();
    render(
      <TaskCard
        task={{ ...baseTask, status: 'running' }}
        isSelected={true}
        isSelectable={true}
        onSelect={onSelect}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /できたにする/ }));

    expect(onSelect).toHaveBeenCalledWith('task-1');
  });

  it('実行中カードの完了ボタンはタスク情報の後ろに描画される', () => {
    const { container } = render(
      <TaskCard
        task={{ ...baseTask, status: 'running' }}
        isSelected={true}
        isSelectable={true}
        onSelect={vi.fn()}
      />
    );

    const taskTime = container.querySelector('[class*="taskTime"]');
    const completeButton = screen.getByRole('button', { name: /できたにする/ });

    expect(taskTime).toBeTruthy();
    expect(completeButton.compareDocumentPosition(taskTime as Node)).toBe(
      Node.DOCUMENT_POSITION_PRECEDING
    );
  });

  it('ごほうびタスク実行中は「おわり」ボタンを表示する', () => {
    render(
      <TaskCard
        task={{ ...baseTask, kind: 'reward', status: 'running' }}
        isSelected={true}
        isSelectable={true}
        onSelect={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: /おわりにする/ })).toBeInTheDocument();
    expect(screen.getByText('おわり')).toBeInTheDocument();
  });

  it('ごほうび増加メッセージphaseで補助ラベルを表示する', () => {
    const { container } = render(
      <TaskCard
        task={{ ...baseTask, id: 'reward-1', kind: 'reward' }}
        isSelected={false}
        isSelectable={true}
        onSelect={vi.fn()}
        rewardGainVisualState={rewardGainVisualState}
      />
    );

    expect(screen.getByText('30びょう ふえたよ！')).toBeInTheDocument();
    expect(container.querySelector('[data-task-id="reward-1"]')).toBeInTheDocument();
    expect(container.querySelector('[data-timer-anchor="true"]')).toBeInTheDocument();
  });

  it('ごほうび増加メッセージphase以外では補助ラベルを表示しない', () => {
    render(
      <TaskCard
        task={{ ...baseTask, id: 'reward-1', kind: 'reward' }}
        isSelected={false}
        isSelectable={true}
        onSelect={vi.fn()}
        rewardGainVisualState={{ ...rewardGainVisualState, phase: 'overlay' }}
      />
    );

    expect(screen.queryByText('30びょう ふえたよ！')).not.toBeInTheDocument();
  });

  it('ごほうびカードでは表示用plannedSecondsを優先する', () => {
    const { container } = render(
      <TaskCard
        task={{ ...baseTask, id: 'reward-1', kind: 'reward', plannedSeconds: 1200 }}
        isSelected={false}
        isSelectable={true}
        onSelect={vi.fn()}
        rewardGainVisualState={{ ...rewardGainVisualState, phase: 'overlay' }}
      />
    );

    expect(container.querySelectorAll('[data-testid="timer-chunk"]')).toHaveLength(1);
  });
});

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { Task } from '../../types';
import { TaskCard } from './TaskCard';

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
});

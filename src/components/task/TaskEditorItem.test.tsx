import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import type { Task } from '../../types';
import { TaskEditorItem } from './TaskEditorItem';
import styles from './TaskEditorItem.module.css';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      layout: _layout,
      ...props
    }: React.HTMLAttributes<HTMLDivElement> & { layout?: boolean }) => (
      <div {...props}>{children}</div>
    ),
  },
}));

vi.mock('../common/IconSelectorPopup', () => ({
  IconSelectorPopup: () => null,
}));

vi.mock('../common/TimeStepper', () => ({
  TimeStepper: ({ value, unit }: { value: number; unit: string }) => (
    <div>
      {value}
      {unit}
    </div>
  ),
}));

const createTask = (partial: Partial<Task>): Task => ({
  id: partial.id ?? 'task-1',
  name: partial.name ?? 'はみがき',
  icon: partial.icon ?? '',
  plannedSeconds: partial.plannedSeconds ?? 300,
  actualSeconds: partial.actualSeconds ?? 0,
  elapsedSeconds: partial.elapsedSeconds ?? 0,
  kind: partial.kind ?? 'todo',
  status: partial.status ?? 'todo',
  rewardSettings: partial.rewardSettings,
});

const renderTaskEditorItem = (task: Task) =>
  render(
    <TaskEditorItem
      task={task}
      onTaskChange={vi.fn()}
      onRemoveTask={vi.fn()}
      onRewardSettingsChange={vi.fn()}
      allExistingIcons={[]}
    />
  );

describe('TaskEditorItem', () => {
  it('ごほうびタスクは名前入力欄と時間設定を横並びコンテナで表示する', () => {
    const { container } = renderTaskEditorItem(
      createTask({
        id: 'reward-1',
        name: 'ごほうび',
        kind: 'reward',
      })
    );

    const inlineFields = container.querySelector(`.${styles.rewardInlineFields}`);
    const nameGroup = container.querySelector(`.${styles.rewardNameInputGroup}`);
    const info = container.querySelector(`.${styles.taskEditorInfo}`);

    expect(inlineFields).toBeInTheDocument();
    expect(nameGroup).toBeInTheDocument();
    expect(info).toHaveClass(styles.rewardTaskEditorInfo);
    expect(screen.getByDisplayValue('ごほうび')).toBeInTheDocument();
  });

  it('通常タスクではごほうび専用の横並びレイアウトを適用しない', () => {
    const { container } = renderTaskEditorItem(
      createTask({
        id: 'todo-1',
        name: 'しゅくだい',
        kind: 'todo',
      })
    );

    const info = container.querySelector(`.${styles.taskEditorInfo}`);
    expect(container.querySelector(`.${styles.rewardInlineFields}`)).not.toBeInTheDocument();
    expect(info).not.toHaveClass(styles.rewardTaskEditorInfo);
  });

  it('ごほうびタスクではバッジを表示する', () => {
    renderTaskEditorItem(
      createTask({
        id: 'reward-1',
        name: 'ごほうび',
        kind: 'reward',
      })
    );

    expect(screen.getByText('ごほうび')).toBeInTheDocument();
  });

  it('デフォルトでは「きまった じかん」が有効で「おわる じかん」は無効表示になる', () => {
    renderTaskEditorItem(
      createTask({
        id: 'reward-1',
        name: 'ごほうび',
        kind: 'reward',
      })
    );

    const durationLabel = screen.getByText('きまった じかん').closest('label');
    const targetLabel = screen.getByText('おわる じかん').closest('label');

    expect(durationLabel).toHaveClass(styles.active);
    expect(targetLabel).not.toHaveClass(styles.active);
  });

  it('おわる時間モードでは「じ」「ふん」の入力が同じ横並びコンテナに表示される', () => {
    const { container } = renderTaskEditorItem(
      createTask({
        id: 'reward-1',
        name: 'ごほうび',
        kind: 'reward',
        rewardSettings: {
          mode: 'target-time',
          targetHour: 23,
          targetMinute: 15,
        },
      })
    );

    const targetInputs = container.querySelector(`.${styles.targetTimeInputs}`);
    expect(targetInputs).toBeInTheDocument();
    expect(targetInputs).toHaveTextContent('23じ');
    expect(targetInputs).toHaveTextContent('15ふん');
  });
});

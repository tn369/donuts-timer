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
  TimeStepper: ({
    value,
    unit,
    className,
  }: {
    value: number;
    unit: string;
    className?: string;
  }) => (
    <div className={className}>
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
  it('通常タスクは共通の1行レイアウトで名前欄と時間設定を表示する', () => {
    const { container } = renderTaskEditorItem(
      createTask({
        id: 'todo-1',
        name: 'しゅくだい',
        kind: 'todo',
      })
    );

    const primaryRow = container.querySelector(`.${styles.taskPrimaryRow}`);
    const timeStepper = container.querySelector(`.${styles.todoTimeStepper}`);

    expect(primaryRow).toBeInTheDocument();
    expect(timeStepper).toBeInTheDocument();
    expect(container.querySelector(`.${styles.rewardInlineFields}`)).not.toBeInTheDocument();
  });

  it('ごほうびタスクは共通ヘッダーの下に専用設定エリアを表示する', () => {
    const { container } = renderTaskEditorItem(
      createTask({
        id: 'reward-1',
        name: 'ごほうび',
        kind: 'reward',
      })
    );

    const inlineFields = container.querySelector(`.${styles.rewardInlineFields}`);
    const primaryRow = container.querySelector(`.${styles.taskPrimaryRow}`);
    const nameGroup = container.querySelector(`.${styles.rewardNameInputGroup}`);
    const settings = container.querySelector(`.${styles.rewardTimeSettings}`);
    const info = container.querySelector(`.${styles.taskEditorInfo}`);

    expect(inlineFields).toBeInTheDocument();
    expect(primaryRow).toBeInTheDocument();
    expect(nameGroup).toBeInTheDocument();
    expect(settings).toBeInTheDocument();
    expect(info).toHaveClass(styles.rewardTaskEditorInfo);
    expect(screen.getByDisplayValue('ごほうび')).toBeInTheDocument();
  });

  it('ごほうびタスクではバッジを表示する', () => {
    renderTaskEditorItem(
      createTask({
        id: 'reward-1',
        name: 'ごほうび',
        kind: 'reward',
      })
    );

    expect(screen.getByText('ごほうび', { selector: 'div' })).toBeInTheDocument();
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

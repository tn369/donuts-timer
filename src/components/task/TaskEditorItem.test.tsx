import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import type { Task, TodoList } from '../../types';
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
  IconSelectorPopup: ({
    onIconSelect,
    show,
  }: {
    onIconSelect: (icon: string) => void;
    show: boolean;
  }) =>
    show ? (
      <div
        role="presentation"
        onClick={() => {
          onIconSelect('shared-icon');
        }}
      >
        select-shared-icon
      </div>
    ) : null,
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

const renderTaskEditorItem = (
  task: Task,
  options?: {
    allTodoLists?: TodoList[];
    onTaskChange?: ReturnType<typeof vi.fn>;
  }
) =>
  render(
    <TaskEditorItem
      task={task}
      onTaskChange={options?.onTaskChange ?? vi.fn()}
      onRemoveTask={vi.fn()}
      onRewardSettingsChange={vi.fn()}
      allExistingIcons={[]}
      allTodoLists={options?.allTodoLists ?? []}
      currentListId="current-list"
    />
  );

const getTaskImageButton = (container: HTMLElement) => {
  const button = container.querySelector(`.${styles.taskEditorImage}`);
  if (!(button instanceof HTMLElement)) {
    throw new Error('Task image button not found');
  }
  return button;
};

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

  it('画像選択時に同じ画像の最新リスト名を未編集テキストへ補完する', () => {
    const onTaskChange = vi.fn();
    const task = createTask({
      id: 'todo-1',
      name: 'あたらしいやること',
      kind: 'todo',
    });
    const allTodoLists: TodoList[] = [
      {
        id: 'older-list',
        title: 'older',
        updatedAt: 10,
        tasks: [createTask({ id: 'old-task', name: 'はみがき', icon: 'shared-icon' })],
      },
      {
        id: 'newer-list',
        title: 'newer',
        updatedAt: 20,
        tasks: [createTask({ id: 'new-task', name: 'しゅくだい', icon: 'shared-icon' })],
      },
    ];

    const { container } = renderTaskEditorItem(task, { allTodoLists, onTaskChange });

    fireEvent.click(getTaskImageButton(container));
    fireEvent.click(screen.getByText('select-shared-icon'));

    expect(onTaskChange).toHaveBeenCalledWith('todo-1', {
      icon: 'shared-icon',
      name: 'しゅくだい',
    });
  });

  it('名前が初期値から編集済みなら画像選択しても補完しない', () => {
    const onTaskChange = vi.fn();
    const task = createTask({
      id: 'todo-1',
      name: 'あたらしいやること',
      kind: 'todo',
    });
    const allTodoLists: TodoList[] = [
      {
        id: 'saved-list',
        title: 'saved',
        updatedAt: 20,
        tasks: [createTask({ id: 'saved-task', name: 'しゅくだい', icon: 'shared-icon' })],
      },
    ];

    const { container, rerender } = renderTaskEditorItem(task, { allTodoLists, onTaskChange });

    rerender(
      <TaskEditorItem
        task={{ ...task, name: 'じぶんでいれたなまえ' }}
        onTaskChange={onTaskChange}
        onRemoveTask={vi.fn()}
        onRewardSettingsChange={vi.fn()}
        allExistingIcons={[]}
        allTodoLists={allTodoLists}
        currentListId="current-list"
      />
    );

    fireEvent.click(getTaskImageButton(container));
    fireEvent.click(screen.getByText('select-shared-icon'));

    expect(onTaskChange).toHaveBeenLastCalledWith('todo-1', {
      icon: 'shared-icon',
    });
  });
});

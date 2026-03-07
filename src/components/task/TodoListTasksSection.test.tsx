import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import type { Task } from '../../types';
import { TodoListTasksSection } from './TodoListTasksSection';

vi.mock('framer-motion', () => ({
  motion: {
    button: ({
      children,
      layout: _layout,
      ...props
    }: React.ButtonHTMLAttributes<HTMLButtonElement> & {
      children: React.ReactNode;
      layout?: boolean;
    }) => <button {...props}>{children}</button>,
  },
  Reorder: {
    Group: ({
      axis,
      className,
      children,
    }: {
      axis: 'x' | 'y';
      className?: string;
      children: React.ReactNode;
    }) => (
      <div data-testid="reorder-group" data-axis={axis} className={className}>
        {children}
      </div>
    ),
    Item: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  },
  useDragControls: () => ({
    start: vi.fn(),
  }),
}));

vi.mock('./TaskEditorItem', () => ({
  TaskEditorItem: ({ task }: { task: Task }) => <div>{task.name}</div>,
}));

describe('TodoListTasksSection', () => {
  const tasks: Task[] = [
    {
      id: 'task-1',
      name: 'はみがき',
      icon: '',
      plannedSeconds: 300,
      kind: 'todo',
      status: 'todo',
      elapsedSeconds: 0,
      actualSeconds: 0,
    },
  ];

  it('やることの並び替え軸が縦方向であること', () => {
    render(
      <TodoListTasksSection
        tasks={tasks}
        allExistingIcons={[]}
        onTaskChange={vi.fn()}
        onRemoveTask={vi.fn()}
        onRewardSettingsChange={vi.fn()}
        onReorderTasks={vi.fn()}
        onAddTask={vi.fn()}
      />
    );

    expect(screen.getByTestId('reorder-group')).toHaveAttribute('data-axis', 'y');
  });
});

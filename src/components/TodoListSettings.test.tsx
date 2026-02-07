import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { TodoList } from '../types';
import { TodoListSettings } from './TodoListSettings';

describe('TodoListSettings', () => {
  const mockList: TodoList = {
    id: '1',
    title: 'あさのやることリスト',
    tasks: [],
    timerSettings: { shape: 'circle', color: 'blue' },
  };

  it('ヘッダーが表示されること', () => {
    render(<TodoListSettings list={mockList} onSave={vi.fn()} onBack={vi.fn()} />);

    expect(screen.getByText('やることリスト の せってい')).toBeInTheDocument();
  });

  it('保存ボタンが表示されること', () => {
    render(<TodoListSettings list={mockList} onSave={vi.fn()} onBack={vi.fn()} />);

    expect(screen.getByText('保存する')).toBeInTheDocument();
  });
});

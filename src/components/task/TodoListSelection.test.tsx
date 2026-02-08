import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { TodoList } from '../../types';
import { TodoListSelection } from './TodoListSelection';

// useWindowSize のモック
const mockUseWindowSize = vi.fn<() => { width: number; height: number }>();
vi.mock('../../hooks/useWindowSize', () => ({
  useWindowSize: () => mockUseWindowSize(),
}));

const mockLists: TodoList[] = [
  {
    id: 'list-1',
    title: '朝の準備',
    tasks: [
      {
        id: 't1',
        name: '顔を洗う',
        icon: '',
        kind: 'todo',
        status: 'todo',
        plannedSeconds: 300,
        elapsedSeconds: 0,
        actualSeconds: 0,
      },
    ],
    timerSettings: { shape: 'circle', color: 'blue' },
  },
  {
    id: 'list-2',
    title: '宿題',
    tasks: [],
    timerSettings: { shape: 'square', color: 'green' },
  },
];

describe('TodoListSelection', () => {
  const defaultProps = {
    lists: mockLists,
    onSelect: vi.fn(),
    onSelectSibling: vi.fn(),
    onEdit: vi.fn(),
    onCopy: vi.fn(),
    onAdd: vi.fn(),
    onDelete: vi.fn(),
  };

  it('リストが正しく表示されること', () => {
    mockUseWindowSize.mockReturnValue({ width: 1024, height: 768 });
    render(<TodoListSelection {...defaultProps} />);

    expect(screen.getByText('朝の準備')).toBeInTheDocument();
    expect(screen.getByText('宿題')).toBeInTheDocument();
  });

  it('通常サイズ（高さ 768px）では compact クラスが付与されないこと', () => {
    mockUseWindowSize.mockReturnValue({ width: 1024, height: 768 });
    const { container } = render(<TodoListSelection {...defaultProps} />);

    const selectionScreen = container.querySelector('[class*="selectionScreen"]');
    expect(selectionScreen?.className).not.toContain('compact');
  });

  it('カードをクリックしたときに onSelect が呼ばれること', () => {
    mockUseWindowSize.mockReturnValue({ width: 1024, height: 768 });
    render(<TodoListSelection {...defaultProps} />);

    fireEvent.click(screen.getByLabelText(/朝の準備 リストをえらぶ/));
    expect(defaultProps.onSelect).toHaveBeenCalledWith('list-1');
  });

  it('ふたりモードに切り替えて、2つのリストを選択すると onSelectSibling が呼ばれること', () => {
    mockUseWindowSize.mockReturnValue({ width: 1024, height: 768 });
    render(<TodoListSelection {...defaultProps} />);

    // ふたりでボタンをクリック
    fireEvent.click(screen.getByLabelText(/ふたりで つかう/));

    // 1つ目のリストを選択
    fireEvent.click(screen.getByLabelText(/朝の準備 リストをえらぶ/));
    expect(screen.getByText('ふたりめ の リストを えらんでね')).toBeInTheDocument();

    // 2つ目のリストを選択
    fireEvent.click(screen.getByLabelText(/宿題 リストをえらぶ/));

    expect(defaultProps.onSelectSibling).toHaveBeenCalledWith('list-1', 'list-2');
  });

  it('コンパクト表示（高さ 500px）では「ふたりで」ボタンが表示されないこと', () => {
    mockUseWindowSize.mockReturnValue({ width: 1024, height: 500 });
    render(<TodoListSelection {...defaultProps} />);

    expect(screen.queryByRole('button', { name: /ふたりで/ })).not.toBeInTheDocument();
  });
});

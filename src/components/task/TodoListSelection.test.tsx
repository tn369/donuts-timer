import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { TodoList } from '../../types';
import { TodoListSelection } from './TodoListSelection';

// useWindowSize のモック
const mockUseWindowSize = vi.fn<() => { width: number; height: number }>();
const mockLoadUiSettings = vi.fn<() => { simpleListView: boolean }>();
const mockSaveUiSettings = vi.fn<(settings: { simpleListView: boolean }) => void>();

vi.mock('../../hooks/useWindowSize', () => ({
  useWindowSize: () => mockUseWindowSize(),
}));
vi.mock('../../storage', () => ({
  loadUiSettings: () => mockLoadUiSettings(),
  saveUiSettings: (settings: { simpleListView: boolean }) => {
    mockSaveUiSettings(settings);
  },
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
    onReorder: vi.fn(),
  };

  beforeEach(() => {
    mockLoadUiSettings.mockReturnValue({ simpleListView: false });
    mockSaveUiSettings.mockReset();
  });

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

  it('削除ボタンをクリックすると確認ダイアログが表示され、確認後に onDelete が呼ばれること', async () => {
    mockUseWindowSize.mockReturnValue({ width: 1024, height: 768 });
    render(<TodoListSelection {...defaultProps} />);

    // 最初のリストの削除ボタンをクリック
    const deleteButtons = screen.getAllByLabelText('リストを けす');
    fireEvent.click(deleteButtons[0]);

    // 確認ダイアログが表示されることを確認
    expect(screen.getByText('このリストを けしても いいですか？')).toBeInTheDocument();

    // 削除ボタンをクリック
    const confirmButton = screen.getByRole('button', { name: 'けす' });
    fireEvent.click(confirmButton);

    // onDelete が呼ばれることを確認
    expect(defaultProps.onDelete).toHaveBeenCalledWith('list-1');

    // ダイアログが閉じることを確認
    await waitFor(() => {
      expect(screen.queryByText('このリストを けしても いいですか？')).not.toBeInTheDocument();
    });
  });

  it('削除確認ダイアログでキャンセルボタンをクリックすると onDelete が呼ばれないこと', async () => {
    mockUseWindowSize.mockReturnValue({ width: 1024, height: 768 });
    const onDeleteMock = vi.fn();
    render(<TodoListSelection {...defaultProps} onDelete={onDeleteMock} />);

    // 最初のリストの削除ボタンをクリック
    const deleteButtons = screen.getAllByLabelText('リストを けす');
    fireEvent.click(deleteButtons[0]);

    // 確認ダイアログが表示されることを確認
    expect(screen.getByText('このリストを けしても いいですか？')).toBeInTheDocument();

    // キャンセルボタンをクリック
    const cancelButton = screen.getByRole('button', { name: 'キャンセル' });
    fireEvent.click(cancelButton);

    // onDelete が呼ばれないことを確認
    expect(onDeleteMock).not.toHaveBeenCalled();

    // ダイアログが閉じることを確認
    await waitFor(() => {
      expect(screen.queryByText('このリストを けしても いいですか？')).not.toBeInTheDocument();
    });
  });

  it('リストをコピーしたときにエラーが発生しないこと (Hook 違反の確認)', () => {
    mockUseWindowSize.mockReturnValue({ width: 1024, height: 768 });

    // 親コンポーネントの状態管理をシミュレートするためのラッパー
    const TestWrapper = () => {
      const [lists, setLists] = React.useState<TodoList[]>(mockLists);
      const handleCopy = (id: string) => {
        const listToCopy = lists.find((l) => l.id === id);
        if (listToCopy) {
          setLists([...lists, { ...listToCopy, id: `copy-${Date.now()}` }]);
        }
      };
      return <TodoListSelection {...defaultProps} lists={lists} onCopy={handleCopy} />;
    };

    render(<TestWrapper />);

    // 最初のリストのコピーボタンをクリック
    const copyButtons = screen.getAllByLabelText('リストを コピーする');
    fireEvent.click(copyButtons[0]);

    // リストが増えていることを確認 (Hook 違反があるとここでエラーが発生して落ちるはず)
    expect(screen.getAllByLabelText(/リストをえらぶ/)).toHaveLength(3);
  });

  it('保存済み設定がONのとき、シンプル表示トグルがONで表示されること', () => {
    mockUseWindowSize.mockReturnValue({ width: 1024, height: 768 });
    mockLoadUiSettings.mockReturnValue({ simpleListView: true });
    render(<TodoListSelection {...defaultProps} />);

    const simpleToggle = screen.getByRole('button', { name: /かんたん ひょうじ/ });
    expect(simpleToggle.getAttribute('aria-pressed')).toBe('true');
  });

  it('シンプル表示トグルを押すと、設定が保存されること', () => {
    mockUseWindowSize.mockReturnValue({ width: 1024, height: 768 });
    render(<TodoListSelection {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /かんたん ひょうじ/ }));

    expect(mockSaveUiSettings).toHaveBeenCalledWith({ simpleListView: true });
  });
});

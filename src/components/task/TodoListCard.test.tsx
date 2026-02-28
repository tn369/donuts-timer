import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { TodoList } from '../../types';
import { TodoListCard } from './TodoListCard';

const mockList: TodoList = {
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
    {
      id: 't2',
      name: 'あそぶ',
      icon: '',
      kind: 'reward',
      status: 'todo',
      plannedSeconds: 900,
      elapsedSeconds: 0,
      actualSeconds: 0,
      rewardSettings: {
        mode: 'duration',
      },
    },
  ],
  timerSettings: { shape: 'circle', color: 'blue' },
};

describe('TodoListCard', () => {
  const defaultProps = {
    list: mockList,
    isSelected: false,
    selectionIndex: -1,
    isSiblingModeSelect: false,
    onClick: vi.fn(),
    onCopy: vi.fn(),
    onEdit: vi.fn(),
    onDeleteRequest: vi.fn(),
  };

  it('リストのタイトルと各タスクの内容が正しく表示されること', () => {
    render(<TodoListCard {...defaultProps} />);
    expect(screen.getByText('朝の準備')).toBeInTheDocument();
    expect(screen.getByText('顔を洗う')).toBeInTheDocument();
    expect(screen.getByText('5ふん')).toBeInTheDocument();
    expect(screen.getByText('あそぶ')).toBeInTheDocument();
    expect(screen.getByText('ごほうび')).toBeInTheDocument();
    expect(screen.getByText('15ふん')).toBeInTheDocument();
  });

  it('ごほうびタスクは「ごほうび」バッジが内容より先に表示されること', () => {
    render(<TodoListCard {...defaultProps} />);
    const rewardBadge = screen.getByText('ごほうび');
    const rewardContent = screen.getByText('あそぶ');
    expect(
      rewardBadge.compareDocumentPosition(rewardContent) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  it('旧タスク数テキストが表示されないこと', () => {
    render(<TodoListCard {...defaultProps} />);
    expect(screen.queryByText(/この やること/)).not.toBeInTheDocument();
  });

  it('予定時間が 0 秒のタスクは 0ふん と表示されること', () => {
    const zeroMinuteList: TodoList = {
      ...mockList,
      tasks: [
        {
          ...mockList.tasks[0],
          id: 't0',
          plannedSeconds: 0,
        },
      ],
    };

    render(<TodoListCard {...defaultProps} list={zeroMinuteList} />);
    expect(screen.getByText('0ふん')).toBeInTheDocument();
  });

  it('カードをクリックしたときに onClick が呼ばれること', () => {
    render(<TodoListCard {...defaultProps} />);
    fireEvent.click(screen.getByLabelText(/朝の準備 リストをえらぶ/));
    expect(defaultProps.onClick).toHaveBeenCalled();
  });

  it('コピーボタンをクリックしたときに onCopy が呼ばれること', () => {
    render(<TodoListCard {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('リストを コピーする'));
    expect(defaultProps.onCopy).toHaveBeenCalled();
  });

  it('編集ボタンをクリックしたときに onEdit が呼ばれること', () => {
    render(<TodoListCard {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('リストを なおす'));
    expect(defaultProps.onEdit).toHaveBeenCalled();
  });

  it('削除ボタンをクリックしたときに onDeleteRequest が呼ばれること', () => {
    render(<TodoListCard {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('リストを けす'));
    expect(defaultProps.onDeleteRequest).toHaveBeenCalled();
  });

  it('isSelected が true のとき、選択バッジが表示されること', () => {
    render(<TodoListCard {...defaultProps} isSelected={true} selectionIndex={0} />);
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('SelectionIndex が 1 のとき、バッジに "2" が表示されること', () => {
    render(<TodoListCard {...defaultProps} isSelected={true} selectionIndex={1} />);
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('isSiblingModeSelect が true のとき、アクションボタンが表示されないこと', () => {
    render(<TodoListCard {...defaultProps} isSiblingModeSelect={true} />);
    expect(screen.queryByLabelText('リストを コピーする')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('リストを なおす')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('リストを けす')).not.toBeInTheDocument();
  });

  it('isCompact が true のとき、compact クラスが付与されること', () => {
    const { container } = render(<TodoListCard {...defaultProps} isCompact={true} />);
    const card = container.querySelector('[class*="listCard"]');
    expect(card?.className).toContain('compact');
  });
});

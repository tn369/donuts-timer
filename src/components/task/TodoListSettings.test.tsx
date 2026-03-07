import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { TodoList } from '../../types';
import { TodoListSettings } from './TodoListSettings';

const getStepperContainer = (element: HTMLElement): HTMLElement => {
  const valueContainer = element.closest('div');
  if (!valueContainer?.parentElement) {
    throw new Error('TimeStepper container not found');
  }
  return valueContainer.parentElement;
};

describe('TodoListSettings', () => {
  const mockList: TodoList = {
    id: '1',
    title: 'あさ',
    tasks: [],
    timerSettings: { shape: 'circle', color: 'blue' },
  };

  it('ヘッダーが表示されること', () => {
    render(<TodoListSettings list={mockList} onSave={vi.fn()} onBack={vi.fn()} />);

    expect(screen.getByText('やることリスト の せってい')).toBeInTheDocument();
  });

  it('保存ボタンが表示されること', () => {
    render(<TodoListSettings list={mockList} onSave={vi.fn()} onBack={vi.fn()} />);

    expect(screen.getByText('ほぞんする')).toBeInTheDocument();
  });

  it('設定セクションが なまえ → やること → かたち → いろ の順で表示されること', () => {
    render(<TodoListSettings list={mockList} onSave={vi.fn()} onBack={vi.fn()} />);

    const nameHeading = screen.getByRole('heading', { name: 'リストのなまえ' });
    const tasksHeading = screen.getByRole('heading', { name: 'やること' });
    const rewardHeading = screen.getByRole('heading', { name: 'ごほうび' });
    const shapeHeading = screen.getByRole('heading', { name: 'どーなつタイマー の かたち' });
    const colorHeading = screen.getByRole('heading', { name: 'どーなつタイマー の いろ' });

    const namePos = nameHeading.compareDocumentPosition(tasksHeading);
    const tasksPos = tasksHeading.compareDocumentPosition(rewardHeading);
    const rewardPos = rewardHeading.compareDocumentPosition(shapeHeading);
    const shapePos = shapeHeading.compareDocumentPosition(colorHeading);

    expect(namePos & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(tasksPos & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(rewardPos & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(shapePos & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('タスクが追加できること', async () => {
    render(<TodoListSettings list={mockList} onSave={vi.fn()} onBack={vi.fn()} />);

    const addButton = screen.getByText('やること を ついか');
    act(() => {
      addButton.click();
    });

    // 新しく追加されたタスクのデフォルト名が表示されていることを確認
    expect(await screen.findByDisplayValue('あたらしいやること')).toBeInTheDocument();
  });

  it('ごほうび設定がやること一覧と別セクションで表示されること', () => {
    const listWithReward: TodoList = {
      ...mockList,
      tasks: [
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
        {
          id: 'reward-task',
          name: 'あそぶ',
          icon: '',
          plannedSeconds: 900,
          kind: 'reward',
          status: 'todo',
          elapsedSeconds: 0,
          actualSeconds: 0,
        },
      ],
    };

    render(<TodoListSettings list={listWithReward} onSave={vi.fn()} onBack={vi.fn()} />);

    expect(screen.getByRole('heading', { name: 'やること' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'ごほうび' })).toBeInTheDocument();
    expect(
      screen.getByText('やること が おわった あとに さいごに する ごほうび を きめよう')
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue('あそぶ')).toBeInTheDocument();
  });

  it('目標時刻のふんステッパーは境界で循環し、じも繰り上がって保存されること', () => {
    const onSave = vi.fn();
    const listWithTargetTimeReward: TodoList = {
      ...mockList,
      tasks: [
        {
          id: 'reward-task',
          name: 'あそぶ',
          icon: '',
          plannedSeconds: 900,
          kind: 'reward',
          status: 'todo',
          elapsedSeconds: 0,
          actualSeconds: 0,
          rewardSettings: {
            mode: 'target-time',
            targetHour: 1,
            targetMinute: 55,
          },
        },
      ],
    };

    render(<TodoListSettings list={listWithTargetTimeReward} onSave={onSave} onBack={vi.fn()} />);

    const [, minuteSelect] = screen.getAllByRole('combobox');
    const minuteStepper = getStepperContainer(minuteSelect);

    fireEvent.click(within(minuteStepper).getByText('+'));
    fireEvent.click(screen.getByText('ほぞんする'));

    const savedList = onSave.mock.calls[0]?.[0] as TodoList | undefined;

    expect(savedList).toBeDefined();
    expect(savedList?.tasks).toHaveLength(1);
    expect(savedList?.tasks[0]).toMatchObject({
      id: 'reward-task',
      rewardSettings: {
        mode: 'target-time',
        targetHour: 2,
        targetMinute: 0,
      },
    });
  });

  it('目標時刻のふんステッパーは逆方向の循環で、じも繰り下がって保存されること', () => {
    const onSave = vi.fn();
    const listWithTargetTimeReward: TodoList = {
      ...mockList,
      tasks: [
        {
          id: 'reward-task',
          name: 'あそぶ',
          icon: '',
          plannedSeconds: 900,
          kind: 'reward',
          status: 'todo',
          elapsedSeconds: 0,
          actualSeconds: 0,
          rewardSettings: {
            mode: 'target-time',
            targetHour: 1,
            targetMinute: 0,
          },
        },
      ],
    };

    render(<TodoListSettings list={listWithTargetTimeReward} onSave={onSave} onBack={vi.fn()} />);

    const [, minuteSelect] = screen.getAllByRole('combobox');
    const minuteStepper = getStepperContainer(minuteSelect);

    fireEvent.click(within(minuteStepper).getByText('-'));
    fireEvent.click(screen.getByText('ほぞんする'));

    const savedList = onSave.mock.calls[0]?.[0] as TodoList | undefined;

    expect(savedList).toBeDefined();
    expect(savedList?.tasks).toHaveLength(1);
    expect(savedList?.tasks[0]).toMatchObject({
      id: 'reward-task',
      rewardSettings: {
        mode: 'target-time',
        targetHour: 0,
        targetMinute: 55,
      },
    });
  });

  it('保存時にタイトルからサフィックスが除去されること', () => {
    const onSave = vi.fn();
    render(<TodoListSettings list={mockList} onSave={onSave} onBack={vi.fn()} />);

    // タイトル入力欄を変更
    const titleInput = screen.getByPlaceholderText('なまえ');
    fireEvent.change(titleInput, { target: { value: 'よる' } });

    // 保存ボタンをクリック
    const saveButton = screen.getByText('ほぞんする');
    act(() => {
      saveButton.click();
    });

    // onSaveが呼ばれ、titleにサフィックスが含まれていないことを確認
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'よる',
      })
    );
  });

  describe('リスト名の選択チップ', () => {
    it('手入力後に別の名前を選ぶと確認ダイアログが表示されること', () => {
      render(<TodoListSettings list={mockList} onSave={vi.fn()} onBack={vi.fn()} />);

      const titleInput = screen.getByPlaceholderText('なまえ');
      fireEvent.change(titleInput, { target: { value: 'じぶんのなまえ' } });

      fireEvent.click(screen.getByRole('button', { name: 'よる' }));

      expect(screen.getByText(/なまえを かえても いい？/)).toBeInTheDocument();
      expect(screen.getByDisplayValue('じぶんのなまえ')).toBeInTheDocument();
    });

    it('確認ダイアログで「かえる」を押すと上書きされること', async () => {
      render(<TodoListSettings list={mockList} onSave={vi.fn()} onBack={vi.fn()} />);

      const titleInput = screen.getByPlaceholderText('なまえ');
      fireEvent.change(titleInput, { target: { value: 'じぶんのなまえ' } });
      fireEvent.click(screen.getByRole('button', { name: 'よる' }));
      fireEvent.click(screen.getByRole('button', { name: 'かえる' }));

      await waitFor(() => {
        expect(screen.queryByText(/なまえを かえても いい？/)).not.toBeInTheDocument();
      });
      expect(screen.getByDisplayValue('よる')).toBeInTheDocument();
    });

    it('確認ダイアログで「そのまま」を押すと手入力が保持されること', async () => {
      render(<TodoListSettings list={mockList} onSave={vi.fn()} onBack={vi.fn()} />);

      const titleInput = screen.getByPlaceholderText('なまえ');
      fireEvent.change(titleInput, { target: { value: 'じぶんのなまえ' } });
      fireEvent.click(screen.getByRole('button', { name: 'よる' }));
      fireEvent.click(screen.getByRole('button', { name: 'そのまま' }));

      await waitFor(() => {
        expect(screen.queryByText(/なまえを かえても いい？/)).not.toBeInTheDocument();
      });
      expect(screen.getByDisplayValue('じぶんのなまえ')).toBeInTheDocument();
    });

    it('手入力がない場合は確認なしで名前が切り替わること', () => {
      render(<TodoListSettings list={mockList} onSave={vi.fn()} onBack={vi.fn()} />);

      fireEvent.click(screen.getByRole('button', { name: 'よる' }));

      expect(screen.queryByText(/なまえを かえても いい？/)).not.toBeInTheDocument();
      expect(screen.getByDisplayValue('よる')).toBeInTheDocument();
    });

    it('手入力後でも同じ名前を選んだ場合は確認を出さないこと', () => {
      render(<TodoListSettings list={mockList} onSave={vi.fn()} onBack={vi.fn()} />);

      const titleInput = screen.getByPlaceholderText('なまえ');
      fireEvent.change(titleInput, { target: { value: 'よる' } });
      fireEvent.click(screen.getByRole('button', { name: 'よる' }));

      expect(screen.queryByText(/なまえを かえても いい？/)).not.toBeInTheDocument();
      expect(screen.getByDisplayValue('よる')).toBeInTheDocument();
    });
  });

  describe('戻るボタンの確認ダイアログ', () => {
    it('変更がない場合、確認ダイアログを出さずにonBackを呼ぶこと', () => {
      const onBack = vi.fn();
      const confirmSpy = vi.spyOn(window, 'confirm');
      render(<TodoListSettings list={mockList} onSave={vi.fn()} onBack={onBack} />);

      const backButton = screen.getByRole('button', { name: '' }); // ArrowLeftアイコンのボタン
      act(() => {
        backButton.click();
      });

      expect(confirmSpy).not.toHaveBeenCalled();
      expect(onBack).toHaveBeenCalled();
      confirmSpy.mockRestore();
    });

    it('変更がある場合、確認ダイアログを表示すること', () => {
      const onBack = vi.fn();
      render(<TodoListSettings list={mockList} onSave={vi.fn()} onBack={onBack} />);

      // タスクを追加して変更状態にする
      const addButton = screen.getByText('やること を ついか');
      act(() => {
        addButton.click();
      });

      const backButton = screen.getByRole('button', { name: '' });
      act(() => {
        backButton.click();
      });

      // カスタムダイアログが表示されていることを確認
      expect(
        screen.getByText('へんこう されています。ほぞんせずに もどりますか？')
      ).toBeInTheDocument();
      expect(screen.getByText('もどる')).toBeInTheDocument();
      expect(screen.getByText('キャンセル')).toBeInTheDocument();
    });

    it('変更があり、確認ダイアログでキャンセルした場合、onBackを呼ばないこと', async () => {
      const onBack = vi.fn();
      render(<TodoListSettings list={mockList} onSave={vi.fn()} onBack={onBack} />);

      // タスクを追加して変更状態にする
      const addButton = screen.getByText('やること を ついか');
      act(() => {
        addButton.click();
      });

      const backButton = screen.getByRole('button', { name: '' });
      act(() => {
        backButton.click();
      });

      // 「キャンセル」ボタンをクリック
      const stayButton = screen.getByText('キャンセル');
      act(() => {
        stayButton.click();
      });

      expect(onBack).not.toHaveBeenCalled();
      await waitFor(() => {
        expect(screen.queryByText('へんこう されています。')).not.toBeInTheDocument();
      });
    });

    it('変更があり、確認ダイアログで「もどる」を選択した場合、onBackを呼ぶこと', () => {
      const onBack = vi.fn();
      render(<TodoListSettings list={mockList} onSave={vi.fn()} onBack={onBack} />);

      // タスクを追加して変更状態にする
      const addButton = screen.getByText('やること を ついか');
      act(() => {
        addButton.click();
      });

      const backButton = screen.getByRole('button', { name: '' });
      act(() => {
        backButton.click();
      });

      // 「もどる」ボタンをクリック
      const leaveButton = screen.getByText('もどる');
      act(() => {
        leaveButton.click();
      });

      expect(onBack).toHaveBeenCalled();
    });
  });
});

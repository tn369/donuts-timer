import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { TodoList } from '../../types';
import { TodoListSettings } from './TodoListSettings';

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

  it('タスクが追加できること', async () => {
    render(<TodoListSettings list={mockList} onSave={vi.fn()} onBack={vi.fn()} />);

    const addButton = screen.getByText('やること を ついか');
    act(() => {
      addButton.click();
    });

    // 新しく追加されたタスクのデフォルト名が表示されていることを確認
    expect(await screen.findByDisplayValue('あたらしいやること')).toBeInTheDocument();
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

      expect(screen.getByText(/いま いれた なまえが きえちゃうよ。/)).toBeInTheDocument();
      expect(screen.getByText(/この なまえに かえても いい？/)).toBeInTheDocument();
      expect(screen.getByDisplayValue('じぶんのなまえ')).toBeInTheDocument();
    });

    it('確認ダイアログで「この なまえに する」を押すと上書きされること', async () => {
      render(<TodoListSettings list={mockList} onSave={vi.fn()} onBack={vi.fn()} />);

      const titleInput = screen.getByPlaceholderText('なまえ');
      fireEvent.change(titleInput, { target: { value: 'じぶんのなまえ' } });
      fireEvent.click(screen.getByRole('button', { name: 'よる' }));
      fireEvent.click(screen.getByRole('button', { name: 'この なまえに する' }));

      await waitFor(() => {
        expect(screen.queryByText(/いま いれた なまえが きえちゃうよ。/)).not.toBeInTheDocument();
      });
      expect(screen.getByDisplayValue('よる')).toBeInTheDocument();
    });

    it('確認ダイアログで「そのままに する」を押すと手入力が保持されること', async () => {
      render(<TodoListSettings list={mockList} onSave={vi.fn()} onBack={vi.fn()} />);

      const titleInput = screen.getByPlaceholderText('なまえ');
      fireEvent.change(titleInput, { target: { value: 'じぶんのなまえ' } });
      fireEvent.click(screen.getByRole('button', { name: 'よる' }));
      fireEvent.click(screen.getByRole('button', { name: 'そのままに する' }));

      await waitFor(() => {
        expect(screen.queryByText(/いま いれた なまえが きえちゃうよ。/)).not.toBeInTheDocument();
      });
      expect(screen.getByDisplayValue('じぶんのなまえ')).toBeInTheDocument();
    });

    it('手入力がない場合は確認なしで名前が切り替わること', () => {
      render(<TodoListSettings list={mockList} onSave={vi.fn()} onBack={vi.fn()} />);

      fireEvent.click(screen.getByRole('button', { name: 'よる' }));

      expect(screen.queryByText(/いま いれた なまえが きえちゃうよ。/)).not.toBeInTheDocument();
      expect(screen.getByDisplayValue('よる')).toBeInTheDocument();
    });

    it('手入力後でも同じ名前を選んだ場合は確認を出さないこと', () => {
      render(<TodoListSettings list={mockList} onSave={vi.fn()} onBack={vi.fn()} />);

      const titleInput = screen.getByPlaceholderText('なまえ');
      fireEvent.change(titleInput, { target: { value: 'よる' } });
      fireEvent.click(screen.getByRole('button', { name: 'よる' }));

      expect(screen.queryByText(/いま いれた なまえが きえちゃうよ。/)).not.toBeInTheDocument();
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

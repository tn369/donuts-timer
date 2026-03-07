import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TimeStepper } from './TimeStepper';

const expectLastOnChange = (
  onChange: ReturnType<typeof vi.fn>,
  value: number,
  context: { source: 'increment' | 'decrement' | 'input' | 'select'; wrapped?: boolean }
) => {
  expect(onChange).toHaveBeenLastCalledWith(value, context);
};

describe('TimeStepper', () => {
  it('数値入力時、値を表示すること', () => {
    const onChange = vi.fn();
    render(<TimeStepper value={10} onChange={onChange} unit="ふん" />);

    const input = screen.getByDisplayValue('10');
    expect(input).toBeInTheDocument();
  });

  it('+ボタンをクリックした時、値を増やすこと', () => {
    const onChange = vi.fn();
    render(<TimeStepper value={10} onChange={onChange} unit="ふん" />);

    const plusButton = screen.getByText('+');
    fireEvent.click(plusButton);

    expectLastOnChange(onChange, 15, { source: 'increment', wrapped: false }); // default step is 5
  });

  it('-ボタンをクリックした時、値を減らすこと', () => {
    const onChange = vi.fn();
    render(<TimeStepper value={10} onChange={onChange} unit="ふん" />);

    const minusButton = screen.getByText('-');
    fireEvent.click(minusButton);

    expectLastOnChange(onChange, 5, { source: 'decrement', wrapped: false });
  });

  describe('options プロパティ（新規要件）', () => {
    it('optionsがある時、selectを表示すること', () => {
      const options = [0, 5, 10, 15];
      const onChange = vi.fn();
      render(<TimeStepper value={5} onChange={onChange} unit="ふん" options={options} />);

      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
      expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
    });

    it('selectで値を変えた時、onChangeが呼ばれること', () => {
      const options = [0, 5, 10, 15];
      const onChange = vi.fn();
      render(<TimeStepper value={5} onChange={onChange} unit="ふん" options={options} />);

      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: '10' } });

      expectLastOnChange(onChange, 10, { source: 'select', wrapped: false });
    });

    it('optionsがある時の+ボタンは、次のオプション値に進むこと', () => {
      const options = [0, 10, 20];
      const onChange = vi.fn();
      render(<TimeStepper value={10} onChange={onChange} unit="ふん" options={options} />);

      const plusButton = screen.getByText('+');
      fireEvent.click(plusButton);

      expectLastOnChange(onChange, 20, { source: 'increment', wrapped: false });
    });

    it('optionsがある時の-ボタンは、前のオプション値に戻ること', () => {
      const options = [0, 10, 20];
      const onChange = vi.fn();
      render(<TimeStepper value={10} onChange={onChange} unit="ふん" options={options} />);

      const minusButton = screen.getByText('-');
      fireEvent.click(minusButton);

      expectLastOnChange(onChange, 0, { source: 'decrement', wrapped: false });
    });

    it('loopOptionsが有効な時、末尾で+ボタンを押すと先頭に戻ること', () => {
      const options = [0, 10, 20];
      const onChange = vi.fn();
      render(
        <TimeStepper value={20} onChange={onChange} unit="ふん" options={options} loopOptions />
      );

      fireEvent.click(screen.getByText('+'));

      expectLastOnChange(onChange, 0, { source: 'increment', wrapped: true });
    });

    it('loopOptionsが有効な時、先頭で-ボタンを押すと末尾に戻ること', () => {
      const options = [0, 10, 20];
      const onChange = vi.fn();
      render(
        <TimeStepper value={0} onChange={onChange} unit="ふん" options={options} loopOptions />
      );

      fireEvent.click(screen.getByText('-'));

      expectLastOnChange(onChange, 20, { source: 'decrement', wrapped: true });
    });

    it('loopOptionsが有効な時、境界値でもボタンが無効化されないこと', () => {
      const options = [0, 10, 20];
      const onChange = vi.fn();
      render(
        <TimeStepper value={0} onChange={onChange} unit="ふん" options={options} loopOptions />
      );

      expect(screen.getByText('-')).not.toBeDisabled();
      expect(screen.getByText('+')).not.toBeDisabled();
    });
  });

  describe('入力のクリアと前ゼロのハンドリング', () => {
    it('入力を空にした時、onChangeは呼ばれないが表示は空になること', () => {
      const onChange = vi.fn();
      render(<TimeStepper value={10} onChange={onChange} unit="ふん" />);

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: '' } });

      expect(input).toHaveValue('');
      expect(onChange).not.toHaveBeenCalled();
    });

    it('空の状態から数値を入力した時、前ゼロがつかないこと', () => {
      const onChange = vi.fn();
      render(<TimeStepper value={10} onChange={onChange} unit="ふん" />);

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: '' } });
      fireEvent.change(input, { target: { value: '5' } });

      expect(input).toHaveValue('5');
      expectLastOnChange(onChange, 5, { source: 'input', wrapped: false });
    });

    it('フォーカスが外れた時、空の場合は元の値に戻ること', () => {
      const onChange = vi.fn();
      render(<TimeStepper value={10} onChange={onChange} unit="ふん" />);

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: '' } });
      fireEvent.blur(input);

      expect(input).toHaveValue('10');
    });

    it('0を入力した時、"0"と表示されること', () => {
      const onChange = vi.fn();
      render(<TimeStepper value={10} onChange={onChange} unit="ふん" />);

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: '0' } });

      expect(input).toHaveValue('0');
      expectLastOnChange(onChange, 0, { source: 'input', wrapped: false });
    });
  });

  describe('min プロパティ', () => {
    it('minが指定されている時、それ未満には減らせないこと', () => {
      const onChange = vi.fn();
      const { rerender } = render(
        <TimeStepper value={2} onChange={onChange} unit="ふん" min={1} step={1} />
      );

      const minusButton = screen.getByText('-');
      expect(minusButton).not.toBeDisabled();

      fireEvent.click(minusButton);
      expectLastOnChange(onChange, 1, { source: 'decrement', wrapped: false });

      // 手動でプロップを更新して再レンダリング
      rerender(<TimeStepper value={1} onChange={onChange} unit="ふん" min={1} step={1} />);
      expect(minusButton).toBeDisabled();
    });

    it('minが指定されている時、直接入力でもmin未満にはならないこと', () => {
      const onChange = vi.fn();
      render(<TimeStepper value={10} onChange={onChange} unit="ふん" min={1} />);

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: '0' } });

      // onChangeにはmin(1)が渡る
      expectLastOnChange(onChange, 1, { source: 'input', wrapped: false });
    });

    it('Blur時、空の場合はminが適用されること', () => {
      const onChange = vi.fn();
      render(<TimeStepper value={10} onChange={onChange} unit="ふん" min={5} />);

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: '' } });
      fireEvent.blur(input);

      // 初期値が10なので、空でBlurしたら10に戻る（minを満たしているため）
      expect(input).toHaveValue('10');
    });

    it('初期値がmin未満の場合、Blur時にminに補正されること', () => {
      const onChange = vi.fn();
      // 極端な例だが、外部から不正な値が入った場合
      render(<TimeStepper value={0} onChange={onChange} unit="ふん" min={1} />);

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: '' } });
      fireEvent.blur(input);

      expect(input).toHaveValue('1');
    });
  });
});

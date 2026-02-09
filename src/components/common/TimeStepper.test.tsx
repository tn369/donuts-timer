import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TimeStepper } from './TimeStepper';

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

    expect(onChange).toHaveBeenCalledWith(15); // default step is 5
  });

  it('-ボタンをクリックした時、値を減らすこと', () => {
    const onChange = vi.fn();
    render(<TimeStepper value={10} onChange={onChange} unit="ふん" />);

    const minusButton = screen.getByText('-');
    fireEvent.click(minusButton);

    expect(onChange).toHaveBeenCalledWith(5);
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

      expect(onChange).toHaveBeenCalledWith(10);
    });

    it('optionsがある時の+ボタンは、次のオプション値に進むこと', () => {
      const options = [0, 10, 20];
      const onChange = vi.fn();
      render(<TimeStepper value={10} onChange={onChange} unit="ふん" options={options} />);

      const plusButton = screen.getByText('+');
      fireEvent.click(plusButton);

      expect(onChange).toHaveBeenCalledWith(20);
    });

    it('optionsがある時の-ボタンは、前のオプション値に戻ること', () => {
      const options = [0, 10, 20];
      const onChange = vi.fn();
      render(<TimeStepper value={10} onChange={onChange} unit="ふん" options={options} />);

      const minusButton = screen.getByText('-');
      fireEvent.click(minusButton);

      expect(onChange).toHaveBeenCalledWith(0);
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
      expect(onChange).toHaveBeenCalledWith(5);
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
      expect(onChange).toHaveBeenCalledWith(0);
    });
  });
});

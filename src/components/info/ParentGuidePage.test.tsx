import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ParentGuidePage } from './ParentGuidePage';

describe('ParentGuidePage', () => {
  it('shows parent-facing concept and feature sections', () => {
    render(<ParentGuidePage onBack={vi.fn()} />);

    expect(screen.getByText('保護者向けガイド')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        name: '「やりたくない」から「楽しい」「うれしい」「やってみたい」へ',
      })
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'コンセプト' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'できること' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '安心して使える点' })).toBeInTheDocument();
    expect(
      screen.getByText(
        /どーなつタイマーは、お子様が目標に対して前向きに取り組むためのタイマーです。/
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(/協力しながら毎日の支度や宿題に取り組めることを目指しています/)
    ).toBeInTheDocument();
    expect(screen.getByText(/自己決定理論/)).toBeInTheDocument();
    expect(screen.getByText(/お子様が自ら目標を選んだり決めたりする補助/)).toBeInTheDocument();
    expect(screen.getByText('時間が見えるビジュアルタイマー')).toBeInTheDocument();
    expect(screen.getByText(/ご家庭の中で安心して使えます/)).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: '保護者の方へのおすすめの関わり方' })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/お子様自身が決めていく領域を少しずつ増やしていく/)
    ).toBeInTheDocument();
    expect(screen.getByText('1. どーなつタイマーの色や形を決める')).toBeInTheDocument();
    expect(screen.getByText('2. 画像（アイコン）を決める')).toBeInTheDocument();
    expect(screen.getByText('3. ごほうびを決める')).toBeInTheDocument();
    expect(screen.getByText('4. やることの時間を決める')).toBeInTheDocument();
    expect(screen.getByText('5. やることを決める')).toBeInTheDocument();
    expect(screen.getByText(/「この後なにをするんだっけ？」/)).toBeInTheDocument();
    expect(screen.getByText(/「自分で決める経験」を増やしていく/)).toBeInTheDocument();
  });

  it('calls onBack when the back button is pressed', () => {
    const onBack = vi.fn();
    render(<ParentGuidePage onBack={onBack} />);

    fireEvent.click(screen.getByRole('button', { name: 'やることリスト選択へ戻る' }));

    expect(onBack).toHaveBeenCalled();
  });
});

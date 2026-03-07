import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ParentGuidePage } from './ParentGuidePage';

describe('ParentGuidePage', () => {
  it('shows parent-facing concept and feature sections', () => {
    render(<ParentGuidePage onBack={vi.fn()} />);

    expect(screen.getByText('保護者向けガイド')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'コンセプト' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'できること' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '安心して使える点' })).toBeInTheDocument();
    expect(screen.getByText(/お子様が目標に対して前向きに取り組む/)).toBeInTheDocument();
    expect(screen.getByText(/ポジティブなコミュニケーション/)).toBeInTheDocument();
    expect(screen.getByText(/自己決定理論/)).toBeInTheDocument();
    expect(screen.getByText(/お子様が自ら目標を選んだり決めたりする補助/)).toBeInTheDocument();
    expect(screen.getByText('時間が見えるビジュアルタイマー')).toBeInTheDocument();
    expect(screen.getByText(/設定画面もお子様が関わりやすい見た目/)).toBeInTheDocument();
    expect(screen.getByText(/できたことをしっかりほめる伴走役/)).toBeInTheDocument();
    expect(screen.getByText(/ご家庭の中で安心して使えます/)).toBeInTheDocument();
  });

  it('calls onBack when the back button is pressed', () => {
    const onBack = vi.fn();
    render(<ParentGuidePage onBack={onBack} />);

    fireEvent.click(screen.getByRole('button', { name: 'やることリスト選択へ戻る' }));

    expect(onBack).toHaveBeenCalled();
  });
});

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DonutTimer } from './DonutTimer';

describe('DonutTimer', () => {
  it('単一のチャンク（5分以下）が正しく表示されること', () => {
    render(<DonutTimer totalSeconds={180} elapsedSeconds={60} />);
    // DonutTimerGroup が存在することを確認
    expect(screen.getByTestId('donut-timer-group')).toBeInTheDocument();

    // 1つのタイマーチャンクが表示されていること
    const chunks = screen.getAllByTestId('timer-chunk');
    expect(chunks).toHaveLength(1);
  });

  it('複数のチャンク（5分超）が正しく表示されること', () => {
    render(<DonutTimer totalSeconds={600} elapsedSeconds={0} />);
    const chunks = screen.getAllByTestId('timer-chunk');
    expect(chunks).toHaveLength(2);
  });

  it('10個以上のチャンクがある場合、「...」が表示されること', () => {
    render(<DonutTimer totalSeconds={3300} elapsedSeconds={0} />);
    expect(screen.getByTestId('donut-timer-more')).toBeInTheDocument();

    // 表示されるのは 9個 (MAX_DISPLAY_CHUNKS - 1)
    const chunks = screen.getAllByTestId('timer-chunk');
    expect(chunks).toHaveLength(9);
  });

  it('時間超過（isOverdue=true）の時にスタイルが適用されること', () => {
    const { container } = render(
      <DonutTimer totalSeconds={300} elapsedSeconds={400} isOverdue={true} />
    );
    // TimerChunk 内の要素に overdue クラスが含まれていることを確認
    // クラス名は CSS Modules により動的だが、属性セレクタで確認
    const overdueElement = container.querySelector('[class*="overdue"]');
    expect(overdueElement).toBeInTheDocument();
  });
});

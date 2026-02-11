import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DonutTimer } from './DonutTimer';

describe('DonutTimer', () => {
  it('should render a single chunk correctly for durations of 5 minutes or less', () => {
    // 5分以下の時に単一のチャンクが正しく表示されること
    render(<DonutTimer totalSeconds={180} elapsedSeconds={60} />);
    // DonutTimerGroup exists
    expect(screen.getByTestId('donut-timer-group')).toBeInTheDocument();

    // One timer chunk is displayed
    const chunks = screen.getAllByTestId('timer-chunk');
    expect(chunks).toHaveLength(1);
  });

  it('should render multiple chunks correctly for durations exceeding 5 minutes', () => {
    // 5分超の時に複数のチャンクが正しく表示されること
    render(<DonutTimer totalSeconds={600} elapsedSeconds={0} />);
    const chunks = screen.getAllByTestId('timer-chunk');
    expect(chunks).toHaveLength(2);
  });

  it('should display an ellipsis (...) when there are more than 10 chunks', () => {
    // 10個以上のチャンクがある場合、「...」が表示されること
    render(<DonutTimer totalSeconds={3300} elapsedSeconds={0} />);
    expect(screen.getByTestId('donut-timer-more')).toBeInTheDocument();

    // 9 chunks are displayed (MAX_DISPLAY_CHUNKS - 1)
    const chunks = screen.getAllByTestId('timer-chunk');
    expect(chunks).toHaveLength(9);
  });

  it('should apply overdue styles when isOverdue is true', () => {
    // 時間超過（isOverdue=true）の時にスタイルが適用されること
    const { container } = render(
      <DonutTimer totalSeconds={300} elapsedSeconds={400} isOverdue={true} />
    );
    // Check if element in TimerChunk contains overdue class (using attribute selector for CSS Modules)
    const overdueElement = container.querySelector('[class*="overdue"]');
    expect(overdueElement).toBeInTheDocument();
  });
});

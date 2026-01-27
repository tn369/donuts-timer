import { describe, expect, it } from 'vitest';

import { formatTime } from './time';

describe('formatTime', () => {
  it('formats positive seconds as MM:SS', () => {
    expect(formatTime(90)).toBe('1:30');
  });

  it('formats negative seconds with a minus sign', () => {
    expect(formatTime(-45)).toBe('-0:45');
  });

  it('formats zero seconds', () => {
    expect(formatTime(0)).toBe('0:00');
  });
});

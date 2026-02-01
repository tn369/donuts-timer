import '@testing-library/jest-dom';
import { vi } from 'vitest';

vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}));

class MockAudioContext {
  public destination = {};

  createOscillator() {
    return {
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      frequency: { value: 0 },
      type: 'sine',
    };
  }

  createGain() {
    return {
      connect: vi.fn(),
      gain: { value: 1 },
    };
  }
}

Object.defineProperty(window, 'AudioContext', {
  writable: true,
  value: MockAudioContext,
});

Object.defineProperty(window, 'webkitAudioContext', {
  writable: true,
  value: MockAudioContext,
});

const createCanvasContextStub = () =>
  ({
    drawImage: vi.fn(),
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    closePath: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    scale: vi.fn(),
    rotate: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    rect: vi.fn(),
    fillText: vi.fn(),
    measureText: vi.fn(() => ({ width: 0 })),
  }) as unknown as CanvasRenderingContext2D;

vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() =>
  createCanvasContextStub()
);

vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue('');

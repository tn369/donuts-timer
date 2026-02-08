import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { TimerColor, TimerShape, TodoList } from '../../types';
import { MainTimerHeaderControls } from './MainTimerHeaderControls';

describe('MainTimerHeaderControls', () => {
  const defaultProps = {
    showSelectionButton: true,
    onBackToSelection: vi.fn(),
    isSiblingMode: false,
    isRunning: false,
    startTimer: vi.fn(),
    stopTimer: vi.fn(),
    setShowResetConfirm: vi.fn(),
    canStartOrStop: true,
    fastForward: vi.fn(),
    timerSettings: { shape: 'circle' as TimerShape, color: 'blue' as TimerColor },
    setTimerSettings: vi.fn(),
    activeList: {
      id: 'test-list',
      name: 'Test List',
      title: 'Test List',
      tasks: [],
      targetTimeSettings: { mode: 'duration', targetHour: 0, targetMinute: 0 },
    } as unknown as TodoList,
    onEditSettings: vi.fn(),
    onEnterSiblingMode: vi.fn(),
    onExitSiblingMode: vi.fn(),
  };

  it('レンダリングされること', () => {
    render(<MainTimerHeaderControls {...defaultProps} />);
    expect(screen.getByLabelText(/リストをえらびなおす/)).toBeInTheDocument();
    expect(screen.getByLabelText(/タイマーのかたちをかえる/)).toBeInTheDocument();
    expect(screen.getByLabelText(/タイマーのいろをかえる/)).toBeInTheDocument();
    expect(screen.getByLabelText(/メニューをひらく/)).toBeInTheDocument();

    // 初期状態ではメニュー内のボタンは見えない
    expect(screen.queryByLabelText(/ふたりモードにきりかえる/)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/リストのせってい/)).not.toBeInTheDocument();
  });

  it('「もどる」ボタンをクリックすると onBackToSelection が呼ばれること', () => {
    render(<MainTimerHeaderControls {...defaultProps} />);
    fireEvent.click(screen.getByLabelText(/リストをえらびなおす/));
    expect(defaultProps.onBackToSelection).toHaveBeenCalled();
  });

  it('形変更ボタンをクリックすると setTimerSettings が呼ばれること', () => {
    render(<MainTimerHeaderControls {...defaultProps} />);
    fireEvent.click(screen.getByLabelText(/タイマーのかたちをかえる/));
    expect(defaultProps.setTimerSettings).toHaveBeenCalled();
  });

  it('色変更ボタンをクリックすると setTimerSettings が呼ばれること', () => {
    render(<MainTimerHeaderControls {...defaultProps} />);
    fireEvent.click(screen.getByLabelText(/タイマーのいろをかえる/));
    expect(defaultProps.setTimerSettings).toHaveBeenCalled();
  });

  it('メニューを開いてふたりモード切り替えボタンをクリックすると onEnterSiblingMode が呼ばれること', () => {
    render(<MainTimerHeaderControls {...defaultProps} />);

    // メニューを開く
    fireEvent.click(screen.getByLabelText(/メニューをひらく/));

    fireEvent.click(screen.getByLabelText(/ふたりモードにきりかえる/));
    expect(defaultProps.onEnterSiblingMode).toHaveBeenCalled();
  });

  it('ふたりモード中、メニューを開いてひとりモードに戻るボタンをクリックすると onExitSiblingMode が呼ばれること', () => {
    render(<MainTimerHeaderControls {...defaultProps} isSiblingMode={true} />);

    // メニューを開く
    fireEvent.click(screen.getByLabelText(/メニューをひらく/));

    fireEvent.click(screen.getByLabelText(/ひとりモードにもどす/));
    expect(defaultProps.onExitSiblingMode).toHaveBeenCalled();
  });

  it('メニューを開いて設定ボタンをクリックすると onEditSettings が呼ばれること', () => {
    render(<MainTimerHeaderControls {...defaultProps} />);

    // メニューを開く
    fireEvent.click(screen.getByLabelText(/メニューをひらく/));

    fireEvent.click(screen.getByLabelText(/リストのせってい/));
    expect(defaultProps.onEditSettings).toHaveBeenCalledWith('test-list');
  });

  it('メニューを開いてリセットボタンをクリックすると setShowResetConfirm が呼ばれること', () => {
    render(<MainTimerHeaderControls {...defaultProps} />);

    // メニューを開く
    fireEvent.click(screen.getByLabelText(/メニューをひらく/));

    fireEvent.click(screen.getByLabelText(/リセットする/));
    expect(defaultProps.setShowResetConfirm).toHaveBeenCalledWith(true);
  });

  it('isSiblingMode が false の時、スタートボタンが表示されること', () => {
    render(<MainTimerHeaderControls {...defaultProps} />);
    expect(screen.getByText('スタート')).toBeInTheDocument();
  });

  it('isSiblingMode が true の時も、スタートボタンが表示されること', () => {
    render(<MainTimerHeaderControls {...defaultProps} isSiblingMode={true} />);
    expect(screen.getByText('スタート')).toBeInTheDocument();
  });

  it('コンパクト表示（isCompact=true）の時、メニュー内に「ふたりモードにきりかえる」が表示されないこと', () => {
    render(<MainTimerHeaderControls {...defaultProps} isCompact={true} />);

    // メニューを開く
    fireEvent.click(screen.getByLabelText(/メニューをひらく/));

    expect(screen.queryByLabelText(/ふたりモードにきりかえる/)).not.toBeInTheDocument();
  });

  it('コンパクト表示（isCompact=true）であっても、すでにふたりモード（isSiblingMode=true）なら「ひとりモードにもどす」が表示されること', () => {
    render(<MainTimerHeaderControls {...defaultProps} isCompact={true} isSiblingMode={true} />);

    // メニューを開く
    fireEvent.click(screen.getByLabelText(/メニューをひらく/));

    expect(screen.getByLabelText(/ひとりモードにもどす/)).toBeInTheDocument();
  });
});

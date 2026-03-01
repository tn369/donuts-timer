import { render, screen } from '@testing-library/react';
import type { Dispatch, SetStateAction } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import App from './App';
import type { CurrentScreen, SettingsSource } from './hooks/useAppScreen';
import { useAppScreen } from './hooks/useAppScreen';
import { useTodoLists } from './hooks/useTodoLists';
import type { TodoList } from './types';

const listA: TodoList = {
  id: 'list-a',
  title: 'A',
  tasks: [],
  targetTimeSettings: { mode: 'duration', targetHour: 0, targetMinute: 0 },
};

const listB: TodoList = {
  id: 'list-b',
  title: 'B',
  tasks: [],
  targetTimeSettings: { mode: 'duration', targetHour: 0, targetMinute: 0 },
};

const mainTimerViewMock = vi.fn();
const todoListSelectionMock = vi.fn();
const todoListSettingsMock = vi.fn();

vi.mock('./components/timer/MainTimerView', () => ({
  MainTimerView: (props: unknown) => {
    mainTimerViewMock(props);
    return <div data-testid="main-timer-view" />;
  },
}));

vi.mock('./components/task/TodoListSelection', () => ({
  TodoListSelection: (props: unknown) => {
    todoListSelectionMock(props);
    return <div data-testid="todo-list-selection" />;
  },
}));

vi.mock('./components/task/TodoListSettings', () => ({
  TodoListSettings: (props: unknown) => {
    todoListSettingsMock(props);
    return <div data-testid="todo-list-settings" />;
  },
}));

vi.mock('./hooks/useAppScreen', () => ({
  useAppScreen: vi.fn(),
}));

vi.mock('./hooks/useTodoLists', () => ({
  useTodoLists: vi.fn(),
}));

const defaultAppScreen: {
  backFromSettings: () => void;
  backToSelection: () => void;
  currentScreen: CurrentScreen;
  editingListId: string | null;
  setCurrentScreen: Dispatch<SetStateAction<CurrentScreen>>;
  setEditingListId: Dispatch<SetStateAction<string | null>>;
  setSettingsSource: Dispatch<SetStateAction<SettingsSource>>;
  settingsSource: SettingsSource;
  showSettings: (listId: string, source: SettingsSource) => void;
} = {
  backFromSettings: vi.fn(),
  backToSelection: vi.fn(),
  currentScreen: 'main',
  editingListId: null,
  setCurrentScreen: vi.fn(),
  setEditingListId: vi.fn(),
  setSettingsSource: vi.fn(),
  settingsSource: 'selection',
  showSettings: vi.fn(),
};

const defaultTodoLists = {
  activeLists: [listA],
  addNewList: vi.fn(),
  clearActiveList: vi.fn(),
  copyList: vi.fn(),
  createTemporaryList: vi.fn(() => listA),
  deleteList: vi.fn(),
  duplicateActiveListForSiblingMode: vi.fn(),
  exitSiblingMode: vi.fn(),
  getAllUniqueIcons: vi.fn(() => []),
  isSiblingMode: false,
  reorderTodoLists: vi.fn(),
  saveList: vi.fn(),
  selectList: vi.fn(),
  selectSiblingLists: vi.fn(),
  todoLists: [listA, listB],
};

const makeAppScreenState = (
  overrides: Partial<ReturnType<typeof useAppScreen>> = {}
): ReturnType<typeof useAppScreen> => ({
  ...defaultAppScreen,
  ...overrides,
});

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders single timer view with single mode', () => {
    vi.mocked(useAppScreen).mockReturnValue(makeAppScreenState());
    vi.mocked(useTodoLists).mockReturnValue(defaultTodoLists);

    render(<App />);

    expect(screen.getByTestId('main-timer-view')).toBeInTheDocument();
    expect(mainTimerViewMock).toHaveBeenCalledTimes(1);
    expect(mainTimerViewMock).toHaveBeenCalledWith(
      expect.objectContaining({
        initialList: listA,
        timerMode: 'single',
      })
    );
  });

  it('renders two timer views in sibling mode with sibling timer modes', () => {
    vi.mocked(useAppScreen).mockReturnValue(makeAppScreenState());
    vi.mocked(useTodoLists).mockReturnValue({
      ...defaultTodoLists,
      isSiblingMode: true,
      activeLists: [listA, listB],
    });

    render(<App />);

    expect(screen.getAllByTestId('main-timer-view')).toHaveLength(2);
    expect(mainTimerViewMock).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        initialList: listA,
        timerMode: 'sibling-0',
        isSiblingMode: true,
      })
    );
    expect(mainTimerViewMock).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        initialList: listB,
        timerMode: 'sibling-1',
        isSiblingMode: true,
        showSelectionButton: false,
      })
    );
  });

  it('renders list selection screen when current screen is selection', () => {
    vi.mocked(useAppScreen).mockReturnValue(
      makeAppScreenState({
        currentScreen: 'selection',
      })
    );
    vi.mocked(useTodoLists).mockReturnValue(defaultTodoLists);

    render(<App />);

    expect(screen.getByTestId('todo-list-selection')).toBeInTheDocument();
    expect(mainTimerViewMock).not.toHaveBeenCalled();
  });

  it('renders settings screen for editing list', () => {
    vi.mocked(useAppScreen).mockReturnValue(
      makeAppScreenState({
        currentScreen: 'settings',
        editingListId: 'list-a',
      })
    );
    vi.mocked(useTodoLists).mockReturnValue(defaultTodoLists);

    render(<App />);

    expect(screen.getByTestId('todo-list-settings')).toBeInTheDocument();
    expect(todoListSettingsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        list: listA,
      })
    );
  });
});

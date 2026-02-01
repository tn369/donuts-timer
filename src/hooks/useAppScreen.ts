/**
 * アプリケーションの画面遷移状態を管理するカスタムフック
 */
import { useState } from 'react';

import { DEFAULT_TODO_LISTS } from '../constants';
import { loadActiveListId, loadTodoLists, saveActiveListId } from '../storage';

/**
 * 現在表示中の画面
 */
export type CurrentScreen = 'selection' | 'main' | 'settings';
/**
 * 設定画面を開いた元の画面
 */
export type SettingsSource = 'selection' | 'main';

/**
 * 初期表示画面を決定する
 */
const getInitialScreen = (): CurrentScreen => {
  const loadedLists = loadTodoLists(DEFAULT_TODO_LISTS);
  const activeId = loadActiveListId();
  if (activeId) {
    const active = loadedLists.find((list) => list.id === activeId);
    if (active) return 'main';
  }
  return 'selection';
};

/**
 * アプリケーションの画面状態と画面遷移ロジックを管理するフック
 */
export const useAppScreen = () => {
  const [currentScreen, setCurrentScreen] = useState<CurrentScreen>(getInitialScreen);
  const [settingsSource, setSettingsSource] = useState<SettingsSource>('selection');
  const [editingListId, setEditingListId] = useState<string | null>(null);

  /**
   * 設定画面を表示する
   * @param listId 編集するリストのID
   * @param source 設定画面を開いた元の画面
   */
  const showSettings = (listId: string, source: SettingsSource) => {
    setEditingListId(listId);
    setSettingsSource(source);
    setCurrentScreen('settings');
  };

  /**
   * 設定画面から元の画面に戻る
   */
  const backFromSettings = () => {
    setCurrentScreen(settingsSource);
    setEditingListId(null);
  };

  /**
   * リスト選択画面に戻る
   */
  const backToSelection = () => {
    setCurrentScreen('selection');
    setEditingListId(null);
    saveActiveListId(null);
  };

  return {
    backFromSettings,
    backToSelection,
    currentScreen,
    editingListId,
    setCurrentScreen,
    setEditingListId,
    setSettingsSource,
    settingsSource,
    showSettings,
  };
};

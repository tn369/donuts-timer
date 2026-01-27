import { useState } from 'react';

import { loadActiveListId, loadTodoLists, saveActiveListId } from '../storage';

export type CurrentScreen = 'selection' | 'main' | 'settings';
export type SettingsSource = 'selection' | 'main';

const getInitialScreen = (): CurrentScreen => {
  const loadedLists = loadTodoLists();
  const activeId = loadActiveListId();
  if (activeId) {
    const active = loadedLists.find((list) => list.id === activeId);
    if (active) return 'main';
  }
  return 'selection';
};

export const useAppScreen = () => {
  const [currentScreen, setCurrentScreen] = useState<CurrentScreen>(getInitialScreen);
  const [settingsSource, setSettingsSource] = useState<SettingsSource>('selection');
  const [editingListId, setEditingListId] = useState<string | null>(null);

  const showSettings = (listId: string, source: SettingsSource) => {
    setEditingListId(listId);
    setSettingsSource(source);
    setCurrentScreen('settings');
  };

  const backFromSettings = () => {
    setCurrentScreen(settingsSource);
    setEditingListId(null);
  };

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

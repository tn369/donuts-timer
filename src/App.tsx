import { useState } from 'react';
import styles from './App.module.css';

import { TodoListSelection } from './components/TodoListSelection';
import { TodoListSettings } from './components/TodoListSettings';
import { MainTimerView } from './components/MainTimerView';
import type { TodoList } from './types';
import { loadTodoLists, saveTodoLists, loadActiveListId, saveActiveListId } from './storage';
import { v4 as uuid_v4 } from 'uuid';

type CurrentScreen = 'selection' | 'main' | 'settings';

function App() {
  const [todoLists, setTodoLists] = useState<TodoList[]>(() => loadTodoLists());
  const [currentScreen, setCurrentScreen] = useState<CurrentScreen>(() => {
    const loadedLists = loadTodoLists();
    const activeId = loadActiveListId();
    if (activeId) {
      const active = loadedLists.find((l) => l.id === activeId);
      if (active) return 'main';
    }
    return 'selection';
  });
  const [settingsSource, setSettingsSource] = useState<'selection' | 'main'>('selection');
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [isSiblingMode, setIsSiblingMode] = useState<boolean>(false);
  const [activeLists, setActiveLists] = useState<TodoList[]>(() => {
    const loadedLists = loadTodoLists();
    const activeId = loadActiveListId();
    if (activeId) {
      const active = loadedLists.find((l) => l.id === activeId);
      if (active) return [active];
    }
    return [];
  });

  const handleSelectList = (listId: string) => {
    const list = todoLists.find((l) => l.id === listId);
    if (list) {
      setActiveLists([list]);
      saveActiveListId(listId);
      setCurrentScreen('main');
      setIsSiblingMode(false);
    }
  };

  const handleSelectSiblingLists = (id1: string, id2: string) => {
    const list1 = todoLists.find((l) => l.id === id1);
    const list2 = todoLists.find((l) => l.id === id2);
    if (list1 && list2) {
      setActiveLists([list1, list2]);
      setCurrentScreen('main');
      setIsSiblingMode(true);
    }
  };

  const handleEditList = (listId: string) => {
    setEditingListId(listId);
    setSettingsSource('selection');
    setCurrentScreen('settings');
  };

  const handleAddNewList = () => {
    const newList: TodoList = {
      id: uuid_v4(),
      title: 'あたらしいやることリスト',
      tasks: [
        {
          id: uuid_v4(),
          name: 'トイレ',
          icon: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhx0t57NmexW6-RnpAFgwUpiBvrYZPjfX62AoLFuIpHpNtpD17HbGXoL5wYatAlk8kzhiLHfTAmehav2tpdYXtCaXuHl_XYWPNeja-p01TKberrUZFkkC18zLAOJwS0mrRDfhFOgjcMqHU/s400/toilet_boy.png',
          plannedSeconds: 5 * 60,
          kind: 'todo',
          status: 'todo',
          elapsedSeconds: 0,
          actualSeconds: 0,
        },
        {
          id: 'reward-task',
          name: 'あそぶ',
          icon: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiU3bT8Om8wpYNBSphXDy0LAIrNKFvn6ONxElTN90ekuHals49c0dDv8jcCse07zwHauLyKM8hV-DVak1mzOixULI0egb3ZshzoytLn2BLcc1Xk6NRRKITJJbxRS6ZO-SRUKmDSbOC2CYrA/s400/omochabako.png',
          plannedSeconds: 15 * 60,
          kind: 'reward',
          status: 'todo',
          elapsedSeconds: 0,
          actualSeconds: 0,
        },
      ],
      targetTimeSettings: {
        mode: 'duration',
        targetHour: 7,
        targetMinute: 55,
      },
    };
    const updated = [...todoLists, newList];
    setTodoLists(updated);
    saveTodoLists(updated);
    setEditingListId(newList.id);
    setSettingsSource('selection');
    setCurrentScreen('settings');
  };

  const handleDeleteList = (listId: string) => {
    const updated = todoLists.filter((l) => l.id !== listId);
    setTodoLists(updated);
    saveTodoLists(updated);
  };

  const handleSaveList = (updatedList: TodoList) => {
    const updatedLists = todoLists.map((l: TodoList) =>
      l.id === updatedList.id ? updatedList : l
    );
    setTodoLists(updatedLists);
    saveTodoLists(updatedLists);

    // 更新されたリストを表示中なら反映
    setActiveLists((prev) => prev.map((l) => (l.id === updatedList.id ? updatedList : l)));

    setCurrentScreen(settingsSource);
    setEditingListId(null);
  };

  const handleBackToSelection = () => {
    setCurrentScreen('selection');
    setEditingListId(null);
    saveActiveListId(null);
  };

  const handleCopyList = (listId: string) => {
    const original = todoLists.find((l) => l.id === listId);
    if (original) {
      const copy: TodoList = {
        ...original,
        id: uuid_v4(),
        title: `${original.title} (コピー)`,
        tasks: original.tasks.map((task) => ({
          ...task,
          id: task.kind === 'reward' ? 'reward-task' : uuid_v4(),
          status: 'todo',
          elapsedSeconds: 0,
          actualSeconds: 0,
        })),
      };
      const updated = [...todoLists, copy];
      setTodoLists(updated);
      saveTodoLists(updated);
    }
  };

  if (currentScreen === 'selection') {
    return (
      <TodoListSelection
        lists={todoLists}
        onSelect={handleSelectList}
        onSelectSibling={handleSelectSiblingLists}
        onEdit={handleEditList}
        onCopy={handleCopyList}
        onAdd={handleAddNewList}
        onDelete={handleDeleteList}
      />
    );
  }

  if (currentScreen === 'settings' && editingListId) {
    const listToEdit = todoLists.find((l) => l.id === editingListId);
    if (listToEdit) {
      return (
        <TodoListSettings
          list={listToEdit}
          onSave={handleSaveList}
          onBack={() => {
            setCurrentScreen(settingsSource);
            setEditingListId(null);
          }}
        />
      );
    }
  }

  return (
    <div className={styles.app}>
      {isSiblingMode ? (
        <div className={styles.siblingContainer}>
          <div className={styles.siblingItem}>
            <MainTimerView
              key={`sibling-0-${activeLists[0]?.id}`}
              initialList={activeLists[0]}
              onBackToSelection={handleBackToSelection}
              onEditSettings={(id) => {
                setEditingListId(id);
                setSettingsSource('main');
                setCurrentScreen('settings');
              }}
            />
          </div>
          <div className={styles.siblingItem}>
            <MainTimerView
              key={`sibling-1-${activeLists[1]?.id}`}
              initialList={activeLists[1]}
              onBackToSelection={handleBackToSelection}
              onEditSettings={(id) => {
                setEditingListId(id);
                setSettingsSource('main');
                setCurrentScreen('settings');
              }}
              showSelectionButton={false}
            />
          </div>
        </div>
      ) : (
        <MainTimerView
          initialList={activeLists[0]}
          onBackToSelection={handleBackToSelection}
          onEditSettings={(id) => {
            setEditingListId(id);
            setSettingsSource('main');
            setCurrentScreen('settings');
          }}
        />
      )}
    </div>
  );
}

export default App;
